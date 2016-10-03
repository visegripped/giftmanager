<?
//https://developers.google.com/identity/sign-in/web/backend-auth


function googleAuthenticate($req)	{
	$token = $req['id_token'];
	$url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=".$token;
	$gPlusResponse = file_get_contents($url);
// Native PHP object, please
	$jsonResponse = json_decode($gPlusResponse);
	$verifyArray = getGoogleVerifyArray($jsonResponse);

	if(verifyGoogleArray($verifyArray))	{
		$_SESSION['VALID_SESSION'] = 'google';
		$_SESSION['EMAIL'] = $jsonResponse->{'email'};

		$userArray = getUserDetails($jsonResponse->{'email'});
//user account exists. Get their list of parties and any other relevant info.
		if($userArray['email'])	{
			setUserSessionDetails($userArray);
			$response = array_merge(apiMsg(100,$req,"Successfully retrieved user record."),$userArray);
			}
		//false will be returned if the db requests succeeded but no user account was found.
		//TODO -> will need this else if working if new user account creation is needed.
// 		else if($userArray === false)	{
// //look up some info on g+ about the user.
// 			$userinfo = file_get_contents("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=".$token);
// 			$userJSON = json_decode($userinfo);
//
// //hhhmmm... what to do here. Auto create a new user?  for now, yes.
// //when more than one login method is available, we'll need to handle this differently.
// 			$username = explode("@",$_SESSION['EMAIL']);
// 			$addResults = mysql_query("insert into users (email, name, lastname, username, since) values (".qt($_SESSION['EMAIL']).", ".qt($userJSON->{'given_name'}).", ".qt($userJSON->{'family_name'}).", ".qt(substr($username[0],0,20)).", ".qt(date("Y")).")");
// 			if($addResults)	{
// 				$userArray = getUserDetails($jsonResponse->{'email'});
// 				setUserSessionDetails($userArray);
// 				}
// 			else	{
// 				$response = apiMsg(1003,$req,mysql_error());
// 				}
// 			}
		else	{
			//some kind of error occurred while fetching the user details. The contents of $userArray will be the errors.
			$response = $userArray;
			}
		}
	else	{
		//could not verify user.
		$response = apiMsg(5000,$req,mysql_error());
		$response['verify'] = $verifyArray;
		}
	return $response;
	}


	function verifyGoogleKid($kid) {
		$r = false;
		$certResponse = file_get_contents("https://www.googleapis.com/oauth2/v3/certs");
		$certArr = json_decode($certResponse);// Native PHP object, please

		if($kid) {
			foreach($certArr->{'keys'} AS $val) {
					if($val->{'kid'} == $kid) {
						$r = true;
						break;
					}
				}
		}
		return $r;
	}

	function verifyGoogleIss($iss) {
		$r = false;
		if($iss && ($iss == 'accounts.google.com' || $iss == 'https://accounts.google.com')){
			$r = true;
		}
		return $r;
	}

	function verifyGoogleAud($aud) {
		$r = false;
		$creds = getCredsJSArray('google');
		if($aud == $creds['client_id']) {
			$r = true;
		}
		return $r;
	}

	function verifyGoogleArray($verifyArray) {
		$r = false;
		if($verifyArray['clientIdMatch'] && $verifyArray['issMatch'] && $verifyArray['kid']) {
			$r = true;
		}
		return $r;
	}

	function getGoogleVerifyArray($jsonResponse) {
		$r = [];
		$r['clientIdMatch'] = verifyGoogleAud($jsonResponse->{'aud'});
		$r['issMatch'] = verifyGoogleIss($jsonResponse->{'iss'});
		$r['kid'] = verifyGoogleKid($jsonResponse->{'kid'});
		$r['expired'] = $jsonResponse->{'exp'} > 0 ? true : false;
		return $r;
	}

  function setUserSessionDetails($user)	{
  	$_SESSION['USERID'] = $user['userid'];
		$_SESSION['GROUPID'] = '1';
  	}


	function verifyFacebook($clientData, $fbResponse){
			$r = false;
			if($jsonResponse->{'id'} == $clientData['id']) {
				$r = true;
			}
			return $r;
	};

//https://davidwalsh.name/curl-download
	function get_data($url) {
		$ch = curl_init();
		$timeout = 5;
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		$data = curl_exec($ch);
		curl_close($ch);
		return $data;
	}


// facebook instructions:  https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#exchangecode
	function facebookAuthenticate($req)	{

			$creds = getCredsJSArray('facebook');
			//https://developers.facebook.com/docs/graph-api/securing-requests#appsecret_proof
			$appsecret_proof= hash_hmac('sha256',$req['accessToken'],$creds['secret']);

			//$url = "https://graph.facebook.com/v2.7/oauth/access_token?client_id=".$creds['appId']."&token=".$req['accessToken']."&redirect_uri=".$req['redirectUri']."&client_secret=".$creds['secret']."&appsecret_proof=".$appsecret_proof; //&code={code-parameter}
			//$url = "https://graph.facebook.com/v2.5/me?access_token=".$req['accessToken']."&appsecret_proof=".$appsecret_proof;
			//enable the appsecret_proof feature in facebook to help secure the app.
			//https://developers.facebook.com/docs/graph-api/securing-requests
			$url = "https://graph.facebook.com/v2.7/me?fields=email,name,id&access_token=".$req['accessToken']."&appsecret_proof=".$appsecret_proof;

			$fbResponse = get_data($url);
		// Native PHP object, please
			$jsonResponse = json_decode($fbResponse);

			if(verifyFacebook($req,$jsonResponse))	{
				$_SESSION['VALID_SESSION'] = 'facebook';
				$userArray = getUserDetails($jsonResponse->{'email'});
		//user account exists. Get their list of parties and any other relevant info.
				if($userArray['email'])	{
					setUserSessionDetails($userArray);
					$response = array_merge(apiMsg(100,$req,"Successfully retrieved user record."),$userArray);
					}
				else	{
					//some kind of error occurred while fetching the user details. The contents of $userArray will be the errors.
					$response = apiMsg(5001,$req);
					}
				}
			else	{
				//could not verify user.
				$response = apiMsg(5000,$req,mysql_error());
				$response['fbResponse'] = $jsonResponse;
				// $response['url'] = $url;
				}
			return $response;
		}


?>

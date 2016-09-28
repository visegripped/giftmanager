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
  	$_SESSION['USERID'] = $r['userid'];
  	}



?>

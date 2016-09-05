<?php
include "YOUR/PATH/HERE/credentials.php";
//this all needs to be refactored. It's old code ported over to get an MVP up and running.
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
session_start();





function getCredsJSArray($partner,$creds){
	$r;
	if($partner == 'facebook')	{
		$r = $creds['facebook'];
		}
	else if($partner == 'google')	{
		$r = $creds['google'];
		}
	else	{
		$r = null;
		}
	return $r;
	}

function qt($str)	{
	return ("'".mysql_escape_string($str)."'");
	}

function dqt($str)	{
	return stripslashes($str);
	}

function pdoConnect()	{
	$pdo = new PDO('mysql:host=localhost;dbname=:$db_name', $db_username, $db_password);
// the following tells PDO we want it to throw Exceptions for every error.
// this is far more useful than the default mode of throwing php errors
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $pdo;
	}



//error handler.
//The request is passed in instead of this function referencing $_REQUEST directly so that if a pipelined model is ever supported, the error handler consinues to work without modifying every reference to it.
//$m is meta. error specific messaging. not required for any specific error, but used by some.
function apiMsg($msgid,$req,$m='')	{
	$r = array(); //what is returned.


	$messages = array();

	$messages[100] = array("type"=>"success","msg"=>($m ? $m : "CMD ".$req[cmd]." was successful.")); //generic success message. Use $m to customize message (encouraged)

	//1000 = high level errors.
	$messages[999] = array(
		"msg" => "This session is not valid. Please try logging in.", "type" => "error"
		);

	$messages[1000] = array(
		"msg" => "No POST object detected.", "type" => "error"
		);
	$messages[1001] = array(
		"msg" => "Invalid command [".$req['cmd']."] specified.", "type" => "error"
		); //command is not in the list of supported commands.

	$messages[1002] =  array(
		"msg" => "A valid command was passed, however an internal error occured.", "type" => "error"
		); //command is supported, but the corresponding function doesn't exist.
	//1003 would be for a mysql_error.  If the query worked but no results were found (and some were expected) use error 1010.
	$messages[1003] = array(
		"msg" => "The attempt to request/update data to the database has failed. error: ".$m, "type" => "error"
		);

	$messages[1005] = array(
		"msg" => "No command specified.", "type" => "error"
		);
	$messages[1006] = array(
		"msg" => "An unknown error occured.",
		"req" => $req,
		"type" => "error"
		);

	$messages[1007] =  array(
		"msg" =>  "A required parameter was missing. ".$m, "type" => "error"
		);

	$messages[1008] =  array(
		"msg" =>  "A required parameter was invalid. ".$m, "type" => "error"
		);

	$messages[1009] =  array(
		"msg" =>  "Unexpected result set from query. ".$m, "type" => "error"
		);

	$messages[1010] =  array(
		"msg" =>  "No matches found. ".$m, "type" => "error"
		);

//auth related messaging.
	$messages[5000] = array(
		"msg" => "Unable to verify your account with the account provider.",
		"req" => $req,
		"type" => "error"
		);
	$messages[5001] = array(
		"msg" => "No account exists for the email associated with the login. Currently, new accounts can not be created.",
		"req" => $req,
		"type" => "error"
		);


	//2000 = user specific errors.
	$messages[2000] =  array(
		"msg" => "For command user, invalid request method [".$_SERVER['REQUEST_METHOD']."]. Must be get or post.", "type" => "error"
		); //valid error for calls that support GET and POST.

	$messages[2001] =  array(
		"msg" => "For command user, no userid associated with session. User command can only be used on user in focus.", "type" => "error"
		); //valid error for calls that support GET and POST.



	if($messages[$msgid])	{
		$r = $messages[$msgid];
		$r[msgid] = $msgid;
		}
	else	{
		$r['msgid'] = 1;
		$r['error'] = "An unspecified error has occured.  msgid was ".$msgid." which is an unknown error code.";
		}

	$r['cmd'] = $req['cmd'];

	return $r;
	}



$commands = array(
// auth
	"isSessionValid",
	"logout",
	"googleAuthenticate",

//contact
	"websiteInquiry",

//GM
	"userList",
	"giftList",
	"giftCreate"
	);

$response = array(); //what is returned by the API. either a successful response or an error.
$cmd = $_REQUEST['cmd']; //shortcut. change to POST.



//handle some high level errors.
// ### TODO -> commented out for local testing. put this back in prior to release.
//if(!$_SESSION['VALID_SESSION'])	{
//	$response = apiMsg(999,$_REQUEST);
//	}
/*else*/if($cmd && in_array($cmd,$commands))	{
	//command is valid.
	if(function_exists($cmd))	{
		$response = $cmd($_REQUEST);
		}
	else	{
		$response = apiMsg(1002,$_REQUEST);
		}
	}
elseif(!$cmd)	{
	$response = apiMsg(1005,$_REQUEST);
	}
//to get here, the cmd IS specified but not in the commands array
elseif($cmd)	{
	$response = apiMsg(1001,$_REQUEST);
	}
elseif(!$_REQUEST)	{
	$response = apiMsg(1000,$_REQUEST);
	}
else	{
	$response = apiMsg(1006,$_REQUEST);
	}


// NOTE -> when it comes time to set db request where vars are used, use this tutorial:
//http://stackoverflow.com/questions/159924/how-do-i-loop-through-a-mysql-query-via-pdo-in-php
// help for insert/update:
// http://www.phpeveryday.com/articles/PDO-Insert-and-Update-Statement-Use-Prepared-Statement-P552.html

function userList($req)	{
	$db = pdoConnect();
	$sql = "";
	$stmt = $db->prepare("SELECT * FROM users WHERE groupid=:groupid");
	$stmt->bindValue(":groupid", $_SESSION['GROUPID'] || 1);  //WARNING! the '1' is here just for testing.
	if ($stmt->execute()) {
		$response = apiMsg(100,$req,"");
		$response['users'] = array();
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$response['users'][] = $row;
			}
		}
	else {
		$response = apiMsg(1003,$req,$stmt->errorInfo());
		}
	$db = null; //closes the connection.
	return $response;
	}

//http://coursesweb.net/php-mysql/integer-float-value-select-pdo-string-numeric_t
function preserveType($row)	{
	foreach($row AS $k=>$v) {
		if(is_numeric($v)) $row[$k] = $v + 0;
		}
	return $row;
	}


//what a user would see when they are looking at someone elses list.
function giftList($req)	{
	$db = pdoConnect();
	//if no viewid is specified, the list for the user logged in will be returned.
	if($_REQUEST['viewid'])	{
		$viewid = $_REQUEST['viewid'];
		}
	else	{
		$viewid = $_SESSION['USERID'] || 1; //WARNING! the '1' is here just for testing.
		}
//groupID is set here so that only users/gifts from the same group can be accessed.
//removed items are not shown unless they've been flagged as purchased or reserved.
	$stmt = $db->prepare("SELECT * FROM gifts WHERE userid=:userid and groupid=:groupid and (received_on >= now() or received_on = 0) and (removed = 0 or status > 0)");
	$stmt->bindValue(":userid", $viewid);
	$stmt->bindValue(":groupid", $_SESSION['GROUPID'] ||  1);  //WARNING! the '1' is here just for testing.
	if ($stmt->execute()) {
		$response = apiMsg(100,$req,"");
		$response['gifts'] = array();
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$response['gifts'][] = preserveType($row);
			}
		}
	else {
		$response = apiMsg(1003,$req,$stmt->errorInfo());
		}

	$db = null; //closes the connection.
	return $response;
	}

function giftCreate($req)	{
	if($req['recipient'] && $req['name'])	{
		$db = pdoConnect();
		$sql = "INSERT INTO gifts (userid,name,link,note,remove_on,qty,added_by) VALUES (:userid,:name,:link,:note,:remove_on,:qty,:added_by)";
		$remove_on = ($req['remove_on']) ? date("Y-m-d H:i:s", strtotime($req['remove_on'])) : 0;
		if($req['qty'])	{$qty = $req['qty'];}
		else	{
			$qty = ($_SESSION['USERID'] == $req['recipient']) ? 0 : 1; //a user adding an item to their own list with a blank quantity is 'infinite'. Adding an item to another persons list defaults to 1.
			}
		$q = $db->prepare($sql);
		$q->execute(array(':userid'=>$req['recipient'],
			':name'=>$req['name'],
			':link'=>$req['link'] || '',
			':note'=>$req['note'] || '',
			':remove_on'=>$remove_on,
			':qty'=>$qty,
			':added_by'=>1 //###TODO -> this should be session-> userid
			));
		$response = apiMsg(100,$req,"Gift added to list.");
		$db = null;
		}
	else	{
		$response = apiMsg(1007,$req,"Both recipient and a gift name are required.");
		}
	return $response;
	}

function results2array($r)	{
	$rows = array();
	$i = 0;
	while($game = mysql_fetch_assoc($r))	{
		$rows[$i] = $game;
		$i++;
		}
	return $rows;
	}

function websiteInquiry($req)	{
	$msg = $req['message']."\n";
	$msg .= "phone: ".$req['phone']."\n";
	$msg .= "userid: ".$_SESSION['USERID']."\n";
	$msg .= "email: ".$_SESSION['EMAIL']."\n";
	$msg .= "partyid: ".$_SESSION['PARTYID']."\n";
	$msg .= "parties: ".$_SESSION['PARTIES']."\n";
	$msg .= "confirm: ".$_SESSION['CONFIRM']."\n";
	mail("visegripped@gmail.com","Inquiry from Visegripped.com (football pool)",$msg,"From: ".($_SESSION['EMAIL'] || "footballpool@visegripped.com")."\r\n");
	return apiMsg(100,$req,"Your message has been sent.");
	}

function setUserSessionDetails($user)	{
	$_SESSION['GROUPID'] = $r['groupid'];
	$_SESSION['USERID'] = $r['userid'];
	}

function getUserDetails($email)	{
	$db = pdoConnect();
	$stmt = $db->prepare("SELECT * FROM users WHERE email=:email");
	$stmt->bindValue(":email", $email);
	$r = false;
	if ($stmt->execute()) {
		$count = $stmt->rowCount();
		if($count == 1)	{
			$r = $stmt->fetch(PDO::FETCH_ASSOC);
			}
		else	{
			$r = false;
			}
		}
	return $r;
	}


function googleAuthenticate($req)	{
	$token = $req['access_token'];
	$url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=".$token;
	$gPlusResponse = file_get_contents($url);
// Native PHP object, please
	$jsonResponse = json_decode($gPlusResponse);
	if($jsonResponse->{'expires_in'} > 0)	{
		$_SESSION['VALID_SESSION'] = 'google';
		$_SESSION['EMAIL'] = $jsonResponse->{'email'};

		$userArray = getUserDetails($jsonResponse->{'email'});
//user account exists. Get their list of parties and any other relevant info.
		if($userArray)	{
			setUserSessionDetails($userArray);
			$response = apiMsg(100,$req,"Successfully retrieved user record.");
			$response['user'] = $userArray;
			}
		//false will be returned if the db requests succeeded but no user account was found.
		else if($userArray === false)	{
			$response = apiMsg(5001,$req,"");
//look up some info on g+ about the user.
//			$userinfo = file_get_contents("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=".$token);
//			$userJSON = json_decode($userinfo);
//hhhmmm... what to do here. Auto create a new user?  for now, yes.
//when more than one login method is available, we'll need to handle this differently.
//			$username = explode("@",$_SESSION['EMAIL']);
//			$addResults = mysql_query("insert into users (email, name, lastname, groupid) values (".qt($_SESSION['EMAIL']).", ".qt($userJSON->{'given_name'}).", ".qt($userJSON->{'family_name'}).", ".qt(substr($username[0],0,20)).", ".qt(date("Y")).")");
//			if($addResults)	{
//				$userArray = getUserDetails($jsonResponse->{'email'});
//				setUserSessionDetails($userArray);
//				}
//			else	{
//				$response = apiMsg(1003,$req,mysql_error());
//				}
			}
		else	{
			//some kind of error occurred while fetching the user details. The contents of $userArray will be the errors.
			$response = $userArray;
			}
		}
	else	{
		//could not verify user.
		$response = apiMsg(5000,$req,mysql_error());
		}
	return $response;
	}




//nothing but pure data is returned unless an error occurs.
print_r(json_encode($response));
?>

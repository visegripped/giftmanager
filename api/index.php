<?php
session_start();
header('Content-Type: application/json; Charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
include "/home/vicegrip/includes/gm/db_functions.php";
include "/home/vicegrip/includes/gm/credentials.php";
include "/home/vicegrip/www/gm/auth.php";
//
// $status[0] = 'none';
// $status[2] = 'reserved';
// $status[10] = 'purchased';
// $status[50] = 'cancelled';
//
// remove is set to 1 if a user removes the item from their own list
// remove is set to 2 if an item is added to another users list (if I add an item to patricks) and status is set to purchased.  This is done so that we can NOT show items added to another persons list (like if patrick is looking at his own list).
//
// I'm lazy.  Archive is set to 1 for old items.


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





	if($messages[$msgid])	{
		$r = $messages[$msgid];
		$r[msgid] = $msgid;
		$r["sessionID"] = $_SESSION["USERID"];
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
	"logout",
	"googleAuthenticate",
	"facebookAuthenticate",

//contact
	"websiteInquiry",

//GM
	"userList",
	"giftList",
	"giftListCreate",
	"giftListUpdate",
	"giftListStatus"
	);

$response = array(); //what is returned by the API. either a successful response or an error.
$cmd = $_REQUEST['cmd']; //shortcut.

//When the api is refactored, the commands array should contain properties about what is required.  ex: 'logout' : {'requiresSession' : false}
function commandRequiresSession($command) {
	$r = true;
	if($command == 'logout' || $command == 'googleAuthenticate' || $command == 'facebookAuthenticate') {
		$r = false;
	}
	return $r;
}

function commandIsValid($command,$commandArr) {
	$r = false;
	if($command && in_array($command,$commandArr) && function_exists($command)) {
		$r = true;
	}
	return $r;
}

//handle some high level errors.
// ### TODO -> commented out for local testing. put this back in prior to release.
if(commandIsValid($cmd,$commands))	{
		if(commandRequiresSession($cmd) && $_SESSION['USERID']) {
			$response = $cmd($_REQUEST);
		}
		else if(!commandRequiresSession($cmd)) {
			$response = $cmd($_REQUEST);
		}
		else {
			$response = apiMsg(999,$_REQUEST);
		}
	}
elseif(!$cmd)	{
	$response = apiMsg(1005,$_REQUEST);
	}
elseif(!function_exists($cmd)) {
	$response = apiMsg(1002,$_REQUEST);
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
	//### TODO -> need to handle error here.
	$db = null; //closes the connection.
	return $response;
	}


function preserveType($row)	{
	foreach($row AS $k=>$v) {
		if(is_numeric($v)) $row[$k] = $v + 0;
		}
	return $row;
	}

	function giftListUpdate($req){
		$db = pdoConnect();

		$stmt = $db->prepare("update vicegrip_family.gifts set status=:status where itemid=:itemid");
		$stmt->bindValue(":itemid", $_REQUEST['itemid']);
		$stmt->bindValue(":status", $_REQUEST['status']);

		if ($stmt->execute()) {
			$response = apiMsg(100,$req,"");
			$response['item'] = getItemByID($_REQUEST['itemid']);
		}

		return $response;
	}

//TODO -> too much if/else logic here. refactor this code so there's one if/else (userid == session.userid) and then split out to separate functions.
function giftListGet($req) {
	//if no viewid is specified, the list for the user logged in will be returned.
	if($_REQUEST['viewid'])	{
			$db = pdoConnect();
			$viewid = $_REQUEST['viewid'];
			$removeTS = time() - (1 * 24 * 60 * 60);

			$query = "SELECT itemid, item_name, item_link, item_desc, remove, remove_date ";
			if($viewid != $_SESSION['USERID']) {
					$query .= ", status , buy_userid"; //this info is only pertinent if you are looking at another users list. Otherwise, you can find out what you are getting
			}
			$query .= " FROM gifts WHERE ";

			if($viewid == $_SESSION['USERID']) {
					$query .= " (remove_date > :oneDayOldTS OR remove_date = 0)  "; //when a user is looking at their own list, don't show items that were flagged as 'remove' more than 24 hours ago.
					$query .= ' AND remove != 2 '; //Don't show items that were added to this user's list by another user.
			}
//removed items are not shown for another users list unless they've been flagged as purchased or reserved.
			else {
					$query .= " (remove = 0 OR (status >= 1  AND remove >= 1)) ";
			}

			$query .= " AND userid=:userid AND archive != 1 ";

			if($viewid == $_SESSION['USERID']) {
					$query .= ' ORDER BY status DESC'; //only order by status when looking at another users list or it'll indicate to the active user what has been purchased for them.
			}
			else {
					$query .= ' ORDER BY item_name ASC'; //only order by status when looking at another users list or it'll indicate to the active user what has been purchased for them.
			}

			$stmt = $db->prepare($query);
			$stmt->bindValue(":userid", $viewid);
			if($viewid == $_SESSION['USERID']) {
					$stmt->bindValue(":oneDayOldTS", $removeTS);
			}

			if ($stmt->execute()) {
//				echo "got into the execute!";
					$response = apiMsg(100,$req,"");
					//$result = $stmt->fetchAll(); //this returned the contents of each item in a row twice, once an an array and once as an object.
					//$response['itemCount'] = $stmt->rowCount();
					$response['removeTS'] = $removeTS;
					$response['gifts'] = array();
					//if($response['itemCount'] > 0) {
						//$response['gifts'] = $result;
							while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
	 								$response['gifts'][] = preserveType($row);
	 						}
					//}
					$response['viewid'] = $viewid;
			} else {
					$response = apiMsg(1003,$req,"query = ".$query); //todo -> take query out prior to release
			}
			$db = null; //closes the connection.
		}
		else {
				$response = apiMsg(1007,$req,"viewid is required.");
		}

	return $response;
}

function giftListPost($req){
	$db = pdoConnect();

	$stmt = $db->prepare("update vicegrip_family.gifts set remove=:remove, remove_date = :remove_date where itemid=:itemid");
	$stmt->bindValue(":itemid", $_REQUEST['itemid']);
	$stmt->bindValue(":remove", $_REQUEST['remove']);
	$stmt->bindValue(":remove_date",time());

	$results = $stmt->execute();

	if ($results) {
		$response = apiMsg(100,$req,"");
		$response['item'] = getItemByID($_REQUEST['itemid']);
//		$response['stuff'] = $results->fetch());
	}

	return $response;
}


function getItemByID($itemid) {
	$r; //what is returned. either nothing or an item object.
	if(itemid) {
		$db = pdoConnect();
		$stmt = $db->prepare("SELECT * FROM gifts WHERE itemid=:itemid");
		$stmt->bindValue(":itemid", $itemid);
	//	$stmt->bindValue(":groupid", $_SESSION['GROUPID'] ||  1);  //WARNING! the '1' is here just for testing.
		if ($stmt->execute()) {
			$r = $stmt->fetch(PDO::FETCH_ASSOC);
			}
		$db = null; //closes the connection.
	}
	else {
		$r = null;
	}
	return $r;
}


//what a user would see when they are looking at someone elses list.
function giftList($req)	{
	$method = $_SERVER['REQUEST_METHOD'];
	$response;
	switch ($method) {
		case 'GET':
			$response = giftListGet($req);
			break;
		case 'POST':
			$response =giftListPost($req);
			break;

		default:
			//throw unsupported method type error.
			break;
	}
	return $response;
}

function giftListCreate($req)	{
	if($req['subjectUID'] && $req['item_name'])	{
		$db = pdoConnect();
		$sql = "INSERT INTO gifts (userid,item_name,item_link,item_desc,remove,create_date,buy_userid,status) VALUES (:userid,:name,:link,:item_desc,:remove,:create_date,:buy_userid,:status)";
		$q = $db->prepare($sql);
		$q->execute(array(
			':userid'=>$req['subjectUID'], //TODO -> rename this to recipient
			':name'=>$req['item_name'],
			':link'=>$req['item_link'],
			':item_desc'=>$req['item_desc'],
			':remove'=> ($_SESSION['USERID'] == $req['subjectUID']) ? 0 : 2,   //when adding to another users list, ensure it doesn't show up on their UI
			':status'=> ($_SESSION['USERID'] == $req['subjectUID']) ? 0 : 10,  //when adding an item to another users list, add as purchased.
			':create_date'=>"",
			':buy_userid'=> $_SESSION['USERID']
			));
		$itemid = $db->lastInsertId();
		$response = apiMsg(100,$req,"Gift added to list.");
		$response['item'] = getItemByID($itemid);
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


//nothing but pure data is returned unless an error occurs.
print_r(json_encode($response));
?>

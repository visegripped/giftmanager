<?php
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
session_start();
include "/home/vicegrip/includes/2014/db_functions.php";
include "/home/vicegrip/includes/2014/credentials.php";


$THIS_SEASON = 2014;

$teams = array();
$teams[arizona] = 'Arizona Cardinals';
$teams[atlanta] = 'Atlanta Falcons';
$teams[baltimore] = 'Baltimore Ravens';
$teams[buffalo] = 'Buffalo Bills';
$teams[carolina] = 'Carolina Panthers';
$teams[chicago] = 'Chicago Bears';
$teams[cincinnati] = 'Cincinnati Bengals';
$teams[cleveland] = 'Cleveland Browns';
$teams[dallas] = 'Dallas Cowboys';
$teams[denver] = 'Denver Broncos';
$teams[detroit] = 'Detroit Lions';
$teams[greenbay] = 'Green Bay Packers';
$teams[houston] = 'Houston Texans';
$teams[indianapolis] = 'Indianapolis Colts';
$teams[jacksonville] = 'Jacksonville Jaguars';
$teams[kansascity] = 'Kansas City Chiefs';
$teams[miami] = 'Miami Dolphins';
$teams[minnesota] = 'Minnesota Vikings';
$teams[newengland] = 'New England Patriots';
$teams[neworleans] = 'New Orleans Saints';
$teams[nyg] = 'New York Giants';
$teams[nyj] = 'New York Jets';
$teams[oakland] = 'Oakland Raiders';
$teams[philadelphia] = 'Philadelphia Eagles';
$teams[pittsburgh] = 'Pittsburgh Steelers';
$teams[sandiego] = 'San Diego Chargers';
$teams[sanfrancisco] = 'San Francisco 49ers';
$teams[seattle] = 'Seattle Seahawks';
$teams[stlouis] = 'Saint Louis Rams';
$teams[tampabay] = 'Tampa Bay Buccaneers';
$teams[tennessee] = 'Tennessee Titans';
$teams[washington] = 'Washington Redskins';

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

	//2000 = user specific errors.
	$messages[2000] =  array(
		"msg" => "For command user, invalid request method [".$_SERVER['REQUEST_METHOD']."]. Must be get or post.", "type" => "error"
		); //valid error for calls that support GET and POST.

	$messages[2001] =  array(
		"msg" => "For command user, no userid associated with session. User command can only be used on user in focus.", "type" => "error"
		); //valid error for calls that support GET and POST.


	// errors for picks command.
	$messages[2010] = array(
		"msg" => "For command schedule, no week specified.", "type" => "error"
		);

	// errors for partyChange command.
	$messages[2020] = array(
		"msg" => "For command partyChange, no mathing party id found for this user. ".$m, "type" => "error"
		);



	$messages[2200] = array(
		"msg" =>  "The deadline for this game has already passed.", "type" => "error"
		);
	$messages[2201] =  array(
		"msg" =>  "Unable to submit picks because you are not 'confirmed' for the regular season. Talk to the commish.", "type" => "error"
		);
	$messages[2301] =  array(
		"msg" =>  "Unable to fetch your parties list of picks for the week ".$m." because you have not finalized your picks yet. You must finalize first.", "type" => "error"
		);

//party related errors

	$messages[2501] =  array(
		"msg" =>  "The party name selected [".$req[name]."] is already in use. Please choose another name.", "type" => "warning"
		);
	$messages[2502] =  array(
		"msg" =>  "The party password you provided does not match the password on file. Please check your spelling and try again. If the error persists, contact your commish to ensure the password you are using is correct.", "type" => "warning"
		);

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

function get_week($TIMESTAMP)	{
	$ts = $TIMESTAMP - (60*60*10);
	$query = 'select week from schedules where date > '.$ts.' order by date limit 1';
	$results = mysql_query($query)
		or $error = mysql_error();
@	$num_results = mysql_num_rows($results);

// if there is a valid week to return, it happens here.
	if($num_results > 0)	{
		$info = mysql_fetch_row($results);
		$r = $info[0];
		}
	else	{
		$r = false;
		}
	return $r;
	}





$commands = array(
// auth
	"isSessionValid",
	"logout",
	"googleAuthenticate",

//contact
	"websiteInquiry",

//misc
	"news",

//pool
	"gameWinners", //get the list of NFL winners for a given week. season is optional. if not passed, defaults to this season.
	"schedule", //get = list of a weeks schedule, including the users selections if they've already been made. post = setting a pick for a specified gameid.
	"winners", //readonly. get a list of the winners.
	"picks", //experimental cmd intended to replace schedules.
	"picklist",
	"partyCreate",
	"partyJoin",
	"partyChange",
	"thisWeek",
	"user" //a read and write call. update user info.
	);

$response = array(); //what is returned by the API. either a successful response or an error.
$cmd = $_REQUEST['cmd']; //shortcut. change to POST.



//handle some high level errors and validation.
if(!$_SESSION['VALID_SESSION'] && $cmd != 'googleAuthenticate')	{
	$response = apiMsg(999,$_REQUEST);
	$response[session] = $_SESSION['VALID_SESSION'];
	}
else if($cmd && in_array($cmd,$commands))	{
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


//http://coursesweb.net/php-mysql/integer-float-value-select-pdo-string-numeric_t
function preserveType($row)	{
	foreach($row AS $k=>$v) {
		if(is_numeric($v)) $row[$k] = $v + 0;
		}
	return $row;
	}


function results2array($r)	{
	$rows = array();
	$i = 0;
	while($row = mysql_fetch_assoc($r))	{
		$rows[$i] = preserveType($row);
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



function news($req)	{
	// http://onwebdev.blogspot.com/2011/08/php-converting-rss-to-json.html
	$feed = new DOMDocument();
	$feed->load('http://www.nfl.com/rss/rsslanding?searchString=home');
	$json = array();

	$json['title'] = $feed->getElementsByTagName('feed')->item(0)->getElementsByTagName('title')->item(0)->firstChild->nodeValue;
	$json['subtitle'] = $feed->getElementsByTagName('feed')->item(0)->getElementsByTagName('subtitle')->item(0)->firstChild->nodeValue;

	$items = $feed->getElementsByTagName('feed')->item(0)->getElementsByTagName('entry');

	$json['items'] = array();
	$i = 0;
	$max = $req['max'] || 5; //max can be specified to retrieve more/less articles.

	foreach($items as $item) {
		$title = $item->getElementsByTagName('title')->item(0)->firstChild->nodeValue;
		$published = $item->getElementsByTagName('published')->item(0)->firstChild->nodeValue;
		$summary = $item->getElementsByTagName('summary')->item(0)->firstChild->nodeValue;
		$link = $item->getElementsByTagName('id')->item(0)->firstChild->nodeValue; //id has link as a child.

		$json['items'][$i]['title'] = $title;
		$json['items'][$i]['published'] = str_replace('T',' ',substr($published, 0, -1)); //There's a 'T' in the middle and last character is a 'Z'.
		$json['items'][$i]['summary'] = $summary;
		$json['items'][$i]['link'] = $link;
		$i++;
		if($i >= $max)	{
			break;
			}
		}
	return $json;
	} //news



//only return 1 user
// ### TODO -> add a column for 'parties' that returns an array of party id's.  username is globally unique.
// email should be changed to email_primary (?) and another field for 'emails' should be added so more logins can be associated (in case facebook and gmail have different emails).
function user($req)	{
	//get user data.
	$response = array();
	if($_SESSION['EMAIL'])	{
		if($_SERVER['REQUEST_METHOD'] == 'GET')	{
			dbconnect();
			$response = getUserDetails($_SESSION['EMAIL']);
			if($response)	{
				global $teams;
				$response[teams] = array();
				//user data retrieved and already set in $response.
				foreach($teams as $key => $value)	{
					$response[teams][] = array('id'=>$key,'pretty'=>$value);
					}
				}
			else	{
				$response = apiMsg(1003,$req,mysql_error());
				}
			}
		//save/create user data
		else if($_SERVER['REQUEST_METHOD'] == 'POST')	{
			$json = json_decode(file_get_contents('php://input')); //application/json is not one of the content-types that will populate $_POST.

//			$accept = array("name,lastname,address,city,state,zip,favteam"); //changing email not currently supported.  ###TODO -> need to support email addresses.
			$query = "update users set ";
			if($json->name)	{$query .= " name = ".qt($json->name).",";}
			if($json->lastname)	{$query .= " lastname = ".qt($json->lastname).",";}
			if($json->address)	{$query .= " address = ".qt($json->address).",";}
			if($json->city)	{$query .= " city = ".qt($json->city).",";}
			if($json->state)	{$query .= " state = ".qt($json->state).",";}
			if($json->zip)	{$query .= " zip = ".qt($json->zip).",";}
			if($json->favteam)	{$query .= " favteam = ".qt($json->favteam).",";}
			$query = rtrim($query, ",");
			$query .= " where userid = ".qt($_SESSION['USERID']);
			dbconnect();
			$results = mysql_query($query);
			if($results)	{
				$response = apiMsg(100,$req,"User has been updated.");
				}
			else	{
				$response = apiMsg(1003,$req,mysql_error());
				}
			}
		else	{
			$response = apiMsg(2000,$req);
			}
		}
	else	{
		$response = apiMsg(2001,$req);
		}
	return $response;
	}


// a readonly call. returns a list of all the users picks for a given week/party.
function picklist($req)	{
	### TODO -> currently, there's no security on this call. needs to be. Needs to ensure confirm is true for user/week.
	if($req['week'] == 0 || $req['week'])	{
		dbconnect();
		if($req['week'] == 0)	{$week = get_week(mktime());}
		else	{$week = intval($req['week']);}

		$confirm = false; //is set to true if picks are finalized or the week in focus is over.
		if($week < get_week(mktime()))	{
			$confirm = true;
			}
		else	{
			$finalizeRequest = mysql_query("select userid from finalized where season = 2006 and week = ".mysql_escape_string($week)."  and partyid = 10000");
			if(mysql_num_rows($finalizeRequest) >= 1)	{
				$confirm = true;
				}
			else	{
// ### TODO -> this is commented out for testing. get_week returns false because there are no games after this timestamp.
$confirm = true; // this should not be here once the lines below are commented out.
//				$response = apiMsg(2301,$req,$week);
//				$response[thisweek] = get_week(mktime());
				}
			}

		if($confirm)	{
//using qt on week caused a no results set.
			$picksResults = mysql_query("select game_picks.userid,game_picks.gameid,game_picks.winner, users.username from game_picks, users where game_picks.userid = users.userid and game_picks.season = 2006 and game_picks.week = ".mysql_escape_string($week)." and partyid = 10000 order by users.username asc, gameid asc");
			if(!$picksResults)	{$response[messages][] = apiMsg(1003,$req,"Picks request error: ".mysql_error());}

			$tbResults = mysql_query("select * from tiebreaker where season = 2006 and week = ".mysql_escape_string($week)."  and partyid = 10000");
			if(!$tbResults)	{$response[messages][] = apiMsg(1003,$req,"Tiebreaker request error: ".mysql_error());}

			if($picksResults && $tbResults)	{
				$tbs = array();
				while($t = mysql_fetch_assoc($tbResults))	{
					$tbs[$t[userid]] = $t[total];
					}
				$response = array();
				$username = '';
				$row = -1;
				while($r = mysql_fetch_assoc($picksResults))	{
					if($username != $r[username])	{
						$username = $r[username];
						$row++;
						$response[$row] = array();
						$response[$row][username] = $r[username];
						$response[$row][tiebreaker] = $tbs[$r[userid]];
						$response[$row][picks] = array();
						}
					$response[$row][picks][$r[gameid]] = $r[winner];
					}
				}
			else	{
				$response[type] = 'error';
				}
			}
		else	{
			//some error caused this to not confirm. messaging already set in $response.
			}

		}
	else	{
		$response = apiMsg(1007,$req,"Param 'week' is required.");
		}

	return $response;

	}




//experimental call intended to replace schedule (but to leave schedule working in the interim.
function picks($req)	{
	$response = array();
	if($req['week'] == 0 || $req['week'])	{
		dbconnect();
		if($req['week'] == 0)	{$week = get_week(mktime());}
		else	{$week = $req['week'];}
		//Saving a pick!
		if($_SERVER['REQUEST_METHOD'] == 'POST')	{
			$json = json_decode(file_get_contents('php://input')); //application/json is not one of the content-types that will populate $_POST.
//only confirmed players can submit picks for the regular season.
//preseason is open for all.
			// ### TODO !!! -> somewhere here we need to make sure their picks are not already finalized.
			if($_SESSION['CONFIRM'] >= 1 || $json->week[0] == 'p')	{
				$deadlineResults = mysql_query("select date from schedules where week = ".qt($week)." and season = ".qt($json->season)."and gameid = ".qt($json->gameid));
				$deadlineArr = mysql_fetch_assoc($deadlineResults);
				$deadline = $deadlineArr['date'];
				//if the game has already started, can't submit picks.
				if($deadline > mktime())	{
					$query = "REPLACE into game_picks (userid, season, week, gameid, winner) values (".qt($_SESSION['USERID']).",".qt($json->season).",".qt($week).",".qt($json->gameid).",".qt($json->winner).")";
					$results = mysql_query($query);
					if($results)	{
						$response = mysql_fetch_assoc($results);
						}
					else	{
						$response = apiMsg(1003,$req,mysql_error());
						}
					}
				else	{
					$response = apiMsg(2200,$req);
					}
				$response[deadline] = $deadline;
				}
			else	{
				$response = apiMsg(2201,$req);
				}

			$response[confirm] = $_SESSION['CONFIRM'];
			$response[now] = mktime();

			}
		//request a schedule by week.
		else if($_SERVER['REQUEST_METHOD'] == 'GET')	{
//			$query = "select schedules.gameid, schedules.home, schedules.visitor, game_picks.winner from schedules, game_picks where  schedules.gameid = game_picks.gameid and schedules.season = 2006 and schedules.week = 10 group by schedules.gameid ";
			$picksResults = mysql_query("select gameid,winner from vicegrip_FOOTBALL.game_picks where season = ".(qt($req[season]) || $THIS_SEASON)." and partyid = ".qt($_SESSION[PARTYID])." and week = ".qt($week));
			if(!$picksResults)	{$response[messages][] = apiMsg(1003,$req,"Schedule request error: ".mysql_error());}

			$finalizeResults = mysql_query("select * from vicegrip_FOOTBALL.finalized where season = ".(qt($req[season]) || $THIS_SEASON)." and partyid = ".qt($_SESSION[PARTYID])." and userid = ".qt($_SESSION[USERID])." and week = ".qt($week));
			if(!$finalizeResults)	{$response[messages][] = apiMsg(1003,$req,"Finalization request error: ".mysql_error());}

			$tbResults = mysql_query("select * from vicegrip_FOOTBALL.tiebreaker where season = ".(qt($req[season]) || $THIS_SEASON)." and partyid = ".qt($_SESSION[PARTYID])." and userid = ".qt($_SESSION[USERID])." and week = ".qt($week));
			if(!$tbResults)	{$response[messages][] = apiMsg(1003,$req,"Tiebreaker request error: ".mysql_error());}

			if($picksResults && $finalizeResults && $tbResults)	{
				//all three queries succeeded. proceed.
				$response = apiMsg(100,$req,"");
//				$response['picks'] = results2array($picksResults);
				if(mysql_num_rows($picksResults) >= 1)	{
					while($row = mysql_fetch_assoc($picksResults))	{
						$response[$row[gameid]] = $row[winner];
						$i++;
						}
					}
				$response['finalized'] = false;
				$response['tiebreaker'] = null;
				$response['week'] = $week;
				if(mysql_num_rows($finalizeResults) >= 1)	{
					$response['finalized'] = true;
					}
				if(mysql_num_rows($tbResults) >= 1)	{
					$row = mysql_fetch_row($tbResults);
					$response['tiebreaker'] = $row['total'];
					}
				}
			else	{
				$response[type] = 'error';
				//if any one of the three queries fails, the entire call gets treated as an error. The interface requires all this data.
				//the error messages are already generated up near the requests.
				}
			}
		else	{
			$response = apiMsg(2000,$req); //invalid request method.
			}
		}
	else	{
		$response = apiMsg(2010,$req); //no week specified.
		}

	return $response;


	}


function thisWeek($req)	{
	$response = get_week(mktime());
	}

/*
use 21XX error codes.
### TODO -> this call should be read only. move the save code into picks.
*/
function schedule($req)	{
	//week = 0 is a valid request. Will return the picks for 'this week'.
	if($req['week'] == 0 || $req['week'])	{
		dbconnect();

		if(is_numeric($req[week]) && $req[week] >= 0)	{
			$week = $req[week];
			}
		else	{
			//week is either zero or not a number. return picks for this week.
			$week = get_week(mktime());
			}

		//Saving a pick!
		if($_SERVER['REQUEST_METHOD'] == 'POST')	{
			$json = json_decode(file_get_contents('php://input')); //application/json is not one of the content-types that will populate $_POST.
//only confirmed players can submit picks for the regular season.
//preseason is open for all.
			if($_SESSION['CONFIRM'] >= 1 || $json->week[0] == 'p')	{
				$deadlineResults = mysql_query("select date from schedules where week = ".qt($week)." and season = ".qt($json->season)."and gameid = ".qt($json->gameid));
				$deadlineArr = mysql_fetch_assoc($deadlineResults);
				$deadline = $deadlineArr['date'];
				//if the game has already started, can't submit picks.
				if($deadline > mktime())	{
					$query = "REPLACE into game_picks (userid, season, week, gameid, winner) values (".qt($_SESSION['USERID']).",".qt($json->season).",".qt($week).",".qt($json->gameid).",".qt($json->winner).")";
					$results = mysql_query($query);
					if($results)	{
						$response = mysql_fetch_assoc($results);
						}
					else	{
						$response = apiMsg(1003,$req,mysql_error());
						}
					}
				else	{
					$response = apiMsg(2200,$req);
					}
				$response[deadline] = $deadline;
				}
			else	{
				$response = apiMsg(2201,$req);
				}

			$response[confirm] = $_SESSION['CONFIRM'];
			$response[now] = mktime();

			}
		//request a schedule by week.
		else if($_SERVER['REQUEST_METHOD'] == 'GET')	{
//			$query = "select schedules.gameid, schedules.home, schedules.visitor, game_picks.winner from schedules, game_picks where  schedules.gameid = game_picks.gameid and schedules.season = 2006 and schedules.week = 10 group by schedules.gameid ";
			$results = mysql_query("select * from vicegrip_FOOTBALL.schedules where season = 2006 and week = ".$week);
			if($results)	{
				$response = results2array($results);
//				$response[tiebreaker] = 7;
				}
			else	{
				$response = apiMsg(1003,$req,mysql_error());
				}
			}
		else	{
			$response = apiMsg(2000,$req); //invalid request method.
			}
		}
	else	{
		$response = apiMsg(2010,$req); //no week specified.
		}
	return $response;
	}



//get the list of winners for a season, or for an individual week in a season.
function winners($req)	{
	dbconnect();
	// ### TODO -> 2006 should be $THIS_SEASON. hard coded for testing.
	$query = "select weekly_winners.wins, weekly_winners.winnings, weekly_winners.week, users.username, users.userid from weekly_winners,users where weekly_winners.season = 2006 ";
	if(is_numeric($req[week]) && $req[week] >= 0)	{
		$query .= " and weekly_winners.week = ".$req[week]; //not in a qt. verified that it is just #
		}
	else	{
		$query .= " and week >= 0 "; //exclude preseason. ### TODO -> probably want to pull this later...
		}
	$query .= " and weekly_winners.userid = users.userid order by week desc limit 8";
	$results = mysql_query($query);
	if($results)	{
		$response = results2array($results);
		}
	else	{
		$response = apiMsg(1003,$req,mysql_error());
		}
//	$response[query] = $query;
	return $response;
	}


//don't need a lot of security on this call.  The information is publicly available, what's to hide?
function gameWinners($req)	{
	//week = 0 is a valid request. Will return the picks for 'this week'.

	if($req['week'] == 0 || $req['week'])	{
		dbconnect();
		if(is_numeric($req[week]) && $req[week] >= 0)	{
			$week = $req['week'];
			}
		else	{
			$week = get_week(mktime());
			}
/// ### TODO -> schedule is currently hard coded for testing purposes.
		$req[season] = 2006;
		$query = "select gameid,date,winner from vicegrip_FOOTBALL.schedules where season = 2006 and week = ".$week;
		$results = mysql_query($query);
		if($results)	{
			$response = results2array($results);
			}
		else	{
			$response = apiMsg(1003,$req,mysql_error());
			}
		}
	else	{
		$response = apiMsg(2010,$req); //no week specified.
		}
	return $response;
	}


function partyCreate($req)	{
	$messages = array(); //if messages are used, a high level 'type' should still be returned for complete success.
	if($req[name] && $req[password])	{
		//the party name must have a letter in it. This is so that the party id is globally unique, even in the party name.
		if(!is_numeric($req[name]))	{
			dbconnect();
			$results = mysql_query("select * from parties where name = ".qt($req[name]));
			if(!$results)	{
				$response = apiMsg(1003,$req,mysql_error());
				}
			else if(mysql_num_rows($results) == 0)	{
				//the party name is not in use. Create it and add the user to the party)memgers table as the commish.
				$addPartyResults = mysql_query("insert into parties (name,password) values (".qt($req[name]).", ".qt($req[password]).")");
				if($addPartyResults)	{
					$messages[] = apiMsg(100,$req,"Party ".$req[name]." was successfully created.");
					$partyid = mysql_insert_id();
					$response[partyid] = $partyid;
					$partyQuery = "insert into party_members (partyid,userid,commish) values (".$partyid.",".$_SESSION['USERID'].",1)";
					$addPartyMemberResults = mysql_query($partyQuery);
					$response[partyQuery] = $partyQuery;
					if($addPartyMemberResults)	{
						$messages[] = apiMsg(100,$req,"Added member to ".$req[name]." as commish.");
						$response[partyid] = $partyid;
						$response[partyname] = $req[name];
						$response[type] = 'success';
						}
					else	{
						$messages[] = apiMsg(1003,$req,mysql_error());
						}
					}
				else	{
					array_push($messages,apiMsg(1003,$req,mysql_error()));
					}
				}
			else	{
				$response = apiMsg(2501,$req); //would get here if the party name already existed.
				}
			}
		else	{
			$response = apiMsg(1008,$req,"Party name [".$req[name]."] must contain at least 1 letter."); //username or password missing.
			}
		}
	else	{
		$response = apiMsg(1007,$req,"Both name [".$req[name]."] and password [".$req[password]."] are set."); //username or password missing.
		}
	$response[msgs] = $messages;
	return $response;
	}


function partyJoin($req)	{
	$response = array();
	if($req[name] && $req[password])	{
		dbconnect();
		$results = mysql_query("select * from parties where id = ".qt($req[name])." or name = ".qt($req[name]));
		if($results)	{
			if(mysql_num_rows($results) == 1)	{
				//found a match. Check the password and, if that matches, let the user join.
				$party = mysql_fetch_assoc($results);
				if($party[password] == $req[password])	{
					$add2party = mysql_query("insert into party_members (partyid,userid) values (".$party[id].",".$_SESSION[USERID].")");
					if($add2party)	{
						$response = apiMsg(100,$req,"Congrats! You've been added the '".$party[name]."' party!");
						}
					else	{
						$response = apiMsg(1003,$req,mysql_error());
						$response[debug] = "insert query for party.";
						}
					}
				else	{
					$response = apiMsg(2502,$req);
					}
				}
			else if(mysql_num_rows == 0)	{
				//invalid name/party id.
				$response = apiMsg(1010,$req,"There were no matching parties found for ".$req[name].". Please check your spelling and try again.");
				}
			else	{
				//too many results. Should always only be 1.
				$response = apiMsg(1009,$req,"Multiple results found for ".$req[name]." and that was unexpected. If you entered the party name, try the party id. If you continue to experience this error, please contact the site administrator."); //username or password missing.
				}
			}
		else	{
			$response = apiMsg(1003,$req,mysql_error());
			$response[debug] = "select query for party.";
			}
		}
	else	{
		$response = apiMsg(1007,$req,"Both name [".$req[name]."] and password [".$req[password]."] are required.");
		}
	return $response;
	}


function partyChange($req)	{
	if($req[partyid])	{
		if(is_numeric($req[partyid]) && $req[partyid] > 0)	{
			$success = 0;
			$test = array();
			foreach($_SESSION['PARTIES'] as $index )	{
				if($index[partyid] == $req[partyid])	{
					$success = 1;
					$_SESSION['PARTYID'] = $index[partyid];
					break;
					}
				}
			if($success == 1)	{
				$response = apiMsg(100,$req,"Partyid changed to ".$req[partyid]);
				$response[partyid] = $_SESSION['PARTYID'];
				}
			else	{
				$response = apiMsg(2020,$req,"Specified partyid was ".$req[partyid]);
				}
			}
		else	{
			$response = apiMsg(1008,$req,"'partyid' must be an integer greater than zero.");
			}
		}
	else	{
		$response = apiMsg(1007,$req,"'partyid' is a required parameter.");
		}
	$response[parties] = $_SESSION['PARTIES'];
	return $response;
	}


function setUserSessionDetails($user)	{
	$_SESSION['USERID'] = $user[userid] * 1;
	$_SESSION['CONFIRM'] = $user[confirm] * 1;
	$_SESSION['PARTIES'] = $user[parties];
	$_SESSION['PARTYID'] = $user[partyid];
	}

function getUserDetails($email)	{
	$messages = array(); //if messages are used, a high level 'type' should still be returned for complete success.
	$results = mysql_query('select * from users where email = '.qt($email));
	if(mysql_num_rows($results) == 1)	{
		$messages[] = apiMsg(100,$req,"Found matching user account.");
		$user = mysql_fetch_assoc($results);
		$user[parties] = array();

		$partyResults = mysql_query('SELECT party_members.partyid, party_members.commish, parties.name, parties.created FROM party_members INNER JOIN parties ON party_members.partyid=parties.id where party_members.userid = '.$user[userid]);
		if($partyResults)	{
			for($i = 0; $i < mysql_num_rows($partyResults); $i++)	{
				$user[parties][$i] = mysql_fetch_assoc($partyResults);
				$user[parties][$i][partyid] = $user[parties][$i][partyid] * 1; //treat as number.
				}
			$user[password] = null; //isn't used and shouldn't be returned publicly even if it was.
			$user[type] = 'success'; //high level type should always be set if no errors occur.
			if($_SESSION['PARTYID'])	{$user[partyid] = $_SESSION['PARTYID'];}
			else if($user[parties][0])	{$user[partyid] = $user[parties][0][partyid];}
			else	{$user[partyid] = null;}
			}
		else	{
			$messages[] = apiMsg(1003,$req,mysql_error());
			}
		unset($user[password]);
		$user[email] = $email;

		}
	else if(mysql_num_rows > 1)	{
		//unexpected result set. more than 1 match on the email. 1009
		$response = apiMsg(1009,$req,"More than 1 user account was found with that email.");
		}
	else if(mysql_num_rows == 0)	{
		//no match.
		$user = false;
		$response = apiMsg(1010,$req,"No account exists with that username.");
		}
	else	{
		//mysql error.
		$response = apiMsg(1003,$req,mysql_error());
		}
	return $user;
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
		dbconnect();

		$userArray = getUserDetails($jsonResponse->{'email'});
//user account exists. Get their list of parties and any other relevant info.
		if($userArray[type] == 'success')	{
			setUserSessionDetails($userArray);
			$response = array_merge(apiMsg(100,$req,"Successfully retrieved user record."),$userArray);
			}
		//false will be returned if the db requests succeeded but no user account was found.
		else if($userArray === false)	{
//look up some info on g+ about the user.
			$userinfo = file_get_contents("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=".$token);
			$userJSON = json_decode($userinfo);

//hhhmmm... what to do here. Auto create a new user?  for now, yes.
//when more than one login method is available, we'll need to handle this differently.
			$username = explode("@",$_SESSION['EMAIL']);
			$addResults = mysql_query("insert into users (email, name, lastname, username, since) values (".qt($_SESSION['EMAIL']).", ".qt($userJSON->{'given_name'}).", ".qt($userJSON->{'family_name'}).", ".qt(substr($username[0],0,20)).", ".qt(date("Y")).")");
			if($addResults)	{
				$userArray = getUserDetails($jsonResponse->{'email'});
				setUserSessionDetails($userArray);
				}
			else	{
				$response = apiMsg(1003,$req,mysql_error());
				}
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
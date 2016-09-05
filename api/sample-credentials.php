<?
//todo -> refactor all this when the rest of the API is refactored.

$db_name = 'somename';
$db_username = 'someusername';
$db_password = 'db-password';

$creds = array(
	"google" => array(
		"application_name" => "Your application name",
		"auth_uri" => "https://accounts.google.com/o/oauth2/auth",
		"client_secret" => "YOURCLIENTSECRED",
		"token_uri" => "https://accounts.google.com/o/oauth2/token",
		"client_email" => "YOURID@developer.gserviceaccount.com",
		"client_x509_cert_url" => "https://www.googleapis.com/robot/v1/metadata/x509/YOURID@developer.gserviceaccount.com",
		"client_id" => "YOURID.apps.googleusercontent.com",
		"auth_provider_x509_cert_url" => "https://www.googleapis.com/oauth2/v1/certs"
		)
	);
?>

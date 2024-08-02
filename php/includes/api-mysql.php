<?php

include 'api-credentials.php';

function dbConnect() {
      define("DB_HOST", $dbhost);
      define("DB_NAME", $dbname);
      define("DB_CHARSET", "utf8");
      define("DB_USER", $dbusername);
      define("DB_PASSWORD", $dbpassword);
      include 'report-passwords.php';
      try {
        $dbh = new PDO(
          "mysql:host=". DB_HOST .";dbname=". DB_NAME .";charset=". DB_CHARSET,
          DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
          ]
        );
        return $dbh;
      } catch (Exception $ex) { exit($ex->getMessage()); }
}


?>
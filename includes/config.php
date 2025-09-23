<?php 
// DB credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'NewStrongPassword123');
define('DB_NAME', 'empnew');

try {
    // Establish database connection
    $dbh = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'")
    );

    // Set error mode to exceptions for better debugging
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // Show detailed error during development
    exit("Database Connection Error: " . $e->getMessage());
}
?>

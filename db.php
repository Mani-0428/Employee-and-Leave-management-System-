<?php
// db.php
// Database connection helper

function db() {
    static $pdo;

    if ($pdo === null) {
        $DB_HOST = '127.0.0.1';
        $DB_NAME = 'empnew';
        $DB_USER = 'root';
        $DB_PASS = 'NewStrongPassword123'; // set your XAMPP password if any
        $DB_DSN  = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        try {
            $pdo = new PDO($DB_DSN, $DB_USER, $DB_PASS, $options);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'ok'    => false,
                'error' => 'DB connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    return $pdo;
}

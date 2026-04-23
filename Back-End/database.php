<?php
// ============================================================
//  config/Database.php
//  PDO database connection (singleton)
// ============================================================

class Database {
    private static ?Database $instance = null;
    private PDO $conn;

    // ── Edit these four values to match your environment ────
    private string $host     = 'localhost';
    private string $db_name  = 'hotel_management';
    private string $username = 'root';
    private string $password = '';
    // ────────────────────────────────────────────────────────

    private function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $this->conn = new PDO($dsn, $this->username, $this->password, $options);
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->conn;
    }
}

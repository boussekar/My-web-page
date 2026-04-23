<?php
require_once __DIR__ . '/../models/AdminUser.php';
require_once __DIR__ . '/../utils/JwtHelper.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureUsersTable();
    }
    
    private function ensureUsersTable() {
        $this->db->exec("CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255),
            role ENUM('guest','owner','admin') DEFAULT 'guest',
            initials VARCHAR(10),
            hotel_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        // مستخدمين تجريبيين
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = 'owner@aurum.com'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $this->db->prepare("INSERT INTO users (name, email, password, role, initials, hotel_name) VALUES ('Hotel Owner', 'owner@aurum.com', MD5('owner123'), 'owner', 'HO', 'Grand Hotel')")->execute();
        }
        $stmt2 = $this->db->prepare("SELECT * FROM users WHERE email = 'guest@aurum.com'");
        $stmt2->execute();
        if (!$stmt2->fetch()) {
            $this->db->prepare("INSERT INTO users (name, email, password, role, initials) VALUES ('Guest User', 'guest@aurum.com', MD5('guest123'), 'guest', 'GU')")->execute();
        }
    }
    
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        if (empty($email) || empty($password)) Response::error('Email and password required');
        if ($password === 'social' || strpos($password, 'social_') === 0) {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();
            if (!$user) {
                $name = $input['name'] ?? explode('@', $email)[0];
                $initials = strtoupper(substr($name, 0, 2));
                $stmt2 = $this->db->prepare("INSERT INTO users (name, email, role, initials) VALUES (:name, :email, 'guest', :initials)");
                $stmt2->execute([':name' => $name, ':email' => $email, ':initials' => $initials]);
                $user = ['user_id' => $this->db->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => 'guest', 'initials' => $initials, 'hotel_name' => null];
            }
            $token = JwtHelper::encode(['user_id' => $user['user_id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'], 'initials' => $user['initials']]);
            Response::success(['token' => $token, 'user' => $user], 'Login successful');
            return;
        }
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email AND password = MD5(:password)");
        $stmt->execute([':email' => $email, ':password' => $password]);
        $user = $stmt->fetch();
        if (!$user) Response::error('Invalid credentials', 401);
        $token = JwtHelper::encode(['user_id' => $user['user_id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'], 'initials' => $user['initials']]);
        Response::success(['token' => $token, 'user' => $user], 'Login successful');
    }
    
    // ========== دالة التسجيل الجديدة ==========
    public function register(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $name      = trim($input['name'] ?? '');
        $email     = trim($input['email'] ?? '');
        $password  = $input['password'] ?? '';
        $role      = $input['role'] ?? 'guest';
        $hotelName = trim($input['hotel_name'] ?? '');
        
        if (!$name || !$email || !$password) {
            Response::error('Name, email and password are required');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format');
        }
        if (strlen($password) < 8) {
            Response::error('Password must be at least 8 characters');
        }
        
        $stmt = $this->db->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Email already registered', 409);
        }
        
        $initials = strtoupper(substr($name, 0, 2));
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, email, password, role, initials, hotel_name) 
             VALUES (?, ?, MD5(?), ?, ?, ?)"
        );
        $stmt->execute([$name, $email, $password, $role, $initials, $hotelName]);
        $userId = (int)$this->db->lastInsertId();
        $user = [
            'user_id'   => $userId,
            'name'      => $name,
            'email'     => $email,
            'role'      => $role,
            'initials'  => $initials,
            'hotel_name'=> $hotelName
        ];
        $token = JwtHelper::encode([
            'user_id' => $userId,
            'name'    => $name,
            'email'   => $email,
            'role'    => $role,
            'initials'=> $initials
        ]);
        Response::success(['token' => $token, 'user' => $user], 'Registration successful', 201);
    }
}
?>
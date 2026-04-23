<?php
require_once __DIR__ . '/../utils/Response.php';

class HotelsController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureHotelsTable();
    }
    private function ensureHotelsTable() {
        $this->db->exec("CREATE TABLE IF NOT EXISTS hotels (
            hotel_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            stars INT DEFAULT 5,
            price DECIMAL(10,2) NOT NULL,
            rating DECIMAL(3,2) DEFAULT 0,
            reviews INT DEFAULT 0,
            description TEXT,
            amenities TEXT,
            max_children INT DEFAULT 4,
            total_rooms INT DEFAULT 10,
            initial VARCHAR(10),
            color VARCHAR(20),
            status ENUM('active','pending') DEFAULT 'active'
        )");
        // إضافة بيانات افتراضية إذا كانت فارغة
        $stmt = $this->db->query("SELECT COUNT(*) FROM hotels");
        if ($stmt->fetchColumn() == 0) {
            $hotels = [
                ['Le Grand Hôtel', 'Paris', 'France', 5, 450, 4.9, 1284, 'Belle Époque grandeur', 'Wi-Fi,Spa,Restaurant', 4, 3, 'LG', '#1a1208'],
                ['Burj Al Arab', 'Dubai', 'UAE', 5, 1800, 4.85, 2341, 'Iconic sail-shaped', 'Pool,Spa,Restaurant', 3, 2, 'BA', '#0a1218'],
                ['The Peninsula', 'Tokyo', 'Japan', 5, 720, 4.9, 998, 'Eastern refinement', 'Spa,Pool,Restaurant', 2, 4, 'TP', '#120a10'],
                ['Sofitel Algiers', 'Algiers', 'Algeria', 5, 220, 4.72, 642, 'French elegance', 'Pool,Spa,Restaurant', 3, 4, 'SA', '#0a1a0e'],
                ['El Djazair Hotel', 'Algiers', 'Algeria', 5, 180, 4.65, 430, 'Colonial-era', 'Pool,Restaurant,Bar', 4, 3, 'EJ', '#0e1a0a']
            ];
            $sql = "INSERT INTO hotels (name, city, country, stars, price, rating, reviews, description, amenities, max_children, total_rooms, initial, color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
            $stmt = $this->db->prepare($sql);
            foreach ($hotels as $h) $stmt->execute($h);
        }
    }
    public function getAll(): void {
        $stmt = $this->db->query("SELECT * FROM hotels WHERE status='active' ORDER BY rating DESC");
        $hotels = $stmt->fetchAll();
        foreach ($hotels as &$h) $h['amenities'] = explode(',', $h['amenities']);
        Response::success($hotels);
    }
    public function getById(int $id): void {
        $stmt = $this->db->prepare("SELECT * FROM hotels WHERE hotel_id = ?");
        $stmt->execute([$id]);
        $hotel = $stmt->fetch();
        if (!$hotel) Response::notFound('Hotel not found');
        $hotel['amenities'] = explode(',', $hotel['amenities']);
        Response::success($hotel);
    }
}
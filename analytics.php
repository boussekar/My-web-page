<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class AnalyticsController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->db->exec("CREATE TABLE IF NOT EXISTS owner_analytics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            total_bookings INT DEFAULT 0,
            total_revenue DECIMAL(12,2) DEFAULT 0,
            occupancy_rate DECIMAL(5,2) DEFAULT 0,
            month_year DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    public function getDashboard(): void {
        $payload = AuthMiddleware::requireRole('owner');
        $owner_id = $payload['user_id'];
        $stmt = $this->db->prepare("SELECT COUNT(*) as total_bookings, COALESCE(SUM(b.total_price),0) as total_revenue FROM bookings b JOIN hotels h ON b.hotel_id = h.hotel_id WHERE h.owner_id = ?");
        $stmt->execute([$owner_id]);
        $stats = $stmt->fetch();
        $stmt2 = $this->db->prepare("SELECT b.*, u.name as guest_name FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN hotels h ON b.hotel_id = h.hotel_id WHERE h.owner_id = ? ORDER BY b.created_at DESC LIMIT 10");
        $stmt2->execute([$owner_id]);
        $recent = $stmt2->fetchAll();
        Response::success(['stats' => $stats, 'recent_bookings' => $recent]);
    }
}?>
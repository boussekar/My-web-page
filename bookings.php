<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class BookingsController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->db->exec("CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            hotel_id INT NOT NULL,
            hotel_name VARCHAR(200),
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            rooms INT DEFAULT 1,
            guests INT DEFAULT 2,
            total_price DECIMAL(10,2) NOT NULL,
            status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    public function create(): void {
        $payload = AuthMiddleware::handle();
        $input = json_decode(file_get_contents('php://input'), true);
        $hotel_id = (int)($input['hotel_id'] ?? 0);
        $check_in = $input['check_in'] ?? '';
        $check_out = $input['check_out'] ?? '';
        $rooms = (int)($input['rooms'] ?? 1);
        $guests = (int)($input['guests'] ?? 2);
        $total_price = (float)($input['total_price'] ?? 0);
        if (!$hotel_id || !$check_in || !$check_out) Response::error('Missing fields');
        $stmt = $this->db->prepare("SELECT name FROM hotels WHERE hotel_id = ?");
        $stmt->execute([$hotel_id]);
        $hotel = $stmt->fetch();
        if (!$hotel) Response::error('Hotel not found');
        $stmt2 = $this->db->prepare("INSERT INTO bookings (user_id, hotel_id, hotel_name, check_in, check_out, rooms, guests, total_price, status) VALUES (?,?,?,?,?,?,?,?,'confirmed')");
        $stmt2->execute([$payload['user_id'], $hotel_id, $hotel['name'], $check_in, $check_out, $rooms, $guests, $total_price]);
        Response::success(['booking_id' => $this->db->lastInsertId()], 'Booking confirmed', 201);
    }
    public function getUserBookings(): void {
        $payload = AuthMiddleware::handle();
        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$payload['user_id']]);
        Response::success($stmt->fetchAll());
    }
}
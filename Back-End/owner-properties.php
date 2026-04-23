<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class OwnerPropertiesController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->db->exec("CREATE TABLE IF NOT EXISTS owner_properties (
            property_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(200) NOT NULL,
            city VARCHAR(100),
            country VARCHAR(100),
            stars INT DEFAULT 5,
            rooms INT DEFAULT 10,
            price_from DECIMAL(10,2),
            description TEXT,
            amenities TEXT,
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    public function getAll(): void {
        $payload = AuthMiddleware::requireRole('owner');
        $stmt = $this->db->prepare("SELECT * FROM owner_properties WHERE owner_id = ? ORDER BY created_at DESC");
        $stmt->execute([$payload['user_id']]);
        Response::success($stmt->fetchAll());
    }
    public function create(): void {
        $payload = AuthMiddleware::requireRole('owner');
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        if (!$name) Response::error('Property name required');
        $amenities = is_array($input['amenities'] ?? []) ? implode(',', $input['amenities']) : '';
        $stmt = $this->db->prepare("INSERT INTO owner_properties (owner_id, name, city, country, stars, rooms, price_from, description, amenities) VALUES (?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$payload['user_id'], $name, $input['city'] ?? '', $input['country'] ?? '', (int)($input['stars'] ?? 5), (int)($input['rooms'] ?? 1), (float)($input['price_from'] ?? 0), $input['description'] ?? '', $amenities]);
        Response::success(['property_id' => $this->db->lastInsertId()], 'Property submitted', 201);
    }
    public function update(int $id): void {
        $payload = AuthMiddleware::requireRole('owner');
        $input = json_decode(file_get_contents('php://input'), true);
        $check = $this->db->prepare("SELECT * FROM owner_properties WHERE property_id = ? AND owner_id = ?");
        $check->execute([$id, $payload['user_id']]);
        if (!$check->fetch()) Response::forbidden('Not your property');
        $fields = [];
        $params = [];
        foreach (['name','city','country','stars','rooms','price_from','description'] as $f) {
            if (isset($input[$f])) {
                $fields[] = "$f = :$f";
                $params[":$f"] = $input[$f];
            }
        }
        if (isset($input['amenities']) && is_array($input['amenities'])) {
            $fields[] = "amenities = :amenities";
            $params[':amenities'] = implode(',', $input['amenities']);
        }
        if (empty($fields)) Response::error('No fields to update');
        $params[':id'] = $id;
        $sql = "UPDATE owner_properties SET " . implode(',', $fields) . " WHERE property_id = :id";
        $this->db->prepare($sql)->execute($params);
        Response::success(null, 'Property updated');
    }
    public function delete(int $id): void {
        $payload = AuthMiddleware::requireRole('owner');
        $stmt = $this->db->prepare("DELETE FROM owner_properties WHERE property_id = ? AND owner_id = ?");
        $stmt->execute([$id, $payload['user_id']]);
        Response::success(null, 'Property deleted');
    }
}
<?php
require_once __DIR__ . '/../utils/Response.php';

class AIConciergeController {
    private PDO $db;
    private array $hotels = [];
    
    // 🔑 مفتاح Groq API 
    private string $groqApiKey = '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';
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->createTables();
        $this->loadHotels();
    }
    
    private function createTables() {
        $this->db->exec("CREATE TABLE IF NOT EXISTS ai_conversations (
            conversation_id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(100),
            user_message TEXT,
            ai_response TEXT,
            extracted_city VARCHAR(100),
            extracted_budget INT,
            extracted_rooms INT,
            extracted_children INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    
    private function loadHotels() {
        $stmt = $this->db->query("SELECT name, city, price, stars, rating, description FROM hotels WHERE status='active'");
        $this->hotels = $stmt->fetchAll();
        if (empty($this->hotels)) {
            $this->hotels = [
                ['name'=>'Le Grand Hôtel', 'city'=>'Paris', 'price'=>450, 'stars'=>5, 'rating'=>4.9, 'description'=>'Belle Époque grandeur'],
                ['name'=>'Hôtel de Crillon', 'city'=>'Paris', 'price'=>980, 'stars'=>5, 'rating'=>4.95, 'description'=>'Palatial 18th-century'],
                ['name'=>'Burj Al Arab', 'city'=>'Dubai', 'price'=>1800, 'stars'=>5, 'rating'=>4.85, 'description'=>'Iconic sail-shaped'],
                ['name'=>'Atlantis The Palm', 'city'=>'Dubai', 'price'=>620, 'stars'=>5, 'rating'=>4.7, 'description'=>'Waterpark and restaurants'],
                ['name'=>'The Peninsula', 'city'=>'Tokyo', 'price'=>720, 'stars'=>5, 'rating'=>4.9, 'description'=>'Eastern refinement'],
                ['name'=>'Sofitel Algiers', 'city'=>'Algiers', 'price'=>220, 'stars'=>5, 'rating'=>4.72, 'description'=>'French elegance'],
                ['name'=>'El Djazair Hotel', 'city'=>'Algiers', 'price'=>180, 'stars'=>5, 'rating'=>4.65, 'description'=>'Colonial-era landmark'],
                ['name'=>'Four Seasons Bosphorus', 'city'=>'Istanbul', 'price'=>680, 'stars'=>5, 'rating'=>4.91, 'description'=>'Ottoman palace'],
                ['name'=>'La Mamounia', 'city'=>'Marrakech', 'price'=>750, 'stars'=>5, 'rating'=>4.94, 'description'=>'Moorish splendour'],
                ['name'=>'Hotel Arts Barcelona', 'city'=>'Barcelona', 'price'=>480, 'stars'=>5, 'rating'=>4.75, 'description'=>'Beachfront masterpiece']
            ];
        }
    }
    
    private function parseMessage(string $message): array {
        $text = strtolower($message);
        $city = null;
        $budget = null;
        $rooms = 1;
        $children = 0;
        $cities = ['paris','dubai','tokyo','algiers','marrakech','istanbul','barcelona','london','new york'];
        foreach ($cities as $c) {
            if (strpos($text, $c) !== false) { $city = $c; break; }
        }
        if (preg_match('/(\d+)/', $text, $m)) $budget = (int)$m[1];
        if (preg_match('/(\d+)\s*rooms?/', $text, $m)) $rooms = (int)$m[1];
        if (preg_match('/(\d+)\s*children?/', $text, $m)) $children = (int)$m[1];
        return ['city' => $city, 'budget' => $budget, 'rooms' => $rooms, 'children' => $children];
    }
    
    private function findMatchingHotels(array $parsed): array {
        $matches = array_filter($this->hotels, function($h) use ($parsed) {
            if ($parsed['city'] && strtolower($h['city']) !== $parsed['city']) return false;
            if ($parsed['budget'] && $h['price'] > $parsed['budget']) return false;
            return true;
        });
        usort($matches, fn($a,$b) => $b['rating'] <=> $a['rating']);
        return array_values($matches);
    }
    
    /**
     * استدعاء Groq API (مجاني وسريع)
     */
    private function callGroqAPI(string $message, array $matches): ?string {
        if (empty($this->groqApiKey)) return null;
        
        $url = 'https://api.groq.com/openai/v1/chat/completions';
        
        // بناء قائمة الفنادق للـ system prompt
        $hotelsList = "";
        foreach ($matches as $h) {
            $hotelsList .= "- {$h['name']} in {$h['city']}: \${$h['price']}/night, {$h['stars']}★\n";
        }
        
        $systemPrompt = "You are AURUM's AI concierge, a luxury hotel booking assistant. Available hotels:\n{$hotelsList}\nInstructions: Recommend 1-2 specific hotels from the list above. Include exact prices. Be warm, cultured, and concise (3-4 sentences). Respond in the same language as the guest (English or Arabic). Do not invent hotels outside the list.";
        
        $payload = [
            'model' => 'llama3-8b-8192',  // نموذج مجاني وسريع
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $message]
            ],
            'temperature' => 0.7,
            'max_tokens' => 300
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->groqApiKey
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            return $data['choices'][0]['message']['content'] ?? null;
        }
        
        return null;
    }
    
    /**
     * رد محلي (fallback) في حالة فشل API
     */
    private function generateLocalResponse(array $parsed, array $matches): string {
        if (empty($matches)) {
            $city = $parsed['city'] ? ucfirst($parsed['city']) : 'your destination';
            $budget = $parsed['budget'] ? "under \${$parsed['budget']}" : "in your range";
            return "I couldn't find any hotels in {$city} {$budget}. Could you try a different destination or increase your budget?";
        }
        $top = $matches[0];
        $reply = "Based on your request, I recommend {$top['name']} in " . ucfirst($top['city']) . ". It offers {$top['stars']} stars from \${$top['price']}/night. {$top['description']} ";
        if (count($matches) > 1) {
            $reply .= "Another great option is {$matches[1]['name']} from \${$matches[1]['price']}/night. Would you like to check availability?";
        }
        return $reply;
    }
    
    public function chat(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = trim($input['message'] ?? '');
        if (!$message) Response::error('Message required');
        
        $parsed = $this->parseMessage($message);
        $matches = $this->findMatchingHotels($parsed);
        
        // محاولة استخدام Groq API أولاً
        $aiText = $this->callGroqAPI($message, $matches);
        
        // إذا فشل، استخدم الرد المحلي
        if (!$aiText) {
            $aiText = $this->generateLocalResponse($parsed, $matches);
        }
        
        // حفظ المحادثة
        $stmt = $this->db->prepare("INSERT INTO ai_conversations (session_id, user_message, ai_response, extracted_city, extracted_budget, extracted_rooms, extracted_children) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([$input['session_id'] ?? uniqid(), $message, $aiText, $parsed['city'], $parsed['budget'], $parsed['rooms'], $parsed['children']]);
        
        Response::success(['response' => $aiText, 'suggestions' => $matches], 'AI response');
    }
    
    public function trainFromConversations(): array {
        $stmt = $this->db->query("SELECT extracted_city, extracted_budget, COUNT(*) as count FROM ai_conversations WHERE extracted_city IS NOT NULL GROUP BY extracted_city, extracted_budget ORDER BY count DESC LIMIT 20");
        $insights = $stmt->fetchAll();
        $cityStats = [];
        foreach ($insights as $i) {
            $city = $i['extracted_city'];
            $cityStats[$city] = ($cityStats[$city] ?? 0) + $i['count'];
        }
        return [
            'top_destinations' => $cityStats,
            'total_conversations' => (int)$this->db->query("SELECT COUNT(*) FROM ai_conversations")->fetchColumn(),
            'insights' => $insights
        ];
    }
}
?>
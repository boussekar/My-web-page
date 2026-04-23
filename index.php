<?php
// CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Response.php';

$request_uri = $_SERVER['REQUEST_URI'];
$base = '/backend/api/index.php';
if (strpos($request_uri, $base) === 0) {
    $path = substr($request_uri, strlen($base));
} else {
    $path = $request_uri;
}
$path = parse_url($path, PHP_URL_PATH);
$path = rtrim($path, '/');
if (empty($path)) $path = '/';
$method = $_SERVER['REQUEST_METHOD'];

// ========== Auth ==========
if ($path === '/auth/login' && $method === 'POST') {
    require_once __DIR__ . '/auth.php';
    (new AuthController())->login();
    exit;
}
if ($path === '/auth/register' && $method === 'POST') {
    require_once __DIR__ . '/auth.php';
    (new AuthController())->register();
    exit;
}

// ========== Hotels ==========
if ($path === '/hotels' && $method === 'GET') {
    require_once __DIR__ . '/hotels.php';
    (new HotelsController())->getAll();
    exit;
}
if (preg_match('#^/hotels/(\d+)$#', $path, $m) && $method === 'GET') {
    require_once __DIR__ . '/hotels.php';
    (new HotelsController())->getById((int)$m[1]);
    exit;
}

// ========== Bookings ==========
if ($path === '/bookings' && $method === 'POST') {
    require_once __DIR__ . '/bookings.php';
    (new BookingsController())->create();
    exit;
}
if ($path === '/bookings' && $method === 'GET') {
    require_once __DIR__ . '/bookings.php';
    (new BookingsController())->getUserBookings();
    exit;
}

// ========== Owner Properties ==========
if ($path === '/owner/properties' && $method === 'GET') {
    require_once __DIR__ . '/owner-properties.php';
    (new OwnerPropertiesController())->getAll();
    exit;
}
if ($path === '/owner/properties' && $method === 'POST') {
    require_once __DIR__ . '/owner-properties.php';
    (new OwnerPropertiesController())->create();
    exit;
}
if (preg_match('#^/owner/properties/(\d+)$#', $path, $m) && $method === 'PUT') {
    require_once __DIR__ . '/owner-properties.php';
    (new OwnerPropertiesController())->update((int)$m[1]);
    exit;
}
if (preg_match('#^/owner/properties/(\d+)$#', $path, $m) && $method === 'DELETE') {
    require_once __DIR__ . '/owner-properties.php';
    (new OwnerPropertiesController())->delete((int)$m[1]);
    exit;
}

// ========== Analytics (owner dashboard) ==========
if ($path === '/analytics/dashboard' && $method === 'GET') {
    require_once __DIR__ . '/analytics.php';
    (new AnalyticsController())->getDashboard();
    exit;
}

// ========== AI Concierge ==========
if ($path === '/ai/concierge' && $method === 'POST') {
    require_once __DIR__ . '/ai-concierge.php';
    (new AIConciergeController())->chat();
    exit;
}
if ($path === '/ai/train' && $method === 'GET') {
    require_once __DIR__ . '/ai-concierge.php';
    $ai = new AIConciergeController();
    $insights = $ai->trainFromConversations();
    Response::success($insights, 'Training insights');
    exit;
}

Response::notFound('API endpoint not found');
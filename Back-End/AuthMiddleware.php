<?php
// ============================================================
//  middleware/AuthMiddleware.php
//  Validates Bearer JWT on every protected route
// ============================================================

require_once __DIR__ . '/../utils/JwtHelper.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {

    /**
     * Call at the top of any protected controller method.
     * Returns the decoded payload array on success.
     */
    public static function handle(): array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            Response::unauthorized('Missing or malformed Authorization header.');
        }

        $token   = substr($authHeader, 7);
        $payload = JwtHelper::decode($token);

        if ($payload === null) {
            Response::unauthorized('Invalid or expired token.');
        }

        return $payload; // ['admin_id', 'username', 'role', 'iat', 'exp']
    }

    /**
     * Require a specific role (or higher).
     * Role hierarchy:  superadmin > manager > staff
     */
    public static function requireRole(string $required): array {
        $payload = self::handle();
        $hierarchy = ['staff' => 1, 'manager' => 2, 'superadmin' => 3];
        $userLevel = $hierarchy[$payload['role']] ?? 0;
        $reqLevel  = $hierarchy[$required]        ?? 99;

        if ($userLevel < $reqLevel) {
            Response::forbidden("Requires '{$required}' role or higher.");
        }
        return $payload;
    }
}

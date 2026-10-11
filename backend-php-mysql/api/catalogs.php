<?php
/**
 * مدیریت کالیته‌های مرجع پارچه (Master Fabric Catalogs)
 * مسیر: /backend-php-mysql/api/catalogs.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();

$action = $_GET['action'] ?? 'list';

try {
    switch ($action) {
        /**
         * ۱. لیست کاتالوگ‌های کالیته مرجع
         * GET /api/catalogs.php?action=list
         */
        case 'list':
            $stmt = $pdo->query("SELECT * FROM `master_fabric_catalogs` ORDER BY `id` DESC");
            $catalogs = $stmt ? $stmt->fetchAll() : [];
            echo json_encode(['success' => true, 'catalogs' => $catalogs], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. ثبت یا ویرایش کالیته جدید
         * POST /api/catalogs.php?action=save
         */
        case 'save':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $name = trim($input['name'] ?? '');
            $code = trim($input['code'] ?? '');
            $category = trim($input['category'] ?? 'مخمل');
            $price = (int)($input['suggestedUnitPrice'] ?? 850000);
            $texture = trim($input['texture'] ?? 'مات لطیف');
            $origin = trim($input['origin'] ?? 'ترکیه');
            $colorsCount = (int)($input['colorsCount'] ?? 18);
            $img = trim($input['imageUrl'] ?? '');
            $desc = trim($input['description'] ?? '');

            $stmt = $pdo->prepare("
                INSERT INTO `master_fabric_catalogs` (
                    `name`, `code`, `category`, `suggested_unit_price`, `texture`, `origin`, `colors_count`, `image_url`, `description`
                ) VALUES (
                    :name, :code, :cat, :price, :tex, :orig, :colors, :img, :desc
                )
            ");
            $stmt->execute([
                ':name' => $name,
                ':code' => $code,
                ':cat' => $category,
                ':price' => $price,
                ':tex' => $texture,
                ':orig' => $origin,
                ':colors' => $colorsCount,
                ':img' => $img,
                ':desc' => $desc
            ]);

            echo json_encode(['success' => true, 'message' => 'کالیته مرجع با موفقیت در سامانه ثبت شد.'], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

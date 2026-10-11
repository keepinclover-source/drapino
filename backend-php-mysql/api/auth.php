<?php
/**
 * مدیریت احراز هویت، ورود، ثبت‌نام و پروفایل کاربران
 * مسیر: /backend-php-mysql/api/auth.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
$pdo = Database::getConnection();

$action = $_GET['action'] ?? 'current';

try {
    switch ($action) {
        /**
         * ۱. ورود به سیستم با شماره موبایل
         * POST /api/auth.php?action=login
         * Body: { "phone": "09121112233", "role": "customer" }
         */
        case 'login':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $phone = trim($input['phone'] ?? '');
            $expectedRole = $input['role'] ?? null;

            if (empty($phone)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'شماره موبایل الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `phone` = :phone LIMIT 1");
            $stmt->execute([':phone' => $phone]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'کاربری با این شماره یافت نشد. لطفاً ابتدا ثبت‌نام فرمایید.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($expectedRole && $user['role'] !== $expectedRole) {
                // اگر نقش مطابقت نداشت
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => "این حساب متعلق به نقش {$user['role']} است."], JSON_UNESCAPED_UNICODE);
                exit;
            }

            echo json_encode([
                'success' => true,
                'user' => $user,
                'message' => 'ورود موفقیت‌آمیز به سامانه دراپینو'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. ثبت‌نام کاربر جدید (مشتری یا فروشگاه همکار)
         * POST /api/auth.php?action=register
         */
        case 'register':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $name = trim($input['name'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $role = in_array($input['role'] ?? '', ['customer', 'vendor', 'admin']) ? $input['role'] : 'customer';
            $city = trim($input['city'] ?? 'تهران');
            $district = trim($input['district'] ?? '');
            $address = trim($input['address'] ?? '');
            $storeName = trim($input['storeName'] ?? '');

            if (empty($name) || empty($phone)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'نام و شماره تماس الزامی هستند.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // بررسی تکراری نبودن شماره
            $stmtCheck = $pdo->prepare("SELECT id FROM `users` WHERE `phone` = :phone LIMIT 1");
            $stmtCheck->execute([':phone' => $phone]);
            if ($stmtCheck->fetchColumn()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'این شماره موبایل قبلاً در سامانه ثبت شده است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $userUid = 'usr-' . time() . '-' . rand(100, 999);
            $vendorId = null;

            $pdo->beginTransaction();

            // اگر فروشگاه بود، در جدول curtain_vendors هم رکورد ثبت می‌شود
            if ($role === 'vendor') {
                $vendorId = 'vnd-' . time();
                $stmtV = $pdo->prepare("
                    INSERT INTO `curtain_vendors` (
                        `vendor_uid`, `name`, `owner_name`, `phone`, `city`, `address`, `tier`, `is_verified`, `verification_status`
                    ) VALUES (
                        :vuid, :vname, :owner, :phone, :city, :addr, 'نقره‌ای', 0, 'pending_verification'
                    )
                ");
                $stmtV->execute([
                    ':vuid' => $vendorId,
                    ':vname' => !empty($storeName) ? $storeName : "گالری پرده {$name}",
                    ':owner' => $name,
                    ':phone' => $phone,
                    ':city' => $city,
                    ':addr' => $address
                ]);
            }

            $stmtUser = $pdo->prepare("
                INSERT INTO `users` (
                    `user_uid`, `name`, `phone`, `role`, `vendor_id`, `store_name`, `city`, `district`, `address`
                ) VALUES (
                    :uid, :name, :phone, :role, :vid, :sname, :city, :dist, :addr
                )
            ");
            $stmtUser->execute([
                ':uid' => $userUid,
                ':name' => $name,
                ':phone' => $phone,
                ':role' => $role,
                ':vid' => $vendorId,
                ':sname' => $storeName,
                ':city' => $city,
                ':dist' => $district,
                ':addr' => $address
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'user' => [
                    'user_uid' => $userUid,
                    'name' => $name,
                    'phone' => $phone,
                    'role' => $role,
                    'city' => $city,
                    'storeName' => $storeName
                ],
                'message' => 'ثبت‌نام با موفقیت انجام شد و حساب کاربری فعال گردید.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. ویرایش پروفایل کاربر
         * POST /api/auth.php?action=update_profile
         */
        case 'update_profile':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $phone = trim($input['phone'] ?? '');
            $name = trim($input['name'] ?? '');
            $city = trim($input['city'] ?? '');
            $district = trim($input['district'] ?? '');
            $address = trim($input['address'] ?? '');

            if (empty($phone)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'شماره موبایل الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE `users` 
                SET `name` = :name, `city` = :city, `district` = :district, `address` = :address
                WHERE `phone` = :phone
            ");
            $stmt->execute([
                ':name' => $name,
                ':city' => $city,
                ':district' => $district,
                ':address' => $address,
                ':phone' => $phone
            ]);

            echo json_encode(['success' => true, 'message' => 'پروفایل با موفقیت بروزرسانی شد.'], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

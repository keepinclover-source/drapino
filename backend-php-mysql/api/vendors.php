<?php
/**
 * مدیریت فروشگاه‌ها، آگهی‌های نردبان ویترین و کیف پول کاری
 * مسیر: /backend-php-mysql/api/vendors.php
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

$action = $_GET['action'] ?? 'list';

try {
    switch ($action) {
        /**
         * ۱. دریافت لیست فروشگاه‌های یک شهر یا کلان‌شهر
         * GET /api/vendors.php?action=list&city=تهران
         */
        case 'list':
            $city = trim($_GET['city'] ?? '');
            
            if (!empty($city)) {
                $stmt = $pdo->prepare("
                    SELECT * FROM `curtain_vendors`
                    WHERE (`city` = :city OR JSON_CONTAINS(`covered_districts_json`, JSON_QUOTE(:city)))
                    AND `verification_status` = 'verified'
                    ORDER BY `is_promoted_ad` DESC, `promoted_ladder_position` ASC, `rating` DESC
                ");
                $stmt->execute([':city' => $city]);
            } else {
                $stmt = $pdo->query("SELECT * FROM `curtain_vendors` ORDER BY `rating` DESC");
            }

            $vendors = $stmt->fetchAll();
            echo json_encode(['success' => true, 'vendors' => $vendors], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. شارژ آنلاین کیف پول فروشگاه
         * POST /api/vendors.php?action=topup_wallet
         */
        case 'topup_wallet':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $vendorId = (int)($input['vendorId'] ?? 0);
            $amount = (int)($input['amount'] ?? 0);

            if ($vendorId <= 0 || $amount <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'مبلغ یا شناسه فروشگاه نامعتبر است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pdo->beginTransaction();
            $pdo->prepare("UPDATE `curtain_vendors` SET `wallet_balance` = `wallet_balance` + :amt WHERE `id` = :id")
                ->execute([':amt' => $amount, ':id' => $vendorId]);

            $newBal = $pdo->query("SELECT `wallet_balance` FROM `curtain_vendors` WHERE `id` = {$vendorId}")->fetchColumn();

            $pdo->prepare("
                INSERT INTO `vendor_transactions` (`transaction_uid`, `vendor_id`, `type`, `amount`, `description`, `balance_after`)
                VALUES (:uid, :vid, 'deposit', :amt, 'شارژ آنلاین کیف پول از درگاه شتاب', :ba)
            ")->execute([
                ':uid' => 'tx-' . time() . '-' . rand(100, 999),
                ':vid' => $vendorId,
                ':amt' => $amount,
                ':ba' => $newBal
            ]);

            $pdo->commit();
            echo json_encode([
                'success' => true,
                'newBalance' => $newBal,
                'message' => 'کیف پول فروشگاه با موفقیت شارژ گردید.'
            ], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

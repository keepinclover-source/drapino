<?php
/**
 * مدیریت تیکت‌های پشتیبانی، شکایات و داوری رسمی اتحادیه
 * مسیر: /backend-php-mysql/api/tickets.php
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
         * ۱. ایجاد تیکت یا شکایت جدید
         * POST /api/tickets.php?action=create
         */
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            
            $ticketNumber = 'TK-' . rand(10000, 99999);
            $userId = trim($input['userId'] ?? 'usr-customer');
            $userName = trim($input['userName'] ?? 'مشتری');
            $userPhone = trim($input['userPhone'] ?? '');
            $userRole = trim($input['userRole'] ?? 'customer');
            $category = trim($input['category'] ?? 'شکایت از کیفیت دوخت یا پارچه');
            $priority = trim($input['priority'] ?? 'high');
            $subject = trim($input['subject'] ?? 'شکایت رسمی');
            $message = trim($input['message'] ?? '');
            $orderId = (int)($input['orderId'] ?? 0);
            $orderNumber = trim($input['orderNumber'] ?? '');
            $vendorId = (int)($input['vendorId'] ?? 0);
            $vendorName = trim($input['vendorName'] ?? '');

            if (empty($subject) || empty($message)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'موضوع و متن پیام الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO `support_tickets` (
                    `ticket_number`, `user_id`, `user_name`, `user_phone`, `user_role`,
                    `category`, `priority`, `subject`, `order_id`, `order_number`,
                    `vendor_id`, `vendor_name`, `status`, `created_at`
                ) VALUES (
                    :tnum, :uid, :uname, :uphone, :urole,
                    :cat, :pri, :subj, :oid, :onum,
                    :vid, :vname, 'pending', NOW()
                )
            ");

            $stmt->execute([
                ':tnum' => $ticketNumber,
                ':uid' => $userId,
                ':uname' => $userName,
                ':uphone' => $userPhone,
                ':urole' => $userRole,
                ':cat' => $category,
                ':pri' => $priority,
                ':subj' => $subject,
                ':oid' => $orderId > 0 ? $orderId : null,
                ':onum' => !empty($orderNumber) ? $orderNumber : null,
                ':vid' => $vendorId > 0 ? $vendorId : null,
                ':vname' => !empty($vendorName) ? $vendorName : null,
            ]);

            $ticketId = (int)$pdo->lastInsertId();

            // پیام اولیه
            $stmtMsg = $pdo->prepare("
                INSERT INTO `ticket_messages` (
                    `ticket_id`, `sender_id`, `sender_name`, `sender_role`, `message`, `sent_at`
                ) VALUES (
                    :tid, :sid, :sname, :srole, :msg, NOW()
                )
            ");
            $stmtMsg->execute([
                ':tid' => $ticketId,
                ':sid' => $userId,
                ':sname' => $userName,
                ':srole' => $userRole,
                ':msg' => $message
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'ticketId' => $ticketId,
                'ticketNumber' => $ticketNumber,
                'message' => 'شکایت رسمی ثبت شد و جهت بررسی در اختیار کمیسیون بازرسی قرار گرفت.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. ارسال پیام جدید در تیکت
         * POST /api/tickets.php?action=reply
         */
        case 'reply':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $ticketId = (int)($input['ticketId'] ?? 0);
            $senderId = trim($input['senderId'] ?? 'admin');
            $senderName = trim($input['senderName'] ?? 'پشتیبانی اتحادیه');
            $senderRole = trim($input['senderRole'] ?? 'admin');
            $message = trim($input['message'] ?? '');

            if ($ticketId <= 0 || empty($message)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'متن پیام الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO `ticket_messages` (`ticket_id`, `sender_id`, `sender_name`, `sender_role`, `message`, `sent_at`)
                VALUES (:tid, :sid, :sname, :srole, :msg, NOW())
            ");
            $stmt->execute([
                ':tid' => $ticketId,
                ':sid' => $senderId,
                ':sname' => $senderName,
                ':srole' => $senderRole,
                ':msg' => $message
            ]);

            echo json_encode(['success' => true, 'message' => 'پیام با موفقیت ارسال شد.'], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. لیست تیکت‌ها
         * GET /api/tickets.php?action=list
         */
        case 'list':
        default:
            $stmt = $pdo->query("SELECT * FROM `support_tickets` ORDER BY `id` DESC");
            $tickets = $stmt->fetchAll();
            echo json_encode(['success' => true, 'tickets' => $tickets], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

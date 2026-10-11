<?php
/**
 * مدیریت ارزیابی، نظرات و امتیازدهی مشتریان به فروشگاه‌ها
 * مسیر: /backend-php-mysql/api/reviews.php
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
         * ۱. ثبت نظر و ارزیابی جدید برای فروشگاه
         * POST /api/reviews.php?action=submit
         */
        case 'submit':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            
            $orderId = (int)($input['orderId'] ?? 0);
            $orderNumber = trim($input['orderNumber'] ?? '');
            $vendorId = (int)($input['vendorId'] ?? 0);
            $customerName = trim($input['customerName'] ?? 'مشتری');
            $customerPhone = trim($input['customerPhone'] ?? '');
            $customerCity = trim($input['customerCity'] ?? 'تهران');
            $rating = (int)($input['rating'] ?? 5);
            $comment = trim($input['comment'] ?? '');
            $criteria = $input['criteria'] ?? ['fabricQuality' => 5, 'specialistBehavior' => 5, 'installationPrecision' => 5];
            $tags = $input['tags'] ?? ['وقت‌شناسی عالی', 'تنوع کالیته بالا'];

            if ($orderId <= 0 || empty($comment)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'مشخصات سفارش و متن نظر الزامی هستند.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO `vendor_reviews` (
                    `order_id`, `order_number`, `vendor_id`, `customer_name`, `customer_phone`,
                    `customer_city`, `rating`, `comment`, `review_date`, `criteria_json`, `tags_json`
                ) VALUES (
                    :oid, :onum, :vid, :cname, :cphone,
                    :ccity, :rating, :comment, :rdate, :criteria, :tags
                )
            ");

            $stmt->execute([
                ':oid' => $orderId,
                ':onum' => $orderNumber,
                ':vid' => $vendorId,
                ':cname' => $customerName,
                ':cphone' => $customerPhone,
                ':ccity' => $customerCity,
                ':rating' => $rating,
                ':comment' => $comment,
                ':rdate' => date('Y/m/d'),
                ':criteria' => json_encode($criteria, JSON_UNESCAPED_UNICODE),
                ':tags' => json_encode($tags, JSON_UNESCAPED_UNICODE)
            ]);

            // بازنگری میانگین امتیاز فروشگاه
            $stmtAvg = $pdo->prepare("
                SELECT AVG(rating) as `avg_rating`, COUNT(id) as `count`
                FROM `vendor_reviews` WHERE `vendor_id` = :vid
            ");
            $stmtAvg->execute([':vid' => $vendorId]);
            $stats = $stmtAvg->fetch();

            if ($stats) {
                $pdo->prepare("
                    UPDATE `curtain_vendors`
                    SET `rating` = :rating, `rating_count` = :cnt
                    WHERE `id` = :vid
                ")->execute([
                    ':rating' => round((float)$stats['avg_rating'], 1),
                    ':cnt' => (int)$stats['count'],
                    ':vid' => $vendorId
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'نظر و ارزیابی شما با موفقیت در کارنامه رسمی فروشگاه ثبت شد.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. پاسخ رسمی فروشگاه همکار به نظر مشتری
         * POST /api/reviews.php?action=vendor_reply
         */
        case 'vendor_reply':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $reviewId = (int)($input['reviewId'] ?? 0);
            $replyText = trim($input['replyText'] ?? '');

            if ($reviewId <= 0 || empty($replyText)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'متن پاسخ الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $replyData = [
                'text' => $replyText,
                'date' => date('Y/m/d H:i')
            ];

            $stmt = $pdo->prepare("UPDATE `vendor_reviews` SET `vendor_reply_json` = :reply WHERE `id` = :id");
            $stmt->execute([
                ':reply' => json_encode($replyData, JSON_UNESCAPED_UNICODE),
                ':id' => $reviewId
            ]);

            echo json_encode(['success' => true, 'message' => 'پاسخ فروشگاه ثبت گردید.'], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. لیست نظرات یک فروشگاه
         * GET /api/reviews.php?action=list&vendorId=1
         */
        case 'list':
        default:
            $vendorId = (int)($_GET['vendorId'] ?? 0);
            if ($vendorId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM `vendor_reviews` WHERE `vendor_id` = :vid ORDER BY `id` DESC");
                $stmt->execute([':vid' => $vendorId]);
            } else {
                $stmt = $pdo->query("SELECT * FROM `vendor_reviews` ORDER BY `id` DESC LIMIT 50");
            }
            $reviews = $stmt->fetchAll();

            $formatted = array_map(function($r) {
                $r['criteria'] = json_decode($r['criteria_json'] ?? '{}', true) ?: [];
                $r['tags'] = json_decode($r['tags_json'] ?? '[]', true) ?: [];
                $r['vendorReply'] = json_decode($r['vendor_reply_json'] ?? 'null', true);
                return $r;
            }, $reviews);

            echo json_encode(['success' => true, 'reviews' => $formatted], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

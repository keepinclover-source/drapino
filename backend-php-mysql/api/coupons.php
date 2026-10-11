<?php
/**
 * سامانه مدیریت کدهای تخفیف و بن‌های وفاداری خرید موفق با اعمال سقف عددی
 * مسیر: /backend-php-mysql/api/coupons.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
         * ۱. اعتبارسنجی کد تخفیف و محاسبه مبلغ با در نظر گرفتن سقف عددی
         * POST /api/coupons.php?action=validate
         * Body: { "code": "AUTOFALL50", "orderAmount": 350000, "customerPhone": "09121234567" }
         */
        case 'validate':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $code = trim($input['code'] ?? '');
            $orderAmount = (int)($input['orderAmount'] ?? 350000);
            $customerPhone = trim($input['customerPhone'] ?? '');

            if (empty($code)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'لطفاً کد تخفیف را وارد کنید.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM `discount_coupons` WHERE `code` = :code LIMIT 1");
            $stmt->execute([':code' => strtoupper($code)]);
            $coupon = $stmt->fetch();

            if (!$coupon) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'کد تخفیف وارد شده در سامانه یافت نشد.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!$coupon['is_active']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'این کد تخفیف در حال حاضر غیرفعال شده است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($coupon['used_count'] >= $coupon['usage_limit']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ظرفیت استفاده از این کد تخفیف به پایان رسیده است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!empty($coupon['assigned_customer_phone'])) {
                $cleanAssigned = preg_replace('/\D/', '', $coupon['assigned_customer_phone']);
                $cleanInput = preg_replace('/\D/', '', $customerPhone);
                if (!empty($cleanInput) && substr($cleanAssigned, -7) !== substr($cleanInput, -7)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'این بن تخفیف اختصاصی متعلق به شماره موبایل دیگری است.'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            if ($orderAmount < (int)$coupon['min_order_amount']) {
                $minFormatted = number_format((int)$coupon['min_order_amount']);
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'message' => "حداقل مبلغ سفارش برای استفاده از این کد {$minFormatted} تومان می‌باشد."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // محاسبه تخفیف با رعایت دقیق سقف عددی (Ceiling Limit)
            $discountType = $coupon['discount_type'];
            $discountValue = (int)$coupon['discount_value'];
            $maxCeiling = (int)$coupon['max_discount_amount'];

            $rawDiscount = ($discountType === 'percentage')
                ? (int)round(($orderAmount * $discountValue) / 100)
                : $discountValue;

            $isCapped = ($rawDiscount > $maxCeiling);
            $finalDiscount = $isCapped ? $maxCeiling : min($rawDiscount, $orderAmount);
            $payable = max(0, $orderAmount - $finalDiscount);

            echo json_encode([
                'success' => true,
                'coupon' => [
                    'id' => $coupon['id'],
                    'code' => $coupon['code'],
                    'title' => $coupon['title'],
                    'discountType' => $discountType,
                    'discountValue' => $discountValue,
                    'maxDiscountAmount' => $maxCeiling,
                    'calculatedDiscount' => $finalDiscount,
                    'isCapped' => $isCapped,
                    'finalPayable' => $payable,
                ],
                'message' => $isCapped
                    ? "کد تخفیف اعمال شد و سقف حداکثر " . number_format($maxCeiling) . " تومان لحاظ گردید."
                    : "کد تخفیف با موفقیت به مبلغ " . number_format($finalDiscount) . " تومان اعمال شد."
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. صدور خودکار بن وفاداری پس از خرید موفق مشتری
         * POST /api/coupons.php?action=issue_auto_loyalty
         * Body: { "customerName": "احمد رضایی", "customerPhone": "09121234567", "orderId": "AP-7840", "purchaseAmount": 16000000 }
         */
        case 'issue_auto_loyalty':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $customerName = trim($input['customerName'] ?? 'مشتری محترم');
            $customerPhone = trim($input['customerPhone'] ?? '');
            $orderId = trim((string)($input['orderId'] ?? 'ORD-' . time()));
            $purchaseAmount = (int)($input['purchaseAmount'] ?? 5000000);

            $cleanPhone = preg_replace('/\D/', '', $customerPhone);
            $phoneSuffix = substr($cleanPhone, -4) ?: '9900';
            $randCode = rand(1000, 9999);
            $newCode = "LOYAL-{$phoneSuffix}-{$randCode}";

            // تخفیف بر اساس میزان خرید
            $isHighValue = ($purchaseAmount >= 15000000);
            $discountPercent = $isHighValue ? 20 : 15;
            $ceiling = $isHighValue ? 750000 : 500000;

            $stmt = $pdo->prepare("
                INSERT INTO `discount_coupons` (
                    `code`, `title`, `description`, `discount_type`, `discount_value`, 
                    `max_discount_amount`, `min_order_amount`, `applies_to`, 
                    `assigned_customer_name`, `assigned_customer_phone`, 
                    `is_auto_generated`, `trigger_order_id`, `usage_limit`, `used_count`, `expires_at`, `is_active`
                ) VALUES (
                    :code, :title, :description, 'percentage', :discount_value,
                    :max_ceiling, 300000, 'both',
                    :cust_name, :cust_phone,
                    1, :trigger_order, 1, 0, '۱۴۰۴/۱۲/۲۹', 1
                )
            ");

            $title = "بن وفاداری خرید موفق پرده ({$customerName})";
            $desc = "تخفیف {$discountPercent}٪ تا سقف " . number_format($ceiling) . " تومان به پاس خرید موفق قبلی در سفارش #{$orderId}";

            $stmt->execute([
                ':code' => $newCode,
                ':title' => $title,
                ':description' => $desc,
                ':discount_value' => $discountPercent,
                ':max_ceiling' => $ceiling,
                ':cust_name' => $customerName,
                ':cust_phone' => $customerPhone,
                ':trigger_order' => $orderId,
            ]);

            echo json_encode([
                'success' => true,
                'coupon' => [
                    'code' => $newCode,
                    'title' => $title,
                    'discountValue' => $discountPercent,
                    'maxDiscountAmount' => $ceiling,
                    'assignedCustomerName' => $customerName,
                    'assignedCustomerPhone' => $customerPhone,
                    'isAutoGenerated' => true
                ],
                'message' => "کد تخفیف وفاداری {$newCode} با سقف " . number_format($ceiling) . " تومان صادر گردید."
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. ایجاد دستی کد تخفیف با تعیین سقف ریالی توسط مدیر
         * POST /api/coupons.php?action=create_manual
         */
        case 'create_manual':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $code = strtoupper(trim($input['code'] ?? ''));
            $title = trim($input['title'] ?? '');
            $discountType = in_array($input['discountType'] ?? '', ['percentage', 'fixed_amount']) ? $input['discountType'] : 'percentage';
            $discountValue = (int)($input['discountValue'] ?? 15);
            $maxCeiling = (int)($input['maxDiscountAmount'] ?? 500000);
            $minOrder = (int)($input['minOrderAmount'] ?? 0);
            $usageLimit = (int)($input['usageLimit'] ?? 1);
            $expiresAt = trim($input['expiresAt'] ?? '۱۴۰۴/۱۲/۲۹');
            $customerPhone = trim($input['assignedCustomerPhone'] ?? '');
            $customerName = trim($input['assignedCustomerName'] ?? '');

            if (empty($code) || empty($title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'کد و عنوان تخفیف الزامی هستند.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO `discount_coupons` (
                    `code`, `title`, `description`, `discount_type`, `discount_value`, 
                    `max_discount_amount`, `min_order_amount`, `applies_to`,
                    `assigned_customer_name`, `assigned_customer_phone`,
                    `is_auto_generated`, `usage_limit`, `used_count`, `expires_at`, `is_active`
                ) VALUES (
                    :code, :title, :description, :type, :val,
                    :max_ceiling, :min_order, 'both',
                    :cust_name, :cust_phone,
                    0, :usage_limit, 0, :expires, 1
                )
            ");

            $desc = $input['description'] ?? ($discountType === 'percentage' 
                ? "تخفیف {$discountValue}٪ تا سقف " . number_format($maxCeiling) . " تومان"
                : "تخفیف نقدی " . number_format($discountValue) . " تومان");

            $stmt->execute([
                ':code' => $code,
                ':title' => $title,
                ':description' => $desc,
                ':type' => $discountType,
                ':val' => $discountValue,
                ':max_ceiling' => $maxCeiling,
                ':min_order' => $minOrder,
                ':cust_name' => !empty($customerName) ? $customerName : null,
                ':cust_phone' => !empty($customerPhone) ? $customerPhone : null,
                ':usage_limit' => $usageLimit,
                ':expires' => $expiresAt
            ]);

            echo json_encode(['success' => true, 'message' => 'کد تخفیف جدید با سقف عددی با موفقیت ثبت شد.'], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۴. لیست تمام کدهای تخفیف با فیلترها برای پنل ادمین
         * GET /api/coupons.php?action=list
         */
        case 'list':
        default:
            $stmt = $pdo->query("SELECT * FROM `discount_coupons` ORDER BY `id` DESC");
            $coupons = $stmt->fetchAll();
            echo json_encode(['success' => true, 'coupons' => $coupons], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

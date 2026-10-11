<?php
/**
 * مدیریت چرخه سفارشات، تابلوی شکار فروشگاه‌ها و اتصال سفارشات شهرهای اقماری
 * مسیر: /backend-php-mysql/api/orders.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
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
         * ۱. ثبت سفارش مشاوره و پرو کالیته در منزل توسط مشتری
         * POST /api/orders.php?action=create
         */
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            
            $customerName = trim($input['customerName'] ?? 'مشتری جدید');
            $phone = trim($input['phone'] ?? '');
            $city = trim($input['city'] ?? 'تهران');
            $district = trim($input['district'] ?? 'مرکز شهر');
            $address = trim($input['address'] ?? '');
            $floorAndUnit = trim($input['floorAndUnit'] ?? '');
            $rooms = $input['rooms'] ?? ['سالن پذیرایی'];
            $windows = (int)($input['approximateWindows'] ?? 1);
            $width = (float)($input['approximateWidthMeters'] ?? 3.5);
            $styles = $input['preferredStyles'] ?? ['مخمل کالیفرنیا ترک'];
            $preferredDate = trim($input['preferredDate'] ?? date('Y-m-d'));
            $timeSlot = trim($input['timeSlot'] ?? '۱۵:۰۰ الی ۱۸:۰۰');
            $notes = trim($input['notes'] ?? '');
            $couponCode = trim($input['discountCouponCode'] ?? '');

            if (empty($phone) || empty($address)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'شماره تماس و نشانی دقیق الزامی هستند.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // بررسی خودکار آیا این شهر یک شهر اقماری است یا کلان‌شهر؟
            $stmtSatCheck = $pdo->prepare("
                SELECT s.*, h.name as `hub_name`, h.province as `hub_province`
                FROM `satellite_cities` s
                JOIN `operational_cities` h ON s.hub_city_id = h.id
                WHERE s.name = :city LIMIT 1
            ");
            $stmtSatCheck->execute([':city' => $city]);
            $satInfo = $stmtSatCheck->fetch();

            $isSatellite = (bool)$satInfo;
            $parentHubCity = $satInfo ? $satInfo['hub_name'] : $city;
            $province = $satInfo ? $satInfo['hub_province'] : 'تهران';
            $distanceKm = $satInfo ? (int)$satInfo['distance_km_from_hub'] : 0;

            // محاسبه بیعانه با در نظر گرفتن کد تخفیف و سقف عددی
            $baseDeposit = 350000;
            $discountApplied = 0;

            if (!empty($couponCode)) {
                $stmtCoup = $pdo->prepare("SELECT * FROM `discount_coupons` WHERE `code` = :c AND `is_active` = 1 LIMIT 1");
                $stmtCoup->execute([':c' => strtoupper($couponCode)]);
                $coup = $stmtCoup->fetch();

                if ($coup && $coup['used_count'] < $coup['usage_limit']) {
                    $val = (int)$coup['discount_value'];
                    $ceiling = (int)$coup['max_discount_amount'];

                    $raw = ($coup['discount_type'] === 'percentage') 
                        ? (int)round(($baseDeposit * $val) / 100)
                        : $val;

                    $discountApplied = min($raw, $ceiling);
                    $discountApplied = min($discountApplied, $baseDeposit);

                    // افزایش تعداد استفاده از کد
                    $pdo->prepare("UPDATE `discount_coupons` SET `used_count` = `used_count` + 1 WHERE `id` = :id")
                        ->execute([':id' => $coup['id']]);
                }
            }

            $finalDeposit = max(0, $baseDeposit - $discountApplied);
            $orderNumber = (string)rand(10000, 99999);

            $stmtInsert = $pdo->prepare("
                INSERT INTO `visit_requests` (
                    `order_number`, `customer_name`, `phone`, `province`, `city`, `district`,
                    `address`, `floor_and_unit`, `rooms_json`, `approximate_windows`, `approximate_width_meters`,
                    `preferred_styles_json`, `preferred_date`, `time_slot`, `notes`,
                    `is_satellite_order`, `parent_hub_city`, `distance_km_from_hub`,
                    `deposit_amount`, `deposit_status`, `discount_coupon_code`, `discount_amount_applied`,
                    `original_deposit_before_discount`, `status`, `claim_cost`
                ) VALUES (
                    :num, :cust, :phone, :prov, :city, :dist,
                    :addr, :unit, :rooms, :windows, :width,
                    :styles, :pdate, :tslot, :notes,
                    :is_sat, :parent_hub, :dist_km,
                    :deposit, 'paid', :coupon_code, :disc_amount,
                    :base_dep, 'bidding', 550000
                )
            ");

            $stmtInsert->execute([
                ':num' => $orderNumber,
                ':cust' => $customerName,
                ':phone' => $phone,
                ':prov' => $province,
                ':city' => $city,
                ':dist' => $district,
                ':addr' => $address,
                ':unit' => $floorAndUnit,
                ':rooms' => json_encode($rooms, JSON_UNESCAPED_UNICODE),
                ':windows' => $windows,
                ':width' => $width,
                ':styles' => json_encode($styles, JSON_UNESCAPED_UNICODE),
                ':pdate' => $preferredDate,
                ':tslot' => $timeSlot,
                ':notes' => $notes,
                ':is_sat' => $isSatellite ? 1 : 0,
                ':parent_hub' => $parentHubCity,
                ':dist_km' => $distanceKm,
                ':deposit' => $finalDeposit,
                ':coupon_code' => !empty($couponCode) ? $couponCode : null,
                ':disc_amount' => $discountApplied,
                ':base_dep' => $baseDeposit,
            ]);

            $orderId = (int)$pdo->lastInsertId();

            // ثبت رویداد لاگ اولیه
            $pdo->prepare("
                INSERT INTO `order_timelines` (`order_id`, `title`, `event_date`, `event_time`, `description`, `actor`, `type`)
                VALUES (:oid, 'ثبت سفارش و پرداخت بیعانه', :edate, :etime, :desc, 'مشتری', 'creation')
            ")->execute([
                ':oid' => $orderId,
                ':edate' => date('Y/m/d'),
                ':etime' => date('H:i'),
                ':desc' => $isSatellite 
                    ? "سفارش شهر اقماری {$city} متصل به تابلوی شکار کلان‌شهر {$parentHubCity} با پرداخت بیعانه " . number_format($finalDeposit) . " تومانی ثبت شد."
                    : "سفارش مشاوره در منزل ثبت و در تابلوی رقابتی فروشگاه‌های {$city} قرار گرفت."
            ]);

            echo json_encode([
                'success' => true,
                'orderId' => $orderId,
                'orderNumber' => $orderNumber,
                'city' => $city,
                'isSatelliteOrder' => $isSatellite,
                'parentHubCity' => $parentHubCity,
                'depositPaid' => $finalDeposit,
                'discountAmount' => $discountApplied,
                'message' => 'سفارش شما با موفقیت ثبت شد و به نزدیک‌ترین فروشگاه‌های دارای پروانه ارجاع گردید.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. دریافت تابلوی شکار سفارشات برای فروشندگان با احتساب شهرهای اقماری
         * GET /api/orders.php?action=hunting_board&vendorCity=تهران
         */
        case 'hunting_board':
            $vendorCity = trim($_GET['vendorCity'] ?? 'تهران');

            // یافتن تمام شهرهای اقماری متصل به شهر این فروشگاه
            $stmtSat = $pdo->prepare("
                SELECT s.name 
                FROM `satellite_cities` s
                JOIN `operational_cities` h ON s.hub_city_id = h.id
                WHERE h.name = :hub
            ");
            $stmtSat->execute([':hub' => $vendorCity]);
            $satelliteCityNames = $stmtSat->fetchAll(PDO::FETCH_COLUMN) ?: [];

            // فروشنده تهران سفارشات تهران + پرند + پردیس + شهریار + اسلامشهر و ... را می‌بیند
            $allCoveredCities = array_merge([$vendorCity], $satelliteCityNames);
            $inClause = implode(',', array_fill(0, count($allCoveredCities), '?'));

            $sql = "
                SELECT * FROM `visit_requests`
                WHERE `status` IN ('bidding', 're_routed')
                AND (`city` IN ($inClause) OR `parent_hub_city` = ?)
                ORDER BY `id` DESC
            ";

            $params = array_merge($allCoveredCities, [$vendorCity]);
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'vendorCity' => $vendorCity,
                'coveredSatellites' => $satelliteCityNames,
                'availableOrdersCount' => count($orders),
                'orders' => array_map(function($o) use ($vendorCity) {
                    $o['isSatellite'] = ($o['city'] !== $vendorCity || (bool)$o['is_satellite_order']);
                    $o['rooms'] = json_decode($o['rooms_json'] ?? '[]', true) ?: [];
                    $o['preferredStyles'] = json_decode($o['preferred_styles_json'] ?? '[]', true) ?: [];
                    return $o;
                }, $orders)
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. شکار سفارش توسط فروشگاه همکار
         * POST /api/orders.php?action=claim_order
         * Body: { "orderId": 12, "vendorId": 1 }
         */
        case 'claim_order':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $orderId = (int)($input['orderId'] ?? 0);
            $vendorId = (int)($input['vendorId'] ?? 0);

            $stmtV = $pdo->prepare("SELECT * FROM `curtain_vendors` WHERE `id` = :id LIMIT 1");
            $stmtV->execute([':id' => $vendorId]);
            $vendor = $stmtV->fetch();

            if (!$vendor) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'فروشگاه یافت نشد.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $leadCost = 550000;
            if ((int)$vendor['wallet_balance'] < $leadCost) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'موجودی کیف پول شما برای شکار این سفارش کافی نیست.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // کسر از کیف پول و تغییر وضعیت به assigned
            $pdo->beginTransaction();
            $newBalance = (int)$vendor['wallet_balance'] - $leadCost;

            $pdo->prepare("UPDATE `curtain_vendors` SET `wallet_balance` = :bal WHERE `id` = :id")
                ->execute([':bal' => $newBalance, ':id' => $vendorId]);

            $pdo->prepare("
                INSERT INTO `vendor_transactions` (`transaction_uid`, `vendor_id`, `type`, `amount`, `description`, `order_id`, `balance_after`)
                VALUES (:uid, :vid, 'order_claim_fee', :amt, :desc, :oid, :ba)
            ")->execute([
                ':uid' => 'tx-' . time() . '-' . rand(100, 999),
                ':vid' => $vendorId,
                ':amt' => $leadCost,
                ':desc' => "کسر هزینه شکار سفارش مشتری در تابلوی رقابتی",
                ':oid' => $orderId,
                ':ba' => $newBalance
            ]);

            $pdo->prepare("
                UPDATE `visit_requests`
                SET `status` = 'assigned',
                    `assigned_vendor_id` = :vid,
                    `assigned_vendor_name` = :vname,
                    `assigned_vendor_phone` = :vphone
                WHERE `id` = :oid AND `status` IN ('bidding', 're_routed')
            ")->execute([
                ':vid' => $vendorId,
                ':vname' => $vendor['name'],
                ':vphone' => $vendor['phone'],
                ':oid' => $orderId
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'سفارش با موفقیت توسط فروشگاه شما شکار شد.'], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۴. تایید نهایی فاکتور توسط مشتری (خرید موفق) و صدور خودکار بن تخفیف وفاداری
         * POST /api/orders.php?action=approve_invoice
         * Body: { "orderId": 12 }
         */
        case 'approve_invoice':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $orderId = (int)($input['orderId'] ?? 0);

            $stmtO = $pdo->prepare("SELECT * FROM `visit_requests` WHERE `id` = :id LIMIT 1");
            $stmtO->execute([':id' => $orderId]);
            $order = $stmtO->fetch();

            if (!$order) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'سفارش یافت نشد.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // تغییر وضعیت سفارش به approved
            $pdo->prepare("UPDATE `visit_requests` SET `status` = 'approved' WHERE `id` = :id")
                ->execute([':id' => $orderId]);

            // صدور خودکار کد تخفیف وفاداری برای این خرید موفق مشتری!
            $cleanPhone = preg_replace('/\D/', '', $order['phone']);
            $phoneSuffix = substr($cleanPhone, -4) ?: '8890';
            $autoCouponCode = "LOYAL-{$phoneSuffix}-" . rand(1000, 9999);
            $ceiling = 750000;

            $stmtAutoCoup = $pdo->prepare("
                INSERT INTO `discount_coupons` (
                    `code`, `title`, `description`, `discount_type`, `discount_value`,
                    `max_discount_amount`, `min_order_amount`, `applies_to`,
                    `assigned_customer_name`, `assigned_customer_phone`,
                    `is_auto_generated`, `trigger_order_id`, `usage_limit`, `used_count`, `expires_at`, `is_active`
                ) VALUES (
                    :code, :title, :desc, 'percentage', 20,
                    :ceiling, 300000, 'both',
                    :cname, :cphone,
                    1, :order_num, 1, 0, '۱۴۰۴/۱۲/۲۹', 1
                )
            ");

            $stmtAutoCoup->execute([
                ':code' => $autoCouponCode,
                ':title' => "بن وفاداری خرید موفق پرده ({$order['customer_name']})",
                ':desc' => "تخفیف ۲۰٪ تا سقف ۷۵۰,۰۰۰ تومان به پاس خرید موفق سفارش #{$order['order_number']}",
                ':ceiling' => $ceiling,
                ':cname' => $order['customer_name'],
                ':cphone' => $order['phone'],
                ':order_num' => $order['order_number']
            ]);

            echo json_encode([
                'success' => true,
                'status' => 'approved',
                'autoCouponIssued' => [
                    'code' => $autoCouponCode,
                    'ceiling' => $ceiling,
                    'customerName' => $order['customer_name']
                ],
                'message' => 'فاکتور تایید گردید و سفارش وارد چرخه دوخت شد. بن وفاداری اختصاصی نیز برای مشتری صادر شد.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۵. لیست سفارشات مشتری
         */
        case 'customer_orders':
            $phone = trim($_GET['phone'] ?? '');
            $stmt = $pdo->prepare("SELECT * FROM `visit_requests` WHERE `phone` = :phone ORDER BY `id` DESC");
            $stmt->execute([':phone' => $phone]);
            $orders = $stmt->fetchAll();
            echo json_encode(['success' => true, 'orders' => $orders], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

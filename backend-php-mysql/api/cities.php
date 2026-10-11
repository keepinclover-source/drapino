<?php
/**
 * مدیریت شهرهای عملیاتی و شهرهای اقماری متصل به کلان‌شهرها
 * مسیر: /backend-php-mysql/api/cities.php
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
         * ۱. دریافت لیست کامل شهرهای عملیاتی به همراه شهرهای اقماری متصل
         * GET /api/cities.php?action=list
         */
        case 'list':
            $stmtHubs = $pdo->query("SELECT * FROM `operational_cities` WHERE `is_active` = 1 ORDER BY `is_hub` DESC, `id` ASC");
            $hubs = $stmtHubs->fetchAll();

            $stmtSats = $pdo->query("
                SELECT s.*, h.name as `hub_name`, h.province as `hub_province`
                FROM `satellite_cities` s
                JOIN `operational_cities` h ON s.hub_city_id = h.id
                WHERE s.is_active = 1
                ORDER BY s.hub_city_id ASC, s.name ASC
            ");
            $satellites = $stmtSats->fetchAll();

            // گروه‌بندی شهرهای اقماری بر حسب کلان‌شهر
            $hubsWithSatellites = array_map(function($hub) use ($satellites) {
                $hub['districts'] = json_decode($hub['districts_json'] ?? '[]', true) ?: [];
                $hub['satellite_cities'] = array_values(array_filter($satellites, function($sat) use ($hub) {
                    return (int)$sat['hub_city_id'] === (int)$hub['id'];
                }));
                return $hub;
            }, $hubs);

            echo json_encode([
                'success' => true,
                'operationalCities' => $hubsWithSatellites,
                'allSatelliteCities' => array_map(function($s) {
                    $s['suggested_districts'] = json_decode($s['suggested_districts_json'] ?? '[]', true) ?: [];
                    return $s;
                }, $satellites)
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۲. استعلام مشخصات و اتصال شهر انتخابی مشتری (آیا اقماری است یا کلان‌شهر؟)
         * GET /api/cities.php?action=lookup&cityName=شهریار
         */
        case 'lookup':
            $cityName = trim($_GET['cityName'] ?? '');
            if (empty($cityName)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'نام شهر الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // بررسی شهر اقماری
            $stmtSat = $pdo->prepare("
                SELECT s.*, h.name as `hub_name`, h.province as `hub_province`
                FROM `satellite_cities` s
                JOIN `operational_cities` h ON s.hub_city_id = h.id
                WHERE s.name = :name AND s.is_active = 1
                LIMIT 1
            ");
            $stmtSat->execute([':name' => $cityName]);
            $sat = $stmtSat->fetch();

            if ($sat) {
                echo json_encode([
                    'success' => true,
                    'isSatellite' => true,
                    'cityName' => $sat['name'],
                    'hubCityName' => $sat['hub_name'],
                    'province' => $sat['hub_province'],
                    'distanceKmFromHub' => (int)$sat['distance_km_from_hub'],
                    'allowanceNote' => $sat['allowance_note'],
                    'suggestedDistricts' => json_decode($sat['suggested_districts_json'] ?? '[]', true) ?: [],
                    'huntingBoardTarget' => "سفارشات این شهر در تابلوی شکار کلان‌شهر {$sat['hub_name']} نمایش داده می‌شوند."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // بررسی کلان‌شهر
            $stmtHub = $pdo->prepare("SELECT * FROM `operational_cities` WHERE `name` = :name LIMIT 1");
            $stmtHub->execute([':name' => $cityName]);
            $hub = $stmtHub->fetch();

            if ($hub) {
                echo json_encode([
                    'success' => true,
                    'isSatellite' => false,
                    'cityName' => $hub['name'],
                    'hubCityName' => $hub['name'],
                    'province' => $hub['province'],
                    'districts' => json_decode($hub['districts_json'] ?? '[]', true) ?: [],
                    'huntingBoardTarget' => "تابلوی مستقیم کلان‌شهر {$hub['name']}"
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            echo json_encode([
                'success' => false,
                'message' => 'شهر مورد نظر در شبکه تحت پوشش سامانه یافت نشد.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        /**
         * ۳. افزودن شهر اقماری جدید توسط مدیر سیستم
         * POST /api/cities.php?action=add_satellite
         */
        case 'add_satellite':
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $hubName = trim($input['hubName'] ?? 'تهران');
            $satelliteName = trim($input['satelliteName'] ?? '');
            $distanceKm = (int)($input['distanceKm'] ?? 30);
            $districts = $input['suggestedDistricts'] ?? [];

            if (empty($satelliteName)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'نام شهر اقماری الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmtFindHub = $pdo->prepare("SELECT id FROM `operational_cities` WHERE `name` = :name LIMIT 1");
            $stmtFindHub->execute([':name' => $hubName]);
            $hubId = $stmtFindHub->fetchColumn();

            if (!$hubId) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => "کلان‌شهر {$hubName} یافت نشد."], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmtInsert = $pdo->prepare("
                INSERT INTO `satellite_cities` (`hub_city_id`, `name`, `distance_km_from_hub`, `suggested_districts_json`)
                VALUES (:hub_id, :name, :dist, :districts)
                ON DUPLICATE KEY UPDATE `distance_km_from_hub` = :dist, `suggested_districts_json` = :districts
            ");
            $stmtInsert->execute([
                ':hub_id' => $hubId,
                ':name' => $satelliteName,
                ':dist' => $distanceKm,
                ':districts' => json_encode($districts, JSON_UNESCAPED_UNICODE)
            ]);

            echo json_encode(['success' => true, 'message' => "شهر اقماری {$satelliteName} با موفقیت به کلان‌شهر {$hubName} متصل گردید."], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

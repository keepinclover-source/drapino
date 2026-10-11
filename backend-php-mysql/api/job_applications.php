<?php
/**
 * API درخواست‌های استخدام در دراپینو
 * POST   - ثبت درخواست جدید (عمومی)
 * GET    - فهرست درخواست‌ها (نیازمند احراز هویت مدیر)
 * PATCH  - بروزرسانی وضعیت / یادداشت
 * DELETE - حذف درخواست
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function jsonOut($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function generateUid() {
    return 'job-' . time() . '-' . bin2hex(random_bytes(3));
}

$allowedDepartments = ['بازرگانی', 'حسابداری', 'فنی', 'اداری'];
$allowedStatuses = ['new', 'reviewing', 'interview', 'accepted', 'rejected'];

try {
    if ($method === 'POST') {
        // پشتیبانی از multipart (فایل) و JSON
        $isMultipart = !empty($_FILES['resume']);
        if ($isMultipart) {
            $fullName = trim($_POST['full_name'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $city = trim($_POST['city'] ?? '');
            $department = trim($_POST['department'] ?? '');
            $education = trim($_POST['education'] ?? '') ?: null;
            $experienceYears = trim($_POST['experience_years'] ?? '') ?: null;
            $coverLetter = trim($_POST['cover_letter'] ?? '') ?: null;
            $file = $_FILES['resume'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                jsonOut(['success' => false, 'error' => 'خطا در آپلود فایل'], 400);
            }
            if ($file['type'] !== 'application/pdf' && !str_ends_with(strtolower($file['name']), '.pdf')) {
                jsonOut(['success' => false, 'error' => 'فقط PDF مجاز است'], 400);
            }
            if ($file['size'] > 5 * 1024 * 1024) {
                jsonOut(['success' => false, 'error' => 'حداکثر ۵ مگابایت'], 400);
            }
            $uploadDir = __DIR__ . '/../uploads/resumes';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $uid = generateUid();
            $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
            $destName = $uid . '_' . $safeName;
            $destPath = $uploadDir . '/' . $destName;
            if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                jsonOut(['success' => false, 'error' => 'ذخیره فایل ناموفق'], 500);
            }
            $resumePath = 'uploads/resumes/' . $destName;
            $resumeFileName = $file['name'];
            $resumeSize = round($file['size'] / 1024) . ' کیلوبایت';
            $resumeData = null;
        } else {
            $body = json_decode(file_get_contents('php://input'), true) ?: [];
            $fullName = trim($body['full_name'] ?? $body['fullName'] ?? '');
            $phone = trim($body['phone'] ?? '');
            $email = trim($body['email'] ?? '');
            $city = trim($body['city'] ?? '');
            $department = trim($body['department'] ?? '');
            $education = trim($body['education'] ?? '') ?: null;
            $experienceYears = trim($body['experience_years'] ?? $body['experienceYears'] ?? '') ?: null;
            $coverLetter = trim($body['cover_letter'] ?? $body['coverLetter'] ?? '') ?: null;
            $resumeFileName = trim($body['resume_file_name'] ?? $body['resumeFileName'] ?? '');
            $resumeDataUrl = $body['resume_data_url'] ?? $body['resumeDataUrl'] ?? '';
            $resumeSize = $body['resume_size'] ?? $body['resumeSize'] ?? null;
            $resumePath = null;
            $resumeData = null;
            $uid = generateUid();

            if ($resumeDataUrl && str_starts_with($resumeDataUrl, 'data:')) {
                $parts = explode(',', $resumeDataUrl, 2);
                if (count($parts) === 2) {
                    $resumeData = base64_decode($parts[1]);
                }
            }
            if (!$resumeFileName) {
                jsonOut(['success' => false, 'error' => 'نام فایل رزومه الزامی است'], 400);
            }
        }

        if (!$fullName || !$phone || !$email || !$city || !$department) {
            jsonOut(['success' => false, 'error' => 'فیلدهای ضروری ناقص است'], 400);
        }
        if (!in_array($department, $allowedDepartments, true)) {
            jsonOut(['success' => false, 'error' => 'دپارتمان نامعتبر'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO job_applications
            (application_uid, full_name, phone, email, city, department, education, experience_years, cover_letter, resume_file_name, resume_path, resume_data, resume_size, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
        ");
        $stmt->execute([
            $uid,
            $fullName,
            $phone,
            $email,
            $city,
            $department,
            $education,
            $experienceYears,
            $coverLetter,
            $resumeFileName,
            $resumePath ?? null,
            $resumeData ?? null,
            $resumeSize,
        ]);

        jsonOut([
            'success' => true,
            'id' => (int)$pdo->lastInsertId(),
            'application_uid' => $uid,
            'message' => 'درخواست استخدام با موفقیت ثبت شد',
        ], 201);
    }

    if ($method === 'GET') {
        $status = $_GET['status'] ?? null;
        $department = $_GET['department'] ?? null;
        $sql = "SELECT id, application_uid, full_name, phone, email, city, department, education, experience_years, cover_letter, resume_file_name, resume_path, resume_size, status, admin_notes, created_at, updated_at FROM job_applications WHERE 1=1";
        $params = [];
        if ($status && in_array($status, $allowedStatuses, true)) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        if ($department && in_array($department, $allowedDepartments, true)) {
            $sql .= " AND department = ?";
            $params[] = $department;
        }
        $sql .= " ORDER BY created_at DESC LIMIT 500";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonOut(['success' => true, 'data' => $rows, 'count' => count($rows)]);
    }

    if ($method === 'PATCH') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = (int)($body['id'] ?? $_GET['id'] ?? 0);
        if (!$id) {
            jsonOut(['success' => false, 'error' => 'شناسه الزامی است'], 400);
        }
        $sets = [];
        $params = [];
        if (isset($body['status']) && in_array($body['status'], $allowedStatuses, true)) {
            $sets[] = 'status = ?';
            $params[] = $body['status'];
        }
        if (array_key_exists('admin_notes', $body) || array_key_exists('adminNotes', $body)) {
            $sets[] = 'admin_notes = ?';
            $params[] = $body['admin_notes'] ?? $body['adminNotes'];
        }
        if (!$sets) {
            jsonOut(['success' => false, 'error' => 'چیزی برای بروزرسانی نیست'], 400);
        }
        $params[] = $id;
        $sql = 'UPDATE job_applications SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        jsonOut(['success' => true, 'message' => 'بروزرسانی شد']);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        if (!$id) $id = (int)($body['id'] ?? 0);
        if (!$id) {
            jsonOut(['success' => false, 'error' => 'شناسه الزامی است'], 400);
        }
        // حذف فایل فیزیکی در صورت وجود
        $stmt = $pdo->prepare('SELECT resume_path FROM job_applications WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && !empty($row['resume_path'])) {
            $full = __DIR__ . '/../' . $row['resume_path'];
            if (is_file($full)) @unlink($full);
        }
        $stmt = $pdo->prepare('DELETE FROM job_applications WHERE id = ?');
        $stmt->execute([$id]);
        jsonOut(['success' => true, 'message' => 'حذف شد']);
    }

    jsonOut(['success' => false, 'error' => 'متد پشتیبانی نمی‌شود'], 405);
} catch (Throwable $e) {
    jsonOut(['success' => false, 'error' => 'خطای سرور: ' . $e->getMessage()], 500);
}

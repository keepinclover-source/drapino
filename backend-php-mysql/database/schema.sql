-- ==============================================================================
-- پایگاه داده دراپینو (Drapino) - MySQL / MariaDB Schema
-- نسخه: 1.0.0
-- پشتیبانی کامل از UTF-8 فارسی (utf8mb4_persian_ci)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `autopardeh_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;
USE `autopardeh_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `vendor_reviews`;
DROP TABLE IF EXISTS `discount_coupons`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `curtain_invoices`;
DROP TABLE IF EXISTS `order_timelines`;
DROP TABLE IF EXISTS `visit_requests`;
DROP TABLE IF EXISTS `vendor_transactions`;
DROP TABLE IF EXISTS `curtain_vendors`;
DROP TABLE IF EXISTS `satellite_cities`;
DROP TABLE IF EXISTS `operational_cities`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- ۱. جدول کاربران سامانه (مشتری، فروشگاه همکار، مدیر سیستم)
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_uid` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL UNIQUE,
  `email` VARCHAR(100) NULL,
  `role` ENUM('customer', 'vendor', 'admin') NOT NULL DEFAULT 'customer',
  `vendor_id` VARCHAR(64) NULL,
  `store_name` VARCHAR(120) NULL,
  `province` VARCHAR(50) NOT NULL DEFAULT 'تهران',
  `city` VARCHAR(50) NOT NULL DEFAULT 'تهران',
  `district` VARCHAR(80) NULL,
  `address` TEXT NULL,
  `floor_and_unit` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۲. جدول شهرهای عملیاتی و کلان‌شهرها (Hub Cities)
-- ------------------------------------------------------------------------------
CREATE TABLE `operational_cities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `city_uid` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(60) NOT NULL UNIQUE,
  `province` VARCHAR(60) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_hub` TINYINT(1) NOT NULL DEFAULT 0,
  `parent_hub_id` INT NULL,
  `phase_title` VARCHAR(80) NOT NULL DEFAULT 'فاز ۱: فعال کامل',
  `vendor_count` INT NOT NULL DEFAULT 0,
  `districts_json` JSON NULL COMMENT 'آرایه JSON از محله‌های شهر',
  `other_covered_cities_json` JSON NULL COMMENT 'سایر شهرهای تحت پوشش و اقمار متصل به این مرکز (آرایه JSON)',
  `suburb_delivery_note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_hub_id`) REFERENCES `operational_cities`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۳. جدول شهرهای اقماری متصل به کلان‌شهرها (Satellite Cities)
-- ------------------------------------------------------------------------------
CREATE TABLE `satellite_cities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hub_city_id` INT NOT NULL,
  `name` VARCHAR(60) NOT NULL,
  `distance_km_from_hub` INT NOT NULL DEFAULT 25,
  `allowance_note` VARCHAR(255) DEFAULT 'اعزام مستقیم کارشناس و کالیته از تابلوی شکار کلان‌شهر بدون هزینه اضافه',
  `suggested_districts_json` JSON NULL COMMENT 'لیست فازها یا محله‌های شهر اقماری',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_hub_satellite` (`hub_city_id`, `name`),
  FOREIGN KEY (`hub_city_id`) REFERENCES `operational_cities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۴. جدول فروشگاه‌های مجاز و پروانه‌دار همکار (Vendors)
-- ------------------------------------------------------------------------------
CREATE TABLE `curtain_vendors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vendor_uid` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL,
  `owner_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `city` VARCHAR(60) NOT NULL,
  `address` TEXT NOT NULL,
  `covered_districts_json` JSON NULL,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `rating_count` INT NOT NULL DEFAULT 0,
  `completed_visits` INT NOT NULL DEFAULT 0,
  `successful_orders` INT NOT NULL DEFAULT 0,
  `wallet_balance` BIGINT NOT NULL DEFAULT 0 COMMENT 'تومان',
  `tier` VARCHAR(30) NOT NULL DEFAULT 'طلایی',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `verification_status` ENUM('verified', 'pending_verification', 'rejected') NOT NULL DEFAULT 'verified',
  `is_promoted_ad` TINYINT(1) NOT NULL DEFAULT 0,
  `promoted_at` TIMESTAMP NULL,
  `promoted_expires_at` TIMESTAMP NULL,
  `promoted_ladder_position` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۵. جدول تراکنش‌های کیف پول فروشندگان (Transactions)
-- ------------------------------------------------------------------------------
CREATE TABLE `vendor_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_uid` VARCHAR(64) NOT NULL UNIQUE,
  `vendor_id` INT NOT NULL,
  `type` ENUM('deposit', 'order_claim_fee', 'sponsored_ladder_fee', 'refund') NOT NULL,
  `amount` BIGINT NOT NULL COMMENT 'تومان',
  `description` VARCHAR(255) NOT NULL,
  `order_id` INT NULL,
  `balance_after` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vendor_id`) REFERENCES `curtain_vendors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۶. جدول درخواست‌های اعزام و سفارشات (Visit Requests / Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE `visit_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(30) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `province` VARCHAR(50) NOT NULL,
  `city` VARCHAR(60) NOT NULL,
  `district` VARCHAR(80) NOT NULL,
  `address` TEXT NOT NULL,
  `floor_and_unit` VARCHAR(50) NULL,
  `rooms_json` JSON NULL,
  `approximate_windows` INT NOT NULL DEFAULT 1,
  `approximate_width_meters` DECIMAL(4,2) NOT NULL DEFAULT 3.0,
  `preferred_styles_json` JSON NULL,
  `preferred_date` VARCHAR(30) NOT NULL,
  `time_slot` VARCHAR(40) NOT NULL,
  `notes` TEXT NULL,
  
  -- فیلدهای اتصال به شهرهای اقماری و کلان‌شهر
  `is_satellite_order` TINYINT(1) NOT NULL DEFAULT 0,
  `parent_hub_city` VARCHAR(60) NULL,
  `distance_km_from_hub` INT NULL,
  
  -- امور مالی بیعانه و تخفیف
  `deposit_amount` BIGINT NOT NULL DEFAULT 350000,
  `deposit_status` ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'paid',
  `discount_coupon_code` VARCHAR(50) NULL,
  `discount_amount_applied` BIGINT NOT NULL DEFAULT 0,
  `original_deposit_before_discount` BIGINT NOT NULL DEFAULT 350000,
  
  -- وضعیت سفارش
  `status` ENUM('bidding', 'assigned', 'visited', 're_routed', 'approved', 'installed', 'cancelled') NOT NULL DEFAULT 'bidding',
  `claim_cost` BIGINT NOT NULL DEFAULT 550000,
  `assigned_vendor_id` INT NULL,
  `assigned_vendor_name` VARCHAR(120) NULL,
  `assigned_vendor_phone` VARCHAR(20) NULL,
  
  -- بای‌باکس
  `is_buy_box_order` TINYINT(1) NOT NULL DEFAULT 0,
  `buy_box_vendor_id` VARCHAR(64) NULL,
  `buy_box_vendor_name` VARCHAR(120) NULL,
  `buy_box_status` VARCHAR(50) NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_vendor_id`) REFERENCES `curtain_vendors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۷. جدول رویدادهای زمانی سفارش (Order Timeline)
-- ------------------------------------------------------------------------------
CREATE TABLE `order_timelines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `event_date` VARCHAR(30) NOT NULL,
  `event_time` VARCHAR(20) NOT NULL,
  `description` TEXT NOT NULL,
  `actor` VARCHAR(50) NOT NULL,
  `type` VARCHAR(40) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `visit_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۸. جدول فاکتورهای رسمی دوخت و پارچه (Invoices)
-- ------------------------------------------------------------------------------
CREATE TABLE `curtain_invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL UNIQUE,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `vendor_id` INT NULL,
  `vendor_name` VARCHAR(120) NOT NULL,
  `vendor_phone` VARCHAR(20) NOT NULL,
  `tailoring_fee` BIGINT NOT NULL DEFAULT 0,
  `hardware_and_track_fee` BIGINT NOT NULL DEFAULT 0,
  `installation_fee` BIGINT NOT NULL DEFAULT 0,
  `subtotal` BIGINT NOT NULL,
  `deposit_deduction` BIGINT NOT NULL DEFAULT 350000,
  `discount_coupon_code` VARCHAR(50) NULL,
  `discount_amount` BIGINT NOT NULL DEFAULT 0,
  `final_payable` BIGINT NOT NULL,
  `issued_at` VARCHAR(30) NOT NULL,
  `notes` TEXT NULL,
  `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `visit_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vendor_id`) REFERENCES `curtain_vendors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۹. جدول آیتم‌های فاکتور (Invoice Items)
-- ------------------------------------------------------------------------------
CREATE TABLE `invoice_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `fabric_code` VARCHAR(50) NOT NULL,
  `meters` DECIMAL(5,2) NOT NULL,
  `unit_price` BIGINT NOT NULL,
  `total` BIGINT NOT NULL,
  FOREIGN KEY (`invoice_id`) REFERENCES `curtain_invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۱۰. جدول جامع کدهای تخفیف با سقف عددی و بن وفاداری (Discount Coupons)
-- ------------------------------------------------------------------------------
CREATE TABLE `discount_coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NULL,
  `discount_type` ENUM('percentage', 'fixed_amount') NOT NULL DEFAULT 'percentage',
  `discount_value` INT NOT NULL COMMENT 'درصد (مثلا 20) یا مبلغ ثابت ریالی',
  `max_discount_amount` BIGINT NOT NULL DEFAULT 500000 COMMENT 'سقف عددی تخفیف به تومان',
  `min_order_amount` BIGINT NOT NULL DEFAULT 0,
  `applies_to` ENUM('deposit_only', 'final_invoice_only', 'both') NOT NULL DEFAULT 'both',
  
  -- تخصیص دستی به مشتری یا عمومی
  `assigned_customer_name` VARCHAR(100) NULL,
  `assigned_customer_phone` VARCHAR(20) NULL,
  
  -- صدور خودکار سیستم (خرید موفق قبلی)
  `is_auto_generated` TINYINT(1) NOT NULL DEFAULT 0,
  `trigger_order_id` VARCHAR(50) NULL,
  
  `usage_limit` INT NOT NULL DEFAULT 1,
  `used_count` INT NOT NULL DEFAULT 0,
  `expires_at` VARCHAR(30) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- ۱۱. جدول نظرات و امتیازات مشتریان (Vendor Reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE `vendor_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `order_number` VARCHAR(30) NOT NULL,
  `vendor_id` INT NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(15) NOT NULL,
  `customer_city` VARCHAR(50) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `review_date` VARCHAR(30) NOT NULL,
  `criteria_json` JSON NULL,
  `tags_json` JSON NULL,
  `vendor_reply_json` JSON NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `visit_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vendor_id`) REFERENCES `curtain_vendors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ------------------------------------------------------------------------------
-- داده‌های پایه (Seed Data)
-- ------------------------------------------------------------------------------

-- شهرهای اصلی
INSERT INTO `operational_cities` (`city_uid`, `name`, `province`, `is_active`, `is_hub`, `phase_title`, `vendor_count`, `districts_json`) VALUES
('city-tehran', 'تهران', 'تهران', 1, 1, 'فاز ۱: فعال کامل', 48, '["نیاوران", "سعادت‌آباد", "ونک", "تهرانپارس", "پونک", "جنت‌آباد", "دریاچه چیتگر", "فرمانیه", "پاسداران", "قیطریه"]'),
('city-mashhad', 'مشهد', 'خراسان رضوی', 1, 1, 'فاز ۱: فعال کامل', 24, '["کوهسنگی", "احمدآباد", "سجاد", "وکیل‌آباد", "الهیه", "قاسم‌آباد", "فرامرز عباسی"]'),
('city-isfahan', 'اصفهان', 'اصفهان', 1, 1, 'فاز ۱: فعال کامل', 16, '["چهارباغ", "مرداویج", "شیخ صدوق", "بزرگمهر", "نظر شرقی"]');

-- شهرهای اقماری تهران
INSERT INTO `satellite_cities` (`hub_city_id`, `name`, `distance_km_from_hub`, `allowance_note`, `suggested_districts_json`) VALUES
(1, 'پرند', 35, 'اعزام مستقیم کارشناس کالیته از تابلوی شکار تهران با هماهنگی کامل', '["فاز ۰ و ۱ (شمالی)", "فاز ۲ (مرکزی)", "فاز ۳ (پردیسان)", "فاز ۴ (آفتاب)", "فاز ۵ و ۶ (کوزو)"]'),
(1, 'پردیس', 25, 'اعزام بدون هزینه اضافه کارشناس از تهران به پردیس', '["فاز ۱ (مرکزی)", "فاز ۲ (ویلایی)", "فاز ۳ (مسکونی)", "فاز ۴", "فاز ۸ (دره بهشت)", "فاز ۱۱ (کوزو)"]'),
(1, 'اسلامشهر', 20, 'پوشش کامل تابلوی شکار تهران در اسلامشهر', '["مرکز شهر (خیابان کاشانی)", "زرافشان", "باغ فیض", "شهرک قائمیه", "شهرک واوان"]'),
(1, 'شهریار', 30, 'اعزام گالری‌های غرب تهران به شهریار و اندیشه', '["مرکز شهر شهریار", "شهر جدید اندیشه فاز ۱", "فاز ۳ اندیشه", "امیریه", "کهنز"]'),
(1, 'ورامین', 40, 'پوشش کامل با اعزام کارشناس مجرب', '["مرکز شهر ورامین", "صادقعلی", "امرآباد", "خیرآباد"]'),
(1, 'دماوند', 55, 'اعزام به مناطق ویلایی و مسکونی دماوند و گیلاوند', '["گیلاوند", "مرکز شهر دماوند", "رودهن", "مشاء", "آبسرد"]'),
(1, 'رباط‌کریم', 35, 'اعزام مستقیم از تابلوی شکار تهران', '["مرکز شهر", "نصیرشهر", "پرندک"]'),
(1, 'پاکدشت', 30, 'پوشش سریع توسط گالری‌های شرق و جنوب تهران', '["مرکز شهر", "فرون‌آباد", "شریف‌آباد"]');

-- شهرهای اقماری مشهد
INSERT INTO `satellite_cities` (`hub_city_id`, `name`, `distance_km_from_hub`, `allowance_note`, `suggested_districts_json`) VALUES
(2, 'گلبهار', 35, 'اعزام مستقیم فروشگاه‌های مشهد به شهر جدید گلبهار', '["محله پرند", "بلوار استقلال", "محله بهارستان", "مسکن مهر"]'),
(2, 'چناران', 45, 'پوشش تابلوی شکار مشهد', '["بلوار امام رضا", "خیابان طالقانی"]'),
(2, 'نیشابور', 110, 'اعزام تخصصی و هماهنگی با گالری‌های منتخب', '["خیابان خیام", "فردوسی", "بلوار جمهوری", "امیرکبیر"]'),
(2, 'کلات', 140, 'اعزام برنامه‌ریزی‌شده', '["مرکز شهر کلات", "دژ رشید"]'),
(2, 'روستای لکلک', 50, 'پوشش اعزام روستایی حومه مشهد', '["بافت اصلی روستا"]');

-- نمونه کدهای تخفیف با سقف
INSERT INTO `discount_coupons` (`code`, `title`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_amount`, `applies_to`, `is_auto_generated`, `usage_limit`, `used_count`, `expires_at`, `is_active`) VALUES
('AUTOFALL50', 'جشنواره پاییزی دراپینو', 'تخفیف ۲۰ درصدی تا سقف ۵۰۰ هزار تومان برای کلیه خدمات مشاوره و بیعانه', 'percentage', 20, 500000, 300000, 'both', 0, 100, 24, '۱۴۰۴/۰۶/۳۱', 1),
('WELCOME200', 'هدیه اولین سفارش خانه', '۲۰۰ هزار تومان تخفیف مستقیم جهت انتخاب پرده در منزل', 'fixed_amount', 200000, 200000, 350000, 'both', 0, 50, 12, '۱۴۰۴/۱۲/۲۹', 1),
('LOYAL-2841-9921', 'بن وفاداری خرید موفق پرده (احمد رضایی)', 'تخفیف ۲۰٪ تا سقف ۷۵۰,۰۰۰ تومان به پاس خرید موفق قبلی', 'percentage', 20, 750000, 300000, 'both', 1, 1, 0, '۱۴۰۴/۱۲/۲۹', 1);

-- ------------------------------------------------------------------------------
-- جدول درخواست‌های استخدام (Job Applications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_uid` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `department` ENUM('بازرگانی', 'حسابداری', 'فنی', 'اداری') NOT NULL,
  `education` VARCHAR(150) NULL,
  `experience_years` VARCHAR(30) NULL,
  `cover_letter` TEXT NULL,
  `resume_file_name` VARCHAR(255) NOT NULL,
  `resume_path` VARCHAR(500) NULL COMMENT 'مسیر فایل PDF روی سرور',
  `resume_data` LONGBLOB NULL COMMENT 'اختیاری: ذخیره مستقیم PDF',
  `resume_size` VARCHAR(40) NULL,
  `status` ENUM('new', 'reviewing', 'interview', 'accepted', 'rejected') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_department` (`department`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

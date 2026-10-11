# راهنمای استقرار و تبدیل پروژه دراپینو به PHP + دیتابیس MySQL

این پکیج شامل ساختار کامل پایگاه داده رابطه‌ای (**MySQL**) و اندپوینت‌های استاندارد **PHP (PDO)** جهت مدیریت منطق کسب‌وکار دراپینو است.

---

## 📁 ساختار فایل‌های بک‌اند (PHP + MySQL)

```
backend-php-mysql/
├── config/
│   └── database.php        # اتصال امن به MySQL با PDO و پشتیبانی از utf8mb4
├── database/
│   └── schema.sql          # اسکریپت ساخت تمام جداول، روابط و داده‌های اولیه
├── api/
│   ├── cities.php          # مدیریت شهرهای عملیاتی و اتصال شهرهای اقماری (تهران و مشهد)
│   ├── coupons.php         # سیستم کدهای تخفیف با سقف ریالی، صدور دستی و خودکار خرید موفق
│   ├── orders.php          # ثبت سفارشات، تابلوی شکار حومه، بیعانه و تایید فاکتور
│   └── vendors.php         # مدیریت فروشگاه‌ها، شارژ کیف پول و نردبان آگهی‌ها
└── README.md               # راهنمای حاضر
```

---

## ۱. نحوه راه‌اندازی دیتابیس MySQL در هاست یا سرور محلی (XAMPP / Laragon / cPanel)

1. وارد **phpMyAdmin** یا کنسول خط فرمان MySQL شوید.
2. یک دیتابیس جدید با نام `autopardeh_db` و Collation برابر با `utf8mb4_persian_ci` ایجاد کنید:
   ```sql
   CREATE DATABASE `autopardeh_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;
   ```
3. فایل `backend-php-mysql/database/schema.sql` را در تب **Import** در phpMyAdmin وارد (Import) نمایید یا از طریق ترمینال اجرا کنید:
   ```bash
   mysql -u root -p autopardeh_db < backend-php-mysql/database/schema.sql
   ```

### جداول ساخته‌شده:
* `operational_cities`: کلان‌شهرها و مراکز اصلی
* `satellite_cities`: شهرهای اقماری متصل به کلان‌شهرها (پرند، پردیس، اسلامشهر، شهریار، ورامین، دماوند و...)
* `curtain_vendors`: اطلاعات فروشگاه‌ها، پروانه، امتیاز و کیف پول
* `visit_requests`: سفارشات ثبت‌شده با فلگ‌های `is_satellite_order` و `parent_hub_city`
* `discount_coupons`: کدهای تخفیف با پشتیبانی از سقف عددی ریالی (`max_discount_amount`) و فلگ صدور خودکار خرید موفق (`is_auto_generated`)
* `curtain_invoices` و `invoice_items`: فاکتورهای رسمی دوخت
* `vendor_reviews`: نظرات و معیارهای ارزیابی

---

## ۲. تنظیمات اتصال PHP به MySQL

فایل `backend-php-mysql/config/database.php` را باز کرده و مشخصات دیتابیس هاست خود را وارد نمایید:

```php
private const DB_HOST = 'localhost';
private const DB_PORT = 3306;
private const DB_NAME = 'autopardeh_db';
private const DB_USER = 'نام_کاربری_دیتابیس';
private const DB_PASS = 'رمز_عبور_دیتابیس';
```

یا از طریق Environment Variables (متغیرهای محیطی) تنظیم کنید:
`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`.

---

## ۳. بررسی اندپوینت‌های اصلی API

### الف) شهرهای اقماری و کلان‌شهرها:
* **دریافت لیست کامل:** `GET /api/cities.php?action=list`
* **استعلام وضعیت یک شهر:** `GET /api/cities.php?action=lookup&cityName=شهریار`
  - خروجی شامل اتصال به کلان‌شهر تهران، فاصله، و تابلوی شکار مجری خواهد بود.

### ب) کدهای تخفیف با سقف ریالی:
* **اعتبارسنجی و محاسبه تخفیف با سقف:**
  - `POST /api/coupons.php?action=validate`
  - ورودی JSON:
    ```json
    {
      "code": "AUTOFALL50",
      "orderAmount": 350000,
      "customerPhone": "09121234567"
    }
    ```
  - خروجی: مبلغ تخفیف محاسبه شده، بررسی سقف (`maxDiscountAmount`) و مبلغ نهایی قابل پرداخت.
* **صدور خودکار بن وفاداری خرید موفق:**
  - `POST /api/coupons.php?action=issue_auto_loyalty`

### ج) سفارشات و تابلوی شکار فروشندگان:
* **ثبت سفارش جدید توسط مشتری:** `POST /api/orders.php?action=create`
  - شهر مشتری به صورت خودکار بررسی شده و در صورت اقماری بودن، به کلان‌شهر متصل می‌گردد.
* **تابلوی شکار فروشگاه‌ها:** `GET /api/orders.php?action=hunting_board&vendorCity=تهران`
  - فروشگاه تهران سفارشات کلان‌شهر تهران به همراه کلیه شهرهای اقماری (پرند، پردیس، شهریار، ورامین و...) را دریافت می‌کند.
* **تایید فاکتور و خرید موفق:** `POST /api/orders.php?action=approve_invoice`
  - با تایید فاکتور، به صورت آنی بن وفاداری اختصاصی برای مشتری صادر و ذخیره می‌گردد.

---

## ۴. نحوه اتصال فرانت‌اند React به بک‌اند PHP

در فایل‌های فرانت‌اند، با تنظیم آدرس پایه API (مثلاً `https://your-domain.com/api/`)، تمام توابع به‌جای localStorage به اندپوینت‌های PHP بالا درخواست ارسال کرده و در پایگاه داده MySQL شما ذخیره و بازیابی می‌شوند.

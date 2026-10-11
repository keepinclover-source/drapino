import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'drapino.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initRelationalDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      vendor_id TEXT,
      store_name TEXT,
      province TEXT NOT NULL DEFAULT 'تهران',
      city TEXT NOT NULL DEFAULT 'تهران',
      district TEXT,
      address TEXT,
      floor_and_unit TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS operational_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_uid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL UNIQUE,
      province TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_hub INTEGER NOT NULL DEFAULT 0,
      parent_hub_id INTEGER,
      phase_title TEXT NOT NULL DEFAULT 'فاز ۱: فعال کامل',
      vendor_count INTEGER NOT NULL DEFAULT 0,
      districts_json TEXT,
      other_covered_cities_json TEXT,
      suburb_delivery_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_hub_id) REFERENCES operational_cities(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS satellite_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hub_city_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      distance_km_from_hub INTEGER NOT NULL DEFAULT 25,
      allowance_note TEXT DEFAULT 'اعزام مستقیم کارشناس و کالیته از تابلوی شکار کلان‌شهر بدون هزینه اضافه',
      suggested_districts_json TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(hub_city_id, name),
      FOREIGN KEY (hub_city_id) REFERENCES operational_cities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS curtain_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_uid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      covered_districts_json TEXT,
      rating REAL NOT NULL DEFAULT 5.0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      completed_visits INTEGER NOT NULL DEFAULT 0,
      successful_orders INTEGER NOT NULL DEFAULT 0,
      wallet_balance INTEGER NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'طلایی',
      is_verified INTEGER NOT NULL DEFAULT 1,
      verification_status TEXT NOT NULL DEFAULT 'verified',
      is_promoted_ad INTEGER NOT NULL DEFAULT 0,
      promoted_at DATETIME,
      promoted_expires_at DATETIME,
      promoted_ladder_position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vendor_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_uid TEXT NOT NULL UNIQUE,
      vendor_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL,
      order_id INTEGER,
      balance_after INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES curtain_vendors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS visit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      address TEXT NOT NULL,
      floor_and_unit TEXT,
      rooms_json TEXT,
      approximate_windows INTEGER NOT NULL DEFAULT 1,
      approximate_width_meters REAL NOT NULL DEFAULT 3.0,
      preferred_styles_json TEXT,
      preferred_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      notes TEXT,
      is_satellite_order INTEGER NOT NULL DEFAULT 0,
      parent_hub_city TEXT,
      distance_km_from_hub INTEGER,
      deposit_amount INTEGER NOT NULL DEFAULT 350000,
      deposit_status TEXT NOT NULL DEFAULT 'paid',
      discount_coupon_code TEXT,
      discount_amount_applied INTEGER NOT NULL DEFAULT 0,
      original_deposit_before_discount INTEGER NOT NULL DEFAULT 350000,
      status TEXT NOT NULL DEFAULT 'bidding',
      claim_cost INTEGER NOT NULL DEFAULT 550000,
      assigned_vendor_id INTEGER,
      assigned_vendor_name TEXT,
      assigned_vendor_phone TEXT,
      is_buy_box_order INTEGER NOT NULL DEFAULT 0,
      buy_box_vendor_id TEXT,
      buy_box_vendor_name TEXT,
      buy_box_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_vendor_id) REFERENCES curtain_vendors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_timelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      description TEXT NOT NULL,
      actor TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES visit_requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS curtain_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL UNIQUE,
      invoice_number TEXT NOT NULL UNIQUE,
      vendor_id INTEGER,
      vendor_name TEXT NOT NULL,
      vendor_phone TEXT NOT NULL,
      tailoring_fee INTEGER NOT NULL DEFAULT 0,
      hardware_and_track_fee INTEGER NOT NULL DEFAULT 0,
      installation_fee INTEGER NOT NULL DEFAULT 0,
      subtotal INTEGER NOT NULL,
      deposit_deduction INTEGER NOT NULL DEFAULT 350000,
      discount_coupon_code TEXT,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      final_payable INTEGER NOT NULL,
      issued_at TEXT NOT NULL,
      notes TEXT,
      is_paid INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES visit_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id) REFERENCES curtain_vendors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      fabric_code TEXT NOT NULL,
      meters REAL NOT NULL,
      unit_price INTEGER NOT NULL,
      total INTEGER NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES curtain_invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS discount_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage',
      discount_value INTEGER NOT NULL,
      max_discount_amount INTEGER NOT NULL DEFAULT 500000,
      min_order_amount INTEGER NOT NULL DEFAULT 0,
      applies_to TEXT NOT NULL DEFAULT 'both',
      assigned_customer_name TEXT,
      assigned_customer_phone TEXT,
      is_auto_generated INTEGER NOT NULL DEFAULT 0,
      trigger_order_id TEXT,
      usage_limit INTEGER NOT NULL DEFAULT 1,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vendor_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      order_number TEXT NOT NULL,
      vendor_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_city TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      review_date TEXT NOT NULL,
      criteria_json TEXT,
      tags_json TEXT,
      vendor_reply_json TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES visit_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (vendor_id) REFERENCES curtain_vendors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_uid TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      city TEXT NOT NULL,
      department TEXT NOT NULL,
      education TEXT,
      experience_years TEXT,
      cover_letter TEXT,
      resume_file_name TEXT NOT NULL,
      resume_path TEXT,
      resume_data BLOB,
      resume_size TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_uid TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      read_time_minutes INTEGER DEFAULT 5,
      views_count INTEGER DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_uid TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      meta_description TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_uid TEXT NOT NULL UNIQUE,
      ticket_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'support',
      status TEXT NOT NULL DEFAULT 'investigating',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      attachments_json TEXT,
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feedback_uid TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      section TEXT NOT NULL,
      severity TEXT,
      steps_to_reproduce TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      voters_json TEXT,
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS escrow_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_uid TEXT NOT NULL UNIQUE,
      order_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      kind TEXT NOT NULL,
      amount INTEGER NOT NULL,
      tracking_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'held',
      paid_at TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS escrow_withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      withdrawal_uid TEXT NOT NULL UNIQUE,
      vendor_id TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      sheba TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'processing',
      requested_at TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buy_box_reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_uid TEXT NOT NULL UNIQUE,
      vendor_id TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_city TEXT NOT NULL,
      date_persian TEXT NOT NULL,
      date_iso TEXT NOT NULL,
      price_paid INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'reserved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if operational_cities table is empty
  const cityCount = (db.prepare('SELECT COUNT(*) as count FROM operational_cities').get() as { count: number }).count;
  if (cityCount === 0) {
    const insertCity = db.prepare(`
      INSERT INTO operational_cities (city_uid, name, province, is_active, is_hub, phase_title, vendor_count, districts_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCity.run('city-tehran', 'تهران', 'تهران', 1, 1, 'فاز ۱: فعال کامل', 48, JSON.stringify(["نیاوران", "سعادت‌آباد", "ونک", "تهرانپارس", "پونک", "جنت‌آباد", "دریاچه چیتگر", "فرمانیه", "پاسداران", "قیطریه"]));
    insertCity.run('city-mashhad', 'مشهد', 'خراسان رضوی', 1, 1, 'فاز ۱: فعال کامل', 24, JSON.stringify(["کوهسنگی", "احمدآباد", "سجاد", "وکیل‌آباد", "الهیه", "قاسم‌آباد", "فرامرز عباسی"]));
    insertCity.run('city-isfahan', 'اصفهان', 'اصفهان', 1, 1, 'فاز ۱: فعال کامل', 16, JSON.stringify(["چهارباغ", "مرداویج", "شیخ صدوق", "بزرگمهر", "نظر شرقی"]));

    const insertCoupon = db.prepare(`
      INSERT INTO discount_coupons (code, title, description, discount_type, discount_value, max_discount_amount, min_order_amount, applies_to, is_auto_generated, usage_limit, used_count, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCoupon.run('AUTOFALL50', 'جشنواره پاییزی دراپینو', 'تخفیف ۲۰ درصدی تا سقف ۵۰۰ هزار تومان', 'percentage', 20, 500000, 300000, 'both', 0, 100, 24, '۱۴۰۴/۰۶/۳۱', 1);
    insertCoupon.run('WELCOME200', 'هدیه اولین سفارش خانه', '۲۰۰ هزار تومان تخفیف مستقیم', 'fixed_amount', 200000, 200000, 350000, 'both', 0, 50, 12, '۱۴۰۴/۱۲/۲۹', 1);
  }
}

export default db;

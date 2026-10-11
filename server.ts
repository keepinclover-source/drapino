import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStateStore, isValidStateKey } from './server/stateStore';
import dbRelational, { initRelationalDatabase } from './server/db';

// راه اندازی پایگاه داده رابطه‌ای (SQLite / PostgreSQL)
try {
  initRelationalDatabase();
  console.log('Relational database initialized successfully.');
} catch (err) {
  console.error('Failed initializing relational database:', err);
}

// بارگذاری متغیرهای محیطی (کلیدهای سرور مثل RECAPTCHA_SECRET_KEY) از .env.local و .env
dotenv.config({ path: ['.env.local', '.env'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// به‌صورت پیش‌فرض فقط روی همین سیستم در دسترس است (چون هنوز احراز هویت سمت سرور ندارد). برای شبکه: HOST=0.0.0.0
const HOST = process.env.HOST || '127.0.0.1';
const IS_PROD = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

// حجم بالا برای داده‌هایی که تصویر (base64) دارند
app.use(express.json({ limit: '50mb' }));

// Persistent Database Path
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// In-Memory Database structure
interface DBStructure {
  operationalCities: any[];
  orders: any[];
  vendors: any[];
  coupons: any[];
  users: any[];
  blogPosts: any[];
}

// Helper to load or initialize DB
function loadDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading database.json, initializing fresh:', err);
  }

  const initialDB: DBStructure = {
    operationalCities: [
      {
        id: 'city-tehran',
        name: 'تهران',
        province: 'تهران',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
        otherCoveredCities: ['پرند', 'پردیس', 'اسلامشهر', 'شهریار', 'ورامین', 'دماوند', 'دماوند و رودهن', 'رودهن', 'بومهن', 'رباط‌کریم', 'پاکدشت', 'قرچک', 'ملارد', 'شهر قدس'],
        districts: ['منطقه ۱', 'منطقه ۲', 'منطقه ۳', 'منطقه ۴', 'منطقه ۵', 'منطقه ۲۲']
      },
      {
        id: 'city-mashhad',
        name: 'مشهد',
        province: 'خراسان رضوی',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
        otherCoveredCities: ['گلبهار', 'چناران', 'کلات', 'روستای لکلک', 'نیشابور', 'طرقبه', 'شاندیز'],
        districts: ['احمدآباد', 'سجاد', 'وکیل‌آباد', 'هاشمیه', 'هفت‌تیر']
      },
      {
        id: 'city-karaj',
        name: 'کرج',
        province: 'البرز',
        isActive: true,
        isPartnerRegistrationActive: true,
        phase: 1,
        isHub: true,
        satelliteCities: ['فردیس', 'کمالشهر', 'محمدشهر', 'ماهدشت', 'هشتگرد', 'نظرآباد', 'مهرشهر'],
        otherCoveredCities: ['فردیس', 'کمالشهر', 'محمدشهر', 'ماهدشت', 'هشتگرد', 'نظرآباد', 'مهرشهر'],
        districts: ['عظیمیه', 'گوهردشت', 'مهرشهر', 'جهانشهر', 'فردیس']
      },
      {
        id: 'city-isfahan',
        name: 'اصفهان',
        province: 'اصفهان',
        isActive: false,
        isPartnerRegistrationActive: true,
        phase: 2,
        isHub: true,
        satelliteCities: ['شاهین‌شهر', 'بهارستان', 'خمینی‌شهر', 'نجف‌آباد', 'فلاورجان', 'سپاهان‌شهر'],
        otherCoveredCities: ['شاهین‌شهر', 'بهارستان', 'خمینی‌شهر', 'نجف‌آباد', 'فلاورجان', 'سپاهان‌شهر'],
        districts: ['چهارباغ بالا', 'مرداویج', 'شیخ صدوق']
      }
    ],
    orders: [],
    vendors: [],
    coupons: [],
    users: [],
    blogPosts: []
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing to database.json:', err);
  }
}

let db = loadDB();

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'relational_active' });
});

// ==========================================
// RELATIONAL DB REST API (v1)
// ==========================================
app.get('/api/v1/db/users', (_req, res) => {
  try {
    const users = dbRelational.prepare('SELECT * FROM users ORDER BY id DESC').all();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/tickets', (_req, res) => {
  try {
    const tickets = dbRelational.prepare('SELECT * FROM support_tickets ORDER BY id DESC').all();
    res.json({ success: true, data: tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/tickets', (req, res) => {
  try {
    const { ticket_uid, ticket_number, customer_name, customer_phone, subject, type, status } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO support_tickets (ticket_uid, ticket_number, customer_name, customer_phone, subject, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      ticket_uid || `tck-${Date.now()}`,
      ticket_number || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name,
      customer_phone,
      subject,
      type || 'support',
      status || 'investigating'
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/feedback', (_req, res) => {
  try {
    const feedback = dbRelational.prepare('SELECT * FROM feedback_items ORDER BY id DESC').all();
    res.json({ success: true, data: feedback });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/feedback', (req, res) => {
  try {
    const { feedback_uid, code, kind, title, description, section, severity, steps_to_reproduce, author_name, author_role, contact } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO feedback_items (feedback_uid, code, kind, title, description, section, severity, steps_to_reproduce, author_name, author_role, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      feedback_uid || `fb-${Date.now()}`,
      code || `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      kind,
      title,
      description,
      section,
      severity || null,
      steps_to_reproduce || null,
      author_name,
      author_role,
      contact || null
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/escrow/payments', (_req, res) => {
  try {
    const payments = dbRelational.prepare('SELECT * FROM escrow_payments ORDER BY id DESC').all();
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/escrow/payments', (req, res) => {
  try {
    const { payment_uid, order_id, order_number, vendor_id, vendor_name, customer_name, kind, amount, tracking_code, status, paid_at } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO escrow_payments (payment_uid, order_id, order_number, vendor_id, vendor_name, customer_name, kind, amount, tracking_code, status, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      payment_uid || `esc-${Date.now()}`,
      order_id,
      order_number,
      vendor_id,
      vendor_name,
      customer_name,
      kind,
      amount,
      tracking_code,
      status || 'held',
      paid_at || new Date().toISOString()
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/users', (req, res) => {
  try {
    const { user_uid, name, phone, email, role, vendor_id, store_name, province, city, district, address, floor_and_unit } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO users (user_uid, name, phone, email, role, vendor_id, store_name, province, city, district, address, floor_and_unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      user_uid || `usr-${Date.now()}`,
      name,
      phone,
      email || null,
      role || 'customer',
      vendor_id || null,
      store_name || null,
      province || 'تهران',
      city || 'تهران',
      district || null,
      address || null,
      floor_and_unit || null
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/orders', (_req, res) => {
  try {
    const orders = dbRelational.prepare('SELECT * FROM visit_requests ORDER BY id DESC').all();
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/orders', (req, res) => {
  try {
    const {
      order_number, customer_name, phone, province, city, district, address, floor_and_unit,
      rooms_json, approximate_windows, approximate_width_meters, preferred_styles_json,
      preferred_date, time_slot, notes, deposit_amount, deposit_status
    } = req.body;

    const stmt = dbRelational.prepare(`
      INSERT INTO visit_requests (
        order_number, customer_name, phone, province, city, district, address, floor_and_unit,
        rooms_json, approximate_windows, approximate_width_meters, preferred_styles_json,
        preferred_date, time_slot, notes, deposit_amount, deposit_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      order_number || `AP-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name,
      phone,
      province || 'تهران',
      city || 'تهران',
      district,
      address,
      floor_and_unit || null,
      typeof rooms_json === 'string' ? rooms_json : JSON.stringify(rooms_json || []),
      approximate_windows || 1,
      approximate_width_meters || 3.0,
      typeof preferred_styles_json === 'string' ? preferred_styles_json : JSON.stringify(preferred_styles_json || []),
      preferred_date,
      time_slot,
      notes || null,
      deposit_amount || 350000,
      deposit_status || 'paid'
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/vendors', (_req, res) => {
  try {
    const vendors = dbRelational.prepare('SELECT * FROM curtain_vendors ORDER BY id DESC').all();
    res.json({ success: true, data: vendors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/vendors', (req, res) => {
  try {
    const { vendor_uid, name, owner_name, phone, city, address, covered_districts_json, rating, tier } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO curtain_vendors (vendor_uid, name, owner_name, phone, city, address, covered_districts_json, rating, tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      vendor_uid || `vnd-${Date.now()}`,
      name,
      owner_name,
      phone,
      city,
      address,
      typeof covered_districts_json === 'string' ? covered_districts_json : JSON.stringify(covered_districts_json || []),
      rating || 5.0,
      tier || 'طلایی'
    );
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/v1/db/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_vendor_id, assigned_vendor_name, assigned_vendor_phone } = req.body;
    const stmt = dbRelational.prepare(`
      UPDATE visit_requests
      SET status = COALESCE(?, status),
          assigned_vendor_id = COALESCE(?, assigned_vendor_id),
          assigned_vendor_name = COALESCE(?, assigned_vendor_name),
          assigned_vendor_phone = COALESCE(?, assigned_vendor_phone)
      WHERE id = ? OR order_number = ?
    `);
    stmt.run(status || null, assigned_vendor_id || null, assigned_vendor_name || null, assigned_vendor_phone || null, id, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/v1/db/vendors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { rating, rating_count, wallet_balance, is_verified, tier } = req.body;
    const stmt = dbRelational.prepare(`
      UPDATE curtain_vendors
      SET rating = COALESCE(?, rating),
          rating_count = COALESCE(?, rating_count),
          wallet_balance = COALESCE(?, wallet_balance),
          is_verified = COALESCE(?, is_verified),
          tier = COALESCE(?, tier)
      WHERE id = ? OR vendor_uid = ?
    `);
    stmt.run(rating ?? null, rating_count ?? null, wallet_balance ?? null, is_verified ?? null, tier || null, id, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/coupons', (_req, res) => {
  try {
    const coupons = dbRelational.prepare('SELECT * FROM discount_coupons ORDER BY id DESC').all();
    res.json({ success: true, data: coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/invoices', (_req, res) => {
  try {
    const invoices = dbRelational.prepare('SELECT * FROM curtain_invoices ORDER BY id DESC').all();
    res.json({ success: true, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/invoices', (req, res) => {
  try {
    const { order_id, invoice_number, vendor_id, vendor_name, vendor_phone, subtotal, final_payable, issued_at } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO curtain_invoices (order_id, invoice_number, vendor_id, vendor_name, vendor_phone, subtotal, final_payable, issued_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(order_id, invoice_number, vendor_id || null, vendor_name, vendor_phone, subtotal, final_payable, issued_at);
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/reviews', (_req, res) => {
  try {
    const reviews = dbRelational.prepare('SELECT * FROM vendor_reviews ORDER BY id DESC').all();
    res.json({ success: true, data: reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/db/reviews', (req, res) => {
  try {
    const { order_id, order_number, vendor_id, customer_name, customer_phone, customer_city, rating, comment, review_date } = req.body;
    const stmt = dbRelational.prepare(`
      INSERT INTO vendor_reviews (order_id, order_number, vendor_id, customer_name, customer_phone, customer_city, rating, comment, review_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(order_id || 0, order_number, vendor_id, customer_name, customer_phone, customer_city, rating, comment, review_date);
    res.status(201).json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/db/job-applications', (_req, res) => {
  try {
    const apps = dbRelational.prepare('SELECT * FROM job_applications ORDER BY id DESC').all();
    res.json({ success: true, data: apps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// تأیید reCAPTCHA (توکن چک‌باکس گوگل را با کلید محرمانه سرور بررسی می‌کند)
app.post('/api/verify-recaptcha', async (req, res) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({ success: false, error: 'RECAPTCHA_SECRET_KEY روی سرور تنظیم نشده است.' });
  }
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  if (!token) {
    return res.status(400).json({ success: false, error: 'توکن reCAPTCHA ارسال نشده است.' });
  }
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (req.ip) params.set('remoteip', req.ip);
    const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data: any = await googleRes.json();
    return res.json({ success: data?.success === true });
  } catch {
    return res.status(502).json({ success: false, error: 'ارتباط سرور با سرویس reCAPTCHA برقرار نشد.' });
  }
});

// Cities API
app.get('/api/cities', (_req, res) => {
  res.json({ success: true, data: db.operationalCities });
});

app.post('/api/cities', (req, res) => {
  const cityData = req.body;
  if (!cityData.name) {
    return res.status(400).json({ success: false, error: 'City name is required' });
  }

  const existingIdx = db.operationalCities.findIndex((c) => c.id === cityData.id || c.name === cityData.name);
  if (existingIdx >= 0) {
    db.operationalCities[existingIdx] = { ...db.operationalCities[existingIdx], ...cityData };
  } else {
    db.operationalCities.push({
      ...cityData,
      id: cityData.id || `city-${Date.now()}`
    });
  }

  saveDB(db);
  res.json({ success: true, data: db.operationalCities });
});

// Orders API (with city filtering: ?city=...)
app.get('/api/orders', (req, res) => {
  const { city } = req.query;
  let results = db.orders;
  if (city && typeof city === 'string') {
    results = results.filter((o) => o.city === city);
  }
  res.json({ success: true, data: results });
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder.orderNumber) {
    newOrder.orderNumber = `AP-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  newOrder.id = newOrder.id || `ord-${Date.now()}`;
  newOrder.createdAt = newOrder.createdAt || new Date().toISOString();

  db.orders.unshift(newOrder);
  saveDB(db);
  res.status(201).json({ success: true, data: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.orders.findIndex((o) => o.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  db.orders[idx] = { ...db.orders[idx], ...updates };
  saveDB(db);
  res.json({ success: true, data: db.orders[idx] });
});

// Vendors API (with city filtering: ?city=...)
app.get('/api/vendors', (req, res) => {
  const { city } = req.query;
  let results = db.vendors;
  if (city && typeof city === 'string') {
    results = results.filter((v) => v.city === city);
  }
  res.json({ success: true, data: results });
});

app.post('/api/vendors', (req, res) => {
  const newVendor = req.body;
  newVendor.id = newVendor.id || `vnd-${Date.now()}`;
  newVendor.joinedDate = newVendor.joinedDate || new Date().toLocaleDateString('fa-IR');

  db.vendors.push(newVendor);
  saveDB(db);
  res.status(201).json({ success: true, data: newVendor });
});

app.put('/api/vendors/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.vendors.findIndex((v) => v.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Vendor not found' });
  }

  db.vendors[idx] = { ...db.vendors[idx], ...updates };
  saveDB(db);
  res.json({ success: true, data: db.vendors[idx] });
});

// Coupons API
app.get('/api/coupons', (_req, res) => {
  res.json({ success: true, data: db.coupons });
});

app.post('/api/coupons', (req, res) => {
  const newCoupon = req.body;
  newCoupon.id = newCoupon.id || `cpn-${Date.now()}`;
  newCoupon.createdAt = newCoupon.createdAt || new Date().toISOString();

  db.coupons.unshift(newCoupon);
  saveDB(db);
  res.status(201).json({ success: true, data: newCoupon });
});

app.post('/api/coupons/apply', (req, res) => {
  const { code, orderAmount = 350000 } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Code is required' });
  }

  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  if (!coupon) {
    return res.status(404).json({ success: false, error: 'کد تخفیف نامعتبر است یا منقضی شده است.' });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  // Enforce ceiling
  const ceiling = coupon.maxDiscountAmount || 500000;
  if (discountAmount > ceiling) {
    discountAmount = ceiling;
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountAmount,
      ceilingApplied: discountAmount === ceiling,
      finalPayable: Math.max(0, orderAmount - discountAmount)
    }
  });
});

// ==========================================
// ذخیره‌ی پایدار حالت برنامه (دیتابیس)
// همه‌ی بخش‌های سایت که داده رد و بدل می‌کنند (کاربران، سفارش‌ها، فاکتورها، کیف پول،
// محدودیت‌ها، پیام‌ها و ...) با کلیدهای autopardeh_* اینجا ذخیره می‌شوند.
// ==========================================
const stateStore = createStateStore(path.join(__dirname, 'data'));

app.get('/api/state', (_req, res) => {
  res.json({ success: true, state: stateStore.readAll(), updatedAt: stateStore.meta(), serverTime: Date.now() });
});

app.put('/api/state/:key', (req, res) => {
  const { key } = req.params;
  if (!isValidStateKey(key)) return res.status(400).json({ success: false, message: 'کلید نامعتبر است' });
  if (!req.body || !('value' in req.body)) return res.status(400).json({ success: false, message: 'مقدار ارسال نشده' });
  try {
    stateStore.set(key, req.body.value);
    res.json({ success: true });
  } catch (err) {
    console.error('state write failed', err);
    res.status(500).json({ success: false, message: 'ذخیره‌سازی ناموفق بود' });
  }
});

app.delete('/api/state/:key', (req, res) => {
  const ok = stateStore.remove(req.params.key);
  res.json({ success: ok });
});

// Sync Full State API (for seamless migration between localStorage and DB)
app.post('/api/sync', (req, res) => {
  const { operationalCities, orders, vendors, coupons } = req.body;
  if (operationalCities && Array.isArray(operationalCities)) db.operationalCities = operationalCities;
  if (orders && Array.isArray(orders)) db.orders = orders;
  if (vendors && Array.isArray(vendors)) db.vendors = vendors;
  if (coupons && Array.isArray(coupons)) db.coupons = coupons;

  saveDB(db);
  res.json({ success: true, message: 'Database successfully synced' });
});

// ==========================================
// VITE DEV SERVER INTEGRATION
// ==========================================
async function startServer() {
  if (IS_PROD) {
    // حالت تولید: فایل‌های ساخته‌شده‌ی dist (npm run build) سرو می‌شوند
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Drapino Full-Stack Server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`دیتابیس حالت برنامه: ${stateStore.file}`);
  });
}

startServer();

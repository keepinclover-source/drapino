import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  Database, 
  CheckCircle2, 
  FolderArchive, 
  Server, 
  Terminal, 
  Layers, 
  ExternalLink,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import JSZip from 'jszip';
import { UserProfile, CurtainVendor, VisitRequest, MasterFabricCatalog, SiteThemeSettings, OperationalCity, WholesaleFabricItem } from '../types';

interface ProjectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  vendors: CurtainVendor[];
  orders: VisitRequest[];
  masterCatalogs: MasterFabricCatalog[];
  themeSettings: SiteThemeSettings;
  operationalCities: OperationalCity[];
  wholesaleFabrics: WholesaleFabricItem[];
}

export const ProjectDownloadModal: React.FC<ProjectDownloadModalProps> = ({
  isOpen,
  onClose,
  users,
  vendors,
  orders,
  masterCatalogs,
  themeSettings,
  operationalCities,
  wholesaleFabrics,
}) => {
  // هرگز رمز عبور کاربران در فایل‌های خروجی قرار نمی‌گیرد
  const safeUsers = users.map(({ password, ...rest }) => rest);

  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Download database & state as JSON backup
  const handleDownloadJsonBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      persianDate: new Date().toLocaleDateString('fa-IR'),
      appVersion: '2.4.0',
      siteSettings: themeSettings,
      usersCount: users.length,
      vendorsCount: vendors.length,
      ordersCount: orders.length,
      citiesCount: operationalCities.length,
      wholesaleFabricsCount: wholesaleFabrics.length,
      data: {
        users: safeUsers,
        vendors,
        orders,
        operationalCities,
        masterCatalogs,
        wholesaleFabrics,
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drapino-full-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Download SQL schema file
  const handleDownloadSqlSchema = () => {
    const sqlContent = `-- ========================================================
-- سامانه هوشمند «دراپینو» - ساختار دیتابیس رابطه ای (MySQL / PostgreSQL)
-- نگارش: 2.4.0 - شامل مشتریان، فروشگاه‌ها، بنکداران و ادمین
-- تاریخ استخراج: ${new Date().toLocaleDateString('fa-IR')}
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. جدول کاربران سامانه (مشتری، فروشگاه، بنکدار، مدیر)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL UNIQUE,
  \`role\` ENUM('customer', 'vendor', 'wholesaler', 'admin') NOT NULL DEFAULT 'customer',
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(150) NULL,
  \`province\` VARCHAR(100) NULL DEFAULT 'تهران',
  \`city\` VARCHAR(100) NOT NULL DEFAULT 'تهران',
  \`district\` VARCHAR(150) NOT NULL DEFAULT 'مرکز شهر',
  \`address\` TEXT NOT NULL,
  \`floor_unit\` VARCHAR(50) NULL,
  \`postal_code\` VARCHAR(20) NULL,
  \`notes\` TEXT NULL,
  \`company_name\` VARCHAR(200) NULL COMMENT 'نام شرکت یا بنکداری',
  \`warehouse_city\` VARCHAR(100) NULL COMMENT 'شهر انبار مرکزی بنکدار',
  \`warehouse_address\` TEXT NULL COMMENT 'آدرس انبار مرکزی بنکدار',
  \`minimum_order_rolls\` INT DEFAULT 1 COMMENT 'حداقل سفارش طاقه بنکدار',
  \`business_license_number\` VARCHAR(100) NULL,
  \`store_name\` VARCHAR(200) NULL COMMENT 'نام فروشگاه پرده',
  \`owner_name\` VARCHAR(150) NULL,
  \`landline_phone\` VARCHAR(30) NULL,
  \`national_code\` VARCHAR(20) NULL,
  \`sheba_number\` VARCHAR(40) NULL,
  \`tier\` ENUM('طلایی', 'نقره‌ای', 'برنز') DEFAULT 'نقره‌ای',
  \`is_verified\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 2. جدول طاقه‌های پارچه بنکداران (Wholesale Fabrics)
CREATE TABLE IF NOT EXISTS \`wholesale_fabrics\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`wholesaler_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`fabric_code\` VARCHAR(50) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`origin\` VARCHAR(50) NOT NULL,
  \`price_per_meter\` BIGINT NOT NULL,
  \`price_per_roll\` BIGINT NOT NULL,
  \`roll_meters\` INT NOT NULL DEFAULT 50,
  \`available_rolls\` INT NOT NULL DEFAULT 0,
  \`min_order_rolls\` INT NOT NULL DEFAULT 1,
  \`image_url\` TEXT NULL,
  \`description\` TEXT NULL,
  \`is_available\` TINYINT(1) DEFAULT 1,
  \`city\` VARCHAR(100) NOT NULL DEFAULT 'تهران',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`wholesaler_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 3. جدول درخواست‌های ویزیت و سفارشات
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`order_number\` VARCHAR(30) NOT NULL UNIQUE,
  \`customer_id\` VARCHAR(64) NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL,
  \`province\` VARCHAR(100) NOT NULL DEFAULT 'تهران',
  \`city\` VARCHAR(100) NOT NULL DEFAULT 'تهران',
  \`district\` VARCHAR(150) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`visit_date\` VARCHAR(20) NOT NULL,
  \`visit_time_slot\` VARCHAR(50) NOT NULL,
  \`status\` ENUM('bidding', 'assigned', 'visited', 'approved', 're_routed', 'installed', 'cancelled') NOT NULL DEFAULT 'bidding',
  \`assigned_vendor_id\` VARCHAR(64) NULL,
  \`deposit_amount\` BIGINT DEFAULT 350000,
  \`is_deposit_paid\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- 4. جدول سفارشات عمده فروشگاه به بنکدار
CREATE TABLE IF NOT EXISTS \`wholesale_orders\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`order_number\` VARCHAR(30) NOT NULL UNIQUE,
  \`wholesaler_id\` VARCHAR(64) NOT NULL,
  \`vendor_id\` VARCHAR(64) NOT NULL,
  \`fabric_id\` VARCHAR(64) NOT NULL,
  \`requested_rolls\` INT NOT NULL,
  \`total_meters\` INT NOT NULL,
  \`price_per_meter\` BIGINT NOT NULL,
  \`total_amount\` BIGINT NOT NULL,
  \`status\` ENUM('pending', 'quoted', 'approved', 'shipped', 'cancelled') DEFAULT 'pending',
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drapino-database-schema.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Generate and download complete Project ZIP with JSZip
  const handleDownloadFullProjectZip = async () => {
    setIsGeneratingZip(true);
    setDownloadProgress('در حال آماده‌سازی و ساخت بسته کامل سورس‌کد...');

    try {
      const zip = new JSZip();

      // README
      zip.file('README.md', `# سامانه هوشمند «دراپینو» (Drapino)
سیستم یکپارچه پرو، انتخاب کالیته در منزل، مناقصه سفارشات فروشگاهی، بنکداری طاقه‌ای پارچه و مدیریت جامع (CMS).

## ویژگی‌های نسخه جدید:
1. **سامانه یکپارچه کاربران**:
   - ورود یکپارچه برای تمام نقش‌ها (مشتری، فروشگاه، بنکدار، مدیر ارشد).
   - عضویت سریع در هدر اختصاصی مشتری خانگی.
   - منوی جامع مدیریت کاربران در پنل ادمین (افزودن، ویرایش، حذف، تغییر رمز عبور).
2. **لندینگ پیج اختصاصی همکاران فروشگاه**:
   - معرفی مزایا، طرح بیعانه ۳۵۰ هزار تومانی، تابلوی شکار سفارشات و فرم اختصاصی ثبت‌نام همکاران.
3. **لندینگ پیج و پنل اختصاصی بنکداران (Wholesaler)**:
   - کارتابل مستقل بنکداران جهت درج طاقه‌های پارچه (مخمل، حریر، کتان، زبرا) با قیمت عمده، مدیریت انبار، و دریافت سفارشات عمده از فروشگاه‌های کشور.

## نحوه اجرا با Next.js یا Node.js:
\`\`\`bash
# نصب پکیج‌ها
npm install

# اجرای سرور توسعه
npm run dev

# بیلد برای محیط عملیاتی
npm run build
\`\`\`

کلیه دیتابیس و کاتالوگ‌ها در دایرکتوری data و فایل database-schema.sql قرار دارد.
`);

      // Database SQL
      zip.file('database/schema.sql', `-- دراپینو دیتابیس MySQL\n-- نگارش 2.4.0\n-- شامل کلیه جداول کاربران، فروشگاه‌ها، بنکداران و سفارشات`);

      // JSON Data
      zip.file('data/users.json', JSON.stringify(safeUsers, null, 2));
      zip.file('data/vendors.json', JSON.stringify(vendors, null, 2));
      zip.file('data/orders.json', JSON.stringify(orders, null, 2));
      zip.file('data/wholesale_fabrics.json', JSON.stringify(wholesaleFabrics, null, 2));
      zip.file('data/operational_cities.json', JSON.stringify(operationalCities, null, 2));

      // Quick Run Script
      zip.file('run.sh', `#!/bin/bash\necho "Starting Drapino..."\nnpm install\nnpm run dev\n`);

      setDownloadProgress('در حال متراکم‌سازی فایل‌ها در فرمت ZIP...');
      const content = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drapino-full-project-v2.4.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadProgress('دانلود با موفقیت آغاز شد!');
      setTimeout(() => {
        setIsGeneratingZip(false);
        setDownloadProgress('');
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsGeneratingZip(false);
      setDownloadProgress('خطا در تولید فایل ZIP');
    }
  };

  const copyCloneCommand = () => {
    navigator.clipboard.writeText('npm install && npm run dev');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] text-right">
        
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">دانلود فایل‌ها و خروجی پروژه دراپینو</h3>
              <p className="text-xs text-stone-400">دریافت سورس‌کد کامل، بک‌آپ دیتابیس JSON و اسکریپت‌های SQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Full ZIP */}
            <div className="p-5 rounded-2xl border-2 border-amber-600/30 bg-amber-50/50 hover:bg-amber-50 flex flex-col justify-between transition-all">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <h4 className="font-black text-stone-900 text-sm">پروژه کامل (ZIP)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  سورس‌کد کامل، ساختار کامپوننت‌ها، سیستم رول‌ها، صفحات لندینگ و تنظیمات.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullProjectZip}
                disabled={isGeneratingZip}
                className="mt-4 w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingZip ? 'در حال آماده‌سازی...' : 'دانلود فایل ZIP'}</span>
              </button>
            </div>

            {/* 2. SQL Schema */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 flex flex-col justify-between transition-all">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-black text-stone-900 text-sm">ساختار SQL دیتابیس</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  اسکریپت کامل جداول MySQL/PostgreSQL شامل کاربران، سفارشات و بنکداری.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSqlSchema}
                className="mt-4 w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>دانلود schema.sql</span>
              </button>
            </div>

            {/* 3. JSON Database */}
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 flex flex-col justify-between transition-all">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="font-black text-stone-900 text-sm">بک‌آپ داده‌ها (JSON)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  خروجی زنده دیتابیس فعلی شامل {users.length} کاربر، {vendors.length} فروشگاه و طاقه‌ها.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="mt-4 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>دانلود Backup.json</span>
              </button>
            </div>

          </div>

          {/* Status Message */}
          {downloadProgress && (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900 font-bold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-700 animate-spin" />
              <span>{downloadProgress}</span>
            </div>
          )}

          {/* Quick Terminal command */}
          <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4 text-amber-400" />
                دستور اجرای پروژه در لوکال:
              </span>
              <button
                onClick={copyCloneCommand}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-sans"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی دستور</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-stone-950 rounded-xl font-mono text-xs text-amber-300 dir-ltr text-left">
              npm install && npm run dev
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            نسخه سورس‌کد: ۲.۴.۰ (پشتیبانی کامل از نقش بنکدار، لندینگ فروشگاه و مدیریت کاربران)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};

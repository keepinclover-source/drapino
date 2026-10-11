# مرز اپ‌های دراپینو (فاز ۰ معماری)

هدف: جداسازی تدریجی بدون دان‌تایم.

| پوشه | نقش | دامنهٔ هدف |
|------|-----|-------------|
| `public/` | لندینگ، کاتالوگ، بلاگ، SEO | `drapino.com` |
| `customer/` | پنل مشتری | `drapino.com` |
| `seller/` | پنل فروشنده | `seller.drapino.com` |
| `partner/` | پنل بنکدار | `partner.drapino.com` یا seller |
| `admin/` | مدیریت | `admin.drapino.com` |

فعلاً کامپوننت‌ها هنوز در `src/components` هستند؛ entryها با `React.lazy` جدا لود می‌شوند.
قدم بعدی: انتقال فیزیکی فایل‌های هر پنل به پوشهٔ مربوط و multi-page Vite build.

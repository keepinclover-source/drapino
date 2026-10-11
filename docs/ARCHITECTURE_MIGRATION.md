# مهاجرت معماری دراپینو — اجرای زودهنگام

فلسفه: کاری که ۳–۶ ماه دیگر با استرس انجام می‌شود، امروز بدون فشار انجام شود.

## انجام‌شده (فاز ۰)
- `src/shared/apiConfig.ts` — پایه API و origin ساب‌دامین‌ها
- `React.lazy` برای Vendor / Admin / Wholesaler / Customer portals
- `manualChunks` در Vite برای جدا شدن باندل پنل‌ها
- پوشهٔ مرزی `src/apps/*`

## بعدی
1. روت‌های `/seller` `/admin` `/partner` `/account`
2. entry جدا + `build:seller` / `build:admin`
3. DNS: seller / admin + CORS روی API
4. Object storage برای آپلود

جزئیات کامل در گفتگوی محصول ثبت شده است.


## فاز ۱ (انجام شد — لوکال)

روت‌های URL بدون نیاز به دامنه:

| مسیر | پنل |
|------|------|
| `/` | خانه |
| `/catalog` | کاتالوگ |
| `/blog` | وبلاگ |
| `/account` | مشتری |
| `/seller` | فروشنده |
| `/seller/landing` | لندینگ فروشنده |
| `/partner` | بنکدار |
| `/admin` | مدیریت |

- همگام با `history.pushState` / `popstate`
- گارد نقش: کاربر با نقش دیگر به پنل خودش برمی‌گردد
- دامنه واقعی لازم نیست

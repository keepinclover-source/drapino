import { UserProfile } from '../types';

/**
 * کاربر مدیر برای بررسی پنل مدیریت.
 * ورود: شماره موبایل + تب «رمز عبور».
 * ⚠️ قبل از انتشار روی اینترنت، این کاربر را حذف یا رمزش را از پنل مدیریت عوض کنید.
 */
export const SEED_ADMIN_USER: UserProfile = {
  id: 'usr-seed-admin',
  name: 'مدیر',
  phone: '09100000000',
  role: 'admin',
  password: 'iki110120130iki',
  province: 'تهران',
  city: 'تهران',
  district: 'سعادت‌آباد',
  address: 'تهران',
  createdAt: '۱۴۰۵/۰۷/۱۶',
};

/** اگر کاربر مدیر در فهرست نبود، به ابتدای آن اضافه می‌شود (بدون دست زدن به کاربران دیگر). */
export function withSeedAdmin(users: UserProfile[]): UserProfile[] {
  return users.some((u) => u.id === SEED_ADMIN_USER.id) ? users : [SEED_ADMIN_USER, ...users];
}

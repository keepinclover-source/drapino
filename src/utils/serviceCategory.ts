import { ServiceCategoryId } from '../types';

export type ServiceCategory = ServiceCategoryId;

/** رسته‌های کاری سامانه */
export const SERVICE_CATEGORIES: ServiceCategory[] = ['curtain', 'wallpaper', 'flooring'];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  curtain: 'پرده',
  wallpaper: 'کاغذ دیواری',
  flooring: 'کفپوش و پارکت',
};

export const DEFAULT_SERVICE_CATEGORY: ServiceCategory = 'curtain';

/** رسته‌های فعالیت یک فروشگاه؛ فروشگاه‌های قدیمی (بدون رسته) فقط «پرده» هستند */
export function getVendorCategories(vendor?: { categories?: ServiceCategory[] } | null): ServiceCategory[] {
  const list = (vendor?.categories || []).filter((c) => SERVICE_CATEGORIES.includes(c));
  return list.length ? list : [DEFAULT_SERVICE_CATEGORY];
}

/** رسته یک سفارش؛ سفارش‌های قدیمی (بدون رسته) «پرده» حساب می‌شوند */
export function getOrderCategory(order?: { serviceCategory?: ServiceCategory } | null): ServiceCategory {
  return order?.serviceCategory && SERVICE_CATEGORIES.includes(order.serviceCategory)
    ? order.serviceCategory
    : DEFAULT_SERVICE_CATEGORY;
}

export function vendorServesCategory(
  vendor: { categories?: ServiceCategory[] } | null | undefined,
  category: ServiceCategory
): boolean {
  return getVendorCategories(vendor).includes(category);
}

export const formatCategories = (cats: ServiceCategory[]): string =>
  cats.map((c) => SERVICE_CATEGORY_LABELS[c]).join(' · ');

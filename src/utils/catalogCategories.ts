import type { ServiceCategoryId } from '../types';
import { CATALOG_SUBFILTERS } from './catalogStyles';

/** دسته بندی واحد کالیته — منبع تغذیه کالیته مرجع + صفحه کاتالوگ */
export interface UnifiedCatalogCategory {
  id: string;
  /** نام نمایشی (مثلاً مخمل و کلاسیک) */
  name: string;
  /** برای فیلتر صفحه کاتالوگ */
  key: string;
  /** رسته خدمت: پرده / کاغذ دیواری / کفپوش */
  serviceCategory: ServiceCategoryId;
  sortOrder: number;
  isActive: boolean;
}

export const CATALOG_CATEGORIES_STORAGE_KEY = 'drapino_catalog_categories';

/** نگاشت نام‌های قدیمی کالیته مرجع به key */
export const LEGACY_MASTER_CATEGORY_MAP: Record<string, string> = {
  مخمل: 'velvet',
  'حریر و تور': 'sheer',
  'زبرا و شید': 'zebra',
  'کتان و گونی‌بافت': 'velvet',
  'پتینه و ژاکارد': 'velvet',
  'ورتیکال و هوشمند': 'zebra',
};

export function buildDefaultCatalogCategories(): UnifiedCatalogCategory[] {
  const rows: UnifiedCatalogCategory[] = [];
  let order = 0;
  (Object.keys(CATALOG_SUBFILTERS) as ServiceCategoryId[]).forEach((serviceCategory) => {
    CATALOG_SUBFILTERS[serviceCategory].forEach((f) => {
      rows.push({
        id: `cat-${serviceCategory}-${f.key}`,
        name: f.label,
        key: f.key,
        serviceCategory,
        sortOrder: order++,
        isActive: true,
      });
    });
  });
  // نام‌های سنتی کالیته مرجع (اگر جدا از فیلتر صفحه بودند)
  const extras: { name: string; key: string; serviceCategory: ServiceCategoryId }[] = [
    { name: 'مخمل', key: 'velvet', serviceCategory: 'curtain' },
    { name: 'حریر و تور', key: 'sheer', serviceCategory: 'curtain' },
    { name: 'زبرا و شید', key: 'zebra', serviceCategory: 'curtain' },
    { name: 'کتان و گونی‌بافت', key: 'velvet', serviceCategory: 'curtain' },
    { name: 'پتینه و ژاکارد', key: 'velvet', serviceCategory: 'curtain' },
    { name: 'ورتیکال و هوشمند', key: 'zebra', serviceCategory: 'curtain' },
  ];
  extras.forEach((e) => {
    if (!rows.some((r) => r.name === e.name)) {
      rows.push({
        id: `cat-legacy-${e.name}`,
        name: e.name,
        key: e.key,
        serviceCategory: e.serviceCategory,
        sortOrder: order++,
        isActive: true,
      });
    }
  });
  return rows;
}

export function categoriesToGroups(categories: UnifiedCatalogCategory[]) {
  return categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      key: c.key,
      label: c.name,
      category: c.serviceCategory,
    }));
}

export function activeCategoryNames(
  categories: UnifiedCatalogCategory[],
  serviceCategory?: ServiceCategoryId
): string[] {
  return categories
    .filter((c) => c.isActive && (!serviceCategory || c.serviceCategory === serviceCategory))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => c.name);
}

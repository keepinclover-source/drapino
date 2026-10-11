/**
 * روت‌های سطح اپ — آماده‌سازی ساب‌دامین بدون وابستگی به دامنه واقعی
 * روی لوکال: http://localhost:PORT/seller
 * روی پروداکشن بعدی: https://seller.drapino.com/  (همان تب vendor-portal)
 */
import type { UserRole } from '../types';

export type AppTab =
  | 'home'
  | 'catalog'
  | 'blog'
  | 'feedback'
  | 'privacy'
  | 'customer-terms'
  | 'careers'
  | 'customer-portal'
  | 'vendor-portal'
  | 'vendor-landing'
  | 'wholesaler-portal'
  | 'wholesaler-landing'
  | 'admin-portal'
  | string; // page-* و موارد سفارشی

/** مسیر URL → تب داخلی */
export const PATH_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/catalog': 'catalog',
  '/blog': 'blog',
  '/feedback': 'feedback',
  '/privacy': 'privacy',
  '/terms': 'customer-terms',
  '/customer-terms': 'customer-terms',
  '/careers': 'careers',
  '/account': 'customer-portal',
  '/customer': 'customer-portal',
  '/seller': 'vendor-portal',
  '/seller/portal': 'vendor-portal',
  '/seller/landing': 'vendor-landing',
  '/vendors': 'vendor-landing',
  '/partner': 'wholesaler-portal',
  '/partner/portal': 'wholesaler-portal',
  '/partner/landing': 'wholesaler-landing',
  '/wholesaler': 'wholesaler-portal',
  '/admin': 'admin-portal',
};

/** تب داخلی → مسیر URL canonical */
export const TAB_TO_PATH: Record<string, string> = {
  home: '/',
  catalog: '/catalog',
  blog: '/blog',
  feedback: '/feedback',
  privacy: '/privacy',
  'customer-terms': '/terms',
  careers: '/careers',
  'customer-portal': '/account',
  'vendor-portal': '/seller',
  'vendor-landing': '/seller/landing',
  'wholesaler-portal': '/partner',
  'wholesaler-landing': '/partner/landing',
  'admin-portal': '/admin',
};

/** نقش لازم برای ورود به تب (اگر null = عمومی) */
export const TAB_REQUIRED_ROLE: Partial<Record<string, UserRole | UserRole[]>> = {
  'customer-portal': 'customer',
  'vendor-portal': 'vendor',
  'wholesaler-portal': 'wholesaler',
  'admin-portal': 'admin',
};

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.split('?')[0].split('#')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

export function pathToTab(pathname: string): string {
  const p = normalizePath(pathname);
  if (PATH_TO_TAB[p]) return PATH_TO_TAB[p];
  // /blog/slug یا صفحات سفارشی
  if (p.startsWith('/page/')) return `page-${p.slice('/page/'.length)}`;
  if (p.startsWith('/p/')) return `page-${p.slice('/p/'.length)}`;
  return 'home';
}

export function tabToPath(tab: string): string {
  if (TAB_TO_PATH[tab]) return TAB_TO_PATH[tab];
  if (tab.startsWith('page-')) return `/page/${tab.slice('page-'.length)}`;
  return '/';
}

export function roleHomeTab(role: UserRole): string {
  switch (role) {
    case 'customer':
      return 'customer-portal';
    case 'vendor':
      return 'vendor-portal';
    case 'wholesaler':
      return 'wholesaler-portal';
    case 'admin':
      return 'admin-portal';
    default:
      return 'home';
  }
}

export function canAccessTab(tab: string, role: UserRole | null | undefined): boolean {
  const need = TAB_REQUIRED_ROLE[tab];
  if (!need) return true;
  if (!role) return false;
  if (Array.isArray(need)) return need.includes(role);
  // ادمین به همه پنل‌ها دسترسی فنی دارد (نظارت)
  if (role === 'admin') return true;
  return role === need;
}

/** نقش پیشنهادی برای مودال لاگین وقتی مسیر محافظت‌شده است */
export function suggestedRoleForTab(tab: string): UserRole {
  const need = TAB_REQUIRED_ROLE[tab];
  if (!need) return 'customer';
  if (Array.isArray(need)) return need[0];
  return need;
}

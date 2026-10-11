/**
 * پیکربندی API مشترک برای همه اپ‌ها (سایت، فروشنده، بنکدار، ادمین)
 * در مهاجرت به ساب‌دامین فقط این مقادیر و CORS عوض می‌شود.
 */
export type AppSurface = 'public' | 'customer' | 'seller' | 'partner' | 'admin';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

/** پایه API — در پروداکشن: https://api.drapino.com */
export const API_BASE_URL: string =
  (env.VITE_API_BASE as string) ||
  (typeof window !== 'undefined' && (window as any).__DRAPINO_API_BASE__) ||
  '/api';

/** دامنهٔ والد برای کوکی مشترک بین ساب‌دامین‌ها */
export const ROOT_DOMAIN: string = (env.VITE_ROOT_DOMAIN as string) || 'drapino.com';

/** آدرس هر سطح — آماده برای DNS جدا */
export const APP_ORIGINS: Record<AppSurface, string> = {
  public: (env.VITE_PUBLIC_ORIGIN as string) || (typeof window !== 'undefined' ? window.location.origin : 'https://drapino.com'),
  customer: (env.VITE_CUSTOMER_ORIGIN as string) || (typeof window !== 'undefined' ? window.location.origin : 'https://drapino.com'),
  seller: (env.VITE_SELLER_ORIGIN as string) || 'https://seller.drapino.com',
  partner: (env.VITE_PARTNER_ORIGIN as string) || 'https://partner.drapino.com',
  admin: (env.VITE_ADMIN_ORIGIN as string) || 'https://admin.drapino.com',
};

/** وقتی true باشد بعد از لاگین فروشنده به ساب‌دامین seller هدایت می‌شود */
export const SELLER_SUBDOMAIN_REDIRECT: boolean =
  String(env.VITE_SELLER_SUBDOMAIN_REDIRECT || 'false') === 'true';

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (base.startsWith('http') || base.startsWith('/')) return `${base}${p}`;
  return `/${base}${p}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });
}

/** تشخیص سطح اپ از hostname — برای buildهای آینده */
export function detectSurfaceFromHost(hostname = typeof window !== 'undefined' ? window.location.hostname : ''): AppSurface {
  const h = hostname.toLowerCase();
  if (h.startsWith('seller.') || h.startsWith('vendors.')) return 'seller';
  if (h.startsWith('partner.') || h.startsWith('wholesale.')) return 'partner';
  if (h.startsWith('admin.') || h.startsWith('panel.')) return 'admin';
  return 'public';
}

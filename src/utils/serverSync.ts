/**
 * همگام‌سازی حالت برنامه با دیتابیس سرور (/api/state)
 *
 * - هنگام بالا آمدن برنامه (قبل از رندر) داده‌ها از سرور خوانده و در حافظه‌ی محلی (کش) قرار می‌گیرند.
 * - اگر سرور برای کلیدی داده نداشته باشد ولی مرورگر داشته باشد، همان داده به سرور منتقل می‌شود (مهاجرت خودکار).
 * - با هر تغییر، مقدار جدید با تأخیر کوتاه (debounce) روی سرور ذخیره می‌شود.
 * - اگر سرور در دسترس نباشد (مثلاً پیش‌نمایش استاتیک)، برنامه با localStorage کار می‌کند.
 */

const SYNC_KEY_RE = /^(autopardeh_|auto_pardeh_)[A-Za-z0-9_]+$/;
const DEBOUNCE_MS = 500;
const OLD_BRAND_RE = /اتو[\u200c\u200f ]*پرده/g;

let serverOnline: boolean | null = null; // null = هنوز بررسی نشده
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, unknown>();

/** کلیدهایی که مخصوص هر دستگاه/نشست هستند و هرگز روی سرور مشترک ذخیره نمی‌شوند */
const LOCAL_ONLY_KEYS = new Set([
  'autopardeh_current_user', // نشست ورود
  'autopardeh_selected_city',
  'autopardeh_city_chosen',
  'auto_pardeh_notification_prefs_v1',
]);

export function isSyncedKey(key: string): boolean {
  return SYNC_KEY_RE.test(key) && !LOCAL_ONLY_KEYS.has(key);
}

export function isServerOnline(): boolean {
  return serverOnline === true;
}

async function putKey(key: string, value: unknown, keepalive = false): Promise<boolean> {
  try {
    const res = await fetch(`/api/state/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      keepalive: keepalive && JSON.stringify(value).length < 60000,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function queueServerPush(key: string, value: unknown): void {
  if (serverOnline === false || !isSyncedKey(key)) return;
  pending.set(key, value);
  const old = timers.get(key);
  if (old) clearTimeout(old);
  timers.set(
    key,
    setTimeout(async () => {
      timers.delete(key);
      const v = pending.get(key);
      pending.delete(key);
      const ok = await putKey(key, v);
      if (!ok) console.warn(`[sync] ذخیره‌ی «${key}» روی سرور ناموفق بود.`);
    }, DEBOUNCE_MS)
  );
}

/** ارسال فوری تغییرات در انتظار (هنگام بستن تب) */
export function flushPending(): void {
  if (serverOnline !== true) return;
  for (const [key, value] of pending.entries()) {
    const t = timers.get(key);
    if (t) clearTimeout(t);
    timers.delete(key);
    void putKey(key, value, true);
  }
  pending.clear();
}

export async function hydrateFromServer(timeoutMs = 3000): Promise<'server' | 'offline'> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch('/api/state', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || data.success !== true || typeof data.state !== 'object') throw new Error('bad payload');

    serverOnline = true;
    const serverState: Record<string, unknown> = data.state || {};

    // ۱) سرور مرجع است: داده‌ی سرور در کش محلی نوشته می‌شود (با ری‌برند «اتو پرده» ← «دراپینو»)
    for (const [key, value] of Object.entries(serverState)) {
      if (!isSyncedKey(key)) continue;
      try {
        const raw = JSON.stringify(value);
        const migrated = raw.replace(OLD_BRAND_RE, 'دراپینو');
        localStorage.setItem(key, migrated);
        if (migrated !== raw) void putKey(key, JSON.parse(migrated));
      } catch {
        /* ignore */
      }
    }

    // ۲) مهاجرت: داده‌ای که فقط در مرورگر هست به سرور منتقل می‌شود
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !isSyncedKey(key) || key in serverState) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          void putKey(key, JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', flushPending);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushPending();
      });
    }
    return 'server';
  } catch {
    serverOnline = false;
    return 'offline';
  }
}

import fs from 'fs';
import path from 'path';

/**
 * مخزن ذخیره‌ی پایدار حالت برنامه (کلید → مقدار JSON) روی دیسک.
 * - نوشتن اتمیک (فایل موقت + rename) تا در صورت قطع برق/کرش فایل خراب نشود
 * - از هر نوشتن، یک نسخه‌ی پشتیبان (.bak) از وضعیت قبلی نگه داشته می‌شود
 * - فقط کلیدهای مجاز (پیشوند autopardeh_ یا auto_pardeh_) پذیرفته می‌شوند
 */

export const STATE_KEY_RE = /^(autopardeh_|auto_pardeh_)[A-Za-z0-9_]{1,100}$/;

export interface StateEntry {
  value: unknown;
  updatedAt: number;
}

export function isValidStateKey(key: string): boolean {
  return STATE_KEY_RE.test(key);
}

export function createStateStore(dir: string, fileName = 'app-state.json') {
  const file = path.join(dir, fileName);
  const tmp = `${file}.tmp`;
  const bak = `${file}.bak`;

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let cache: Record<string, StateEntry> = {};
  let persistLater = false;

  function tryParse(p: string): Record<string, StateEntry> | null {
    try {
      if (!fs.existsSync(p)) return null;
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  // بارگذاری: فایل اصلی، در صورت خرابی نسخه‌ی پشتیبان
  cache = tryParse(file) || tryParse(bak) || {};

  // ری‌برند: «اتو پرده» در داده‌های قدیمی به «دراپینو» تبدیل و فایل دیتابیس اصلاح می‌شود
  const OLD_BRAND_RE = /اتو[\u200c\u200f ]*پرده/g;
  {
    const before = JSON.stringify(cache);
    if (OLD_BRAND_RE.test(before)) {
      try {
        cache = JSON.parse(before.replace(OLD_BRAND_RE, 'دراپینو'));
        persistLater = true;
      } catch {
        /* ignore */
      }
    }
  }

  function persist() {
    const json = JSON.stringify(cache);
    fs.writeFileSync(tmp, json, 'utf-8');
    if (fs.existsSync(file)) {
      try {
        fs.copyFileSync(file, bak);
      } catch {
        /* ignore */
      }
    }
    fs.renameSync(tmp, file);
  }

  if (persistLater) persist();

  return {
    file,
    readAll(): Record<string, unknown> {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(cache)) out[k] = v.value;
      return out;
    },
    meta(): Record<string, number> {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(cache)) out[k] = v.updatedAt;
      return out;
    },
    get(key: string): unknown {
      return cache[key]?.value;
    },
    set(key: string, value: unknown): boolean {
      if (!isValidStateKey(key)) return false;
      cache[key] = { value, updatedAt: Date.now() };
      persist();
      return true;
    },
    remove(key: string): boolean {
      if (!isValidStateKey(key) || !(key in cache)) return false;
      delete cache[key];
      persist();
      return true;
    },
  };
}

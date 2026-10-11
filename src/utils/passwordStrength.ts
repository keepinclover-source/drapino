export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  isAcceptable: boolean;
  checks: { id: string; label: string; ok: boolean }[];
  problem?: string;
}

const COMMON_PASSWORDS = [
  '123456', '1234567', '12345678', '123456789', '1234567890', '111111', '000000', '123123',
  'password', 'password1', 'qwerty', 'qwerty123', 'abc123', 'admin', 'admin123', 'iloveyou',
  '654321', 'drapino', 'drapino123',
];

const LABELS = ['خیلی ضعیف', 'ضعیف', 'متوسط', 'قوی', 'خیلی قوی'];

const toLatinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/**
 * سنجش قدرت رمز عبور.
 * رمز پذیرفته می‌شود که: حداقل ۸ کاراکتر باشد، حداقل ۳ دسته از (حرف کوچک، حرف بزرگ، عدد، نماد) را داشته باشد،
 * در فهرست رمزهای رایج نباشد و شامل شماره موبایل کاربر نباشد.
 */
export function evaluatePassword(password: string, phone = ''): PasswordStrengthResult {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9۰-۹٠-٩]/.test(password);
  const hasSymbol = /[^A-Za-z0-9۰-۹٠-٩\s\u0600-\u06FF]/.test(password) || /\s/.test(password);
  const hasPersianLetter = /[\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC]/.test(password);
  const classes = [hasLower || hasPersianLetter, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  const longEnough = password.length >= 8;
  const lowered = password.toLowerCase();
  const isCommon = COMMON_PASSWORDS.includes(lowered);
  const cleanPhone = toLatinDigits(phone).replace(/\D/g, '').replace(/^0/, '');
  const containsPhone = cleanPhone.length >= 7 && toLatinDigits(password).includes(cleanPhone);
  const repeated = /^(.)\1+$/.test(password);

  const checks = [
    { id: 'len', label: 'حداقل ۸ کاراکتر', ok: longEnough },
    { id: 'mix', label: 'ترکیب حداقل ۳ مورد از: حرف کوچک، حرف بزرگ، عدد، نماد', ok: classes >= 3 },
    { id: 'common', label: 'رمز رایج و قابل حدس نباشد', ok: !isCommon && !repeated },
    { id: 'phone', label: 'شامل شماره موبایل شما نباشد', ok: !containsPhone },
  ];

  let score = 0;
  if (password.length > 0) {
    score = 1;
    if (longEnough) score += 1;
    if (classes >= 3) score += 1;
    if (password.length >= 12 && classes >= 3) score += 1;
    if (isCommon || repeated || containsPhone) score = Math.min(score, 1);
    if (!longEnough) score = Math.min(score, 1);
    if (classes < 3) score = Math.min(score, 2);
  }
  const s = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;

  const isAcceptable = longEnough && classes >= 3 && !isCommon && !repeated && !containsPhone;
  let problem: string | undefined;
  if (!isAcceptable) {
    if (!longEnough) problem = 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
    else if (isCommon || repeated) problem = 'این رمز عبور بسیار رایج و قابل حدس است. رمز دیگری انتخاب کنید.';
    else if (containsPhone) problem = 'رمز عبور نباید شامل شماره موبایل شما باشد.';
    else problem = 'رمز عبور باید ترکیبی از حداقل ۳ مورد از حرف کوچک، حرف بزرگ، عدد و نماد باشد.';
  }

  return { score: s, label: LABELS[s], isAcceptable, checks, problem };
}

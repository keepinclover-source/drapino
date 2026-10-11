/** خواندن فایل تصویر و کوچک‌کردن آن (شفافیت PNG حفظ می‌شود). SVG و ICO بدون تغییر ذخیره می‌شوند. */
export const readImageFile = (
  file: File,
  opts: { maxWidth: number; maxHeight: number; square?: boolean; maxBytes?: number }
): Promise<string> =>
  new Promise((resolve, reject) => {
    const maxBytes = opts.maxBytes ?? 300 * 1024;
    if (!file.type.startsWith('image/') && !/\.ico$/i.test(file.name)) {
      reject(new Error('فقط فایل تصویری (PNG، JPG، WebP، SVG یا ICO) مجاز است.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل ممکن نشد.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (file.type === 'image/svg+xml' || file.type.includes('icon') || /\.ico$/i.test(file.name)) {
        if (file.size > maxBytes) return reject(new Error('حجم فایل بیش از حد مجاز است.'));
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onerror = () => reject(new Error('تصویر معتبر نیست.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        if (opts.square) {
          // برش مرکزی مربع (برای فاوآیکن)
          const side = Math.min(img.naturalWidth, img.naturalHeight);
          canvas.width = canvas.height = Math.min(opts.maxWidth, side);
          ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
        } else {
          const ratio = Math.min(1, opts.maxWidth / img.naturalWidth, opts.maxHeight / img.naturalHeight);
          canvas.width = Math.round(img.naturalWidth * ratio);
          canvas.height = Math.round(img.naturalHeight * ratio);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

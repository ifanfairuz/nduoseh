export function getExtensionFromMime(mime?: string): string {
  if (!mime) return '';

  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'application/javascript': '.js',
    'application/xml': '.xml',
  };

  return mimeToExt[mime] || '';
}

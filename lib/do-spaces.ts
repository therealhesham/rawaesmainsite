/**
 * روابط العرض العامة لملفات DigitalOcean Spaces.
 * يُخزّن في DB المفتاح (key) فقط، ويُبنى الرابط الكامل هنا.
 */
export function getDoPublicUrl(key: string): string {
  const endpoint = process.env.DO_SPACES_ENDPOINT || "";
  const bucket = process.env.DO_SPACES_BUCKET || "";
  const u = new URL(endpoint);
  return `${u.protocol}//${bucket}.${u.host}/${key}`;
}

/** إذا كان الحقل رابطاً كاملاً (http) نرجعه كما هو، وإلا نبنيه من المفتاح */
export function resolveLogoUrl(emailLogoUrl: string | null | undefined): string | null {
  if (!emailLogoUrl?.trim()) return null;
  const s = emailLogoUrl.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return getDoPublicUrl(s);
}

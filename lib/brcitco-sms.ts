/**
 * رابط إرسال SMS عبر brcitco — منطق مطابق لـ `app/api/auth/send-otp/route.ts`
 * (مسار تسجيل الدخول بالـ OTP). يُستخدم من تواصل المستثمرين فقط هنا؛ لا تغيّر
 * الشكل دون مواءاة ذلك الملف إن رغبت بنفس السلوك في الدخول.
 */

export function cleanPhoneForSms(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function buildBrcitcoSmsUrl(phoneLocal: string, message: string): string {
  const user = process.env.SMS_USER || "966555544961";
  const pass = process.env.SMS_PASS || "Aa555544Bb";
  const sender = process.env.SMS_SENDER || "RawaesES";
  const base = (process.env.SMS_API_BASE || "https://www.brcitco-api.com/api/sendsms/").replace(
    /\/?$/,
    "/"
  );
  return `${base}?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&to=966${phoneLocal}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(sender)}`;
}

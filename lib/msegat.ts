/**
 * تكامل مسيجات (msegat.com) — إرسال الرسائل النصية ورموز التحقق.
 * التوثيق: https://documenter.getpostman.com/view/39158411/2sBY4LT3EY
 *
 * رموز الاستجابة المهمة:
 *   "1"    نجاح
 *   "400"  انتهت صلاحية رمز التحقق
 *   "404"  رمز التحقق غير موجود
 *   "1020" بيانات دخول غير صحيحة
 *   "1060" الرصيد غير كافٍ
 *   "1110" اسم المرسل ناقص أو غير صحيح
 *   "1120" رقم الجوال غير صحيح
 */

const API_BASE = (process.env.MSEGAT_API_BASE || "https://www.msegat.com/gw").replace(/\/+$/, "");

export type MsegatResult = {
  /** نجحت العملية (code === "1"). */
  ok: boolean;
  /** كود مسيجات كما رجع (نصاً). */
  code: string;
  message: string;
  /** معرّف طلب التحقق — يرجع من sendOTPCode ويُمرَّر إلى verifyOTPCode. */
  id?: string;
};

function credentials() {
  const userName = process.env.MSEGAT_USERNAME;
  const apiKey = process.env.MSEGAT_API_KEY;
  const userSender = process.env.MSEGAT_SENDER;
  if (!userName || !apiKey || !userSender) {
    throw new Error(
      "إعدادات مسيجات ناقصة: اضبط MSEGAT_USERNAME و MSEGAT_API_KEY و MSEGAT_SENDER في البيئة."
    );
  }
  return { userName, apiKey, userSender };
}

/**
 * يحوّل الجوال إلى صيغة مسيجات: 966 متبوعة بالرقم المحلي بلا أصفار بادئة.
 * يرجع "" إن لم يكن الرقم صالحاً.
 */
export function toMsegatNumber(phone: string): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("966")) digits = digits.slice(3);
  digits = digits.replace(/^0+/, "");
  return digits ? `966${digits}` : "";
}

async function post(endpoint: string, body: Record<string, unknown>): Promise<MsegatResult> {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", lang: "Ar" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text);
  } catch {
    // مسيجات قد ترجع نصاً عادياً عند أخطاء البوابة
    return { ok: false, code: String(res.status), message: text.slice(0, 300) };
  }

  const code = String(data.code ?? "");
  return {
    ok: code === "1",
    code,
    message: String(data.message ?? ""),
    id: data.id != null ? String(data.id) : undefined,
  };
}

/**
 * يطلب من مسيجات توليد رمز تحقق وإرساله للرقم.
 * الرمز نفسه لا يصلنا — نحتفظ بالـ id ونستخدمه في {@link verifyOtpCode}.
 */
export async function sendOtpCode(phone: string): Promise<MsegatResult> {
  const number = toMsegatNumber(phone);
  if (!number) return { ok: false, code: "1120", message: "رقم الجوال غير صحيح" };

  const { userName, apiKey, userSender } = credentials();
  return post("sendOTPCode.php", { userName, apiKey, userSender, number, lang: "Ar" });
}

/** يتحقق من الرمز الذي أدخله المستخدم مقابل الـ id الراجع من {@link sendOtpCode}. */
export async function verifyOtpCode(id: string, otp: string): Promise<MsegatResult> {
  const { userName, apiKey, userSender } = credentials();
  const numericId = Number(id);
  return post("verifyOTPCode.php", {
    userName,
    apiKey,
    userSender,
    id: Number.isNaN(numericId) ? id : numericId,
    code: otp,
    lang: "Ar",
  });
}

/** إرسال رسالة نصية عادية. `phones` أرقام بأي صيغة — تُطبَّع داخلياً. */
export async function sendSms(phones: string | string[], msg: string): Promise<MsegatResult> {
  const numbers = (Array.isArray(phones) ? phones : [phones])
    .map(toMsegatNumber)
    .filter(Boolean)
    .join(",");
  if (!numbers) return { ok: false, code: "1120", message: "رقم الجوال غير صحيح" };

  const { userName, apiKey, userSender } = credentials();
  return post("sendsms.php", { userName, apiKey, userSender, numbers, msg, msgEncoding: "UTF8" });
}

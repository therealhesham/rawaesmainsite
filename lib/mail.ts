import nodemailer from "nodemailer";

/**
 * إعداد البريد من .env أو من لوحة التحكم (smtpUser/smtpPass).
 * للبورت 465 استخدم MAIL_SECURE=true. من (from) يجب أن يطابق حساب المصادقة.
 */
function getTransporter(auth?: { user: string; pass: string }): ReturnType<typeof nodemailer.createTransport> | null {
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const secureEnv = process.env.MAIL_SECURE === "true";
  const user = (auth?.user ?? process.env.MAIL_USER)?.trim();
  const pass = auth?.pass ?? process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    const missing = [];
    if (!host) missing.push("MAIL_HOST");
    if (!user) missing.push("بريد الإرسال (من الأدمن أو MAIL_USER)");
    if (!pass) missing.push("كلمة المرور (من الأدمن أو MAIL_PASS)");
    console.warn("[Mail] لم يُضبط الإرسال — ناقص:", missing.join(", "));
    return null;
  }

  const portNum = port ? parseInt(port, 10) : 465;
  const secure = portNum === 465 || secureEnv;

  return nodemailer.createTransport({
    host,
    port: portNum,
    secure:true,
    auth: { user, pass },
    debug: process.env.MAIL_DEBUG === "true",
    logger: process.env.MAIL_DEBUG === "true",
  });
}

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** من لوحة التحكم: بريد الإرسال (SMTP) */
  smtpUser?: string;
  /** من لوحة التحكم: كلمة مرور بريد الإرسال */
  smtpPass?: string;
};

/**
 * إرسال بريد. إن وُجد smtpUser و smtpPass يُستخدمان، وإلا من .env.
 * from يجب أن يطابق حساب المصادقة (مثل الكود العامل hrdoc@rawaes.com).
 */
export async function sendMail(options: SendMailOptions): Promise<boolean> {
  const auth =
    options.smtpUser?.trim() && options.smtpPass
      ? { user: options.smtpUser.trim(), pass: options.smtpPass }
      : undefined;
  const transporter = getTransporter(auth);
  if (!transporter) {
    return false;
  }

  const from =
    process.env.MAIL_FROM ||
    options.smtpUser?.trim() ||
    process.env.MAIL_USER ||
    "noreply@site.com";

  try {
    await new Promise<void>((resolve, reject) => {
      transporter.verify((err: unknown) => {
        if (err) {
          console.error("[Mail] فشل التحقق من SMTP:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>"),
      replyTo: options.replyTo,
    });
    console.log("[Mail] تم الإرسال بنجاح إلى:", options.to);
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    const response = (err as { response?: string })?.response;
    if (code === "EAUTH" || (typeof response === "string" && response.includes("535"))) {
      console.error(
        "[Mail] 535 بيانات الدخول مرفوضة — تأكد من صحة البريد وكلمة المرور (.env أو لوحة التحكم). إذا كانت كلمة المرور تحتوي على رموز خاصة فضعها بين علامتي اقتباس في .env"
      );
    }
    console.error("[Mail] فشل الإرسال إلى", options.to, "—", err);
    return false;
  }
}

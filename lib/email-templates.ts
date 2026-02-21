/**
 * HTML email templates for contact and investment forms.
 * Inline-safe styles for broad client support (Gmail, Outlook, Apple Mail).
 * الشعارات تُقرأ مباشرة من مجلد public وتُضمّن في البريد (base64).
 */

import path from "path";
import fs from "fs";

/** قراءة ملف من public وإرجاع data URL للاستخدام في img src */
function getPublicLogoDataUrl(publicPath: string): string | null {
  try {
    const fullPath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (!fs.existsSync(fullPath)) return null;
    const buf = fs.readFileSync(fullPath);
    const base64 = buf.toString("base64");
    const ext = path.extname(publicPath).toLowerCase();
    const mime = ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "image/png";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

const BASE_STYLES = {
  wrapper: "margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI',Tahoma,Arial,sans-serif; -webkit-font-smoothing:antialiased;",
  container: "max-width:560px; margin:0 auto; padding:24px 16px;",
  card: "background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);",
  header: "background:linear-gradient(135deg, #002a3a 0%, #003d52 100%); padding:24px 28px; text-align:center;",
  headerLogo: "display:block; margin:0 auto 14px auto; height:48px; width:auto; max-width:180px;",
  headerTitle: "color:#ffffff; font-size:20px; font-weight:700; margin:0; letter-spacing:0.02em;",
  headerSub: "color:rgba(255,255,255,0.85); font-size:13px; margin:8px 0 0 0;",
  body: "padding:28px 28px 32px; direction:rtl; text-align:right;",
  label: "color:#002a3a; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 4px 0;",
  value: "color:#374151; font-size:15px; line-height:1.5; margin:0 0 18px 0;",
  valueLast: "color:#374151; font-size:15px; line-height:1.6; margin:0;",
  divider: "height:1px; background:#e5e7eb; margin:20px 0;",
  messageBox: "background:#f8fafc; border-right:4px solid #d4af79; padding:14px 16px; border-radius:0 8px 8px 0; margin:8px 0 0 0;",
  footer: "padding:24px 28px; background:linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-top:3px solid #d4af79; text-align:center; direction:rtl;",
  footerLogo: "display:block; margin:0 auto 12px auto; height:40px; width:auto; max-width:140px; opacity:0.9;",
  footerBrand: "color:#002a3a; font-size:15px; font-weight:700; margin:0 0 4px 0;",
  footerTagline: "color:#64748b; font-size:12px; margin:0 0 14px 0; line-height:1.5;",
  footerDivider: "height:1px; background:#e2e8f0; margin:14px 0; max-width:200px; margin-left:auto; margin-right:auto;",
  footerNote: "color:#64748b; font-size:11px; margin:0; line-height:1.6;",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ContactEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string | null;
};

export function buildContactEmail(data: ContactEmailData): { text: string; html: string } {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const text = [
    `رسالة جديدة من نموذج «تواصل معنا»`,
    ``,
    `الاسم: ${fullName}`,
    `البريد: ${data.email}`,
    `الجوال: ${data.phone ?? "—"}`,
    ``,
    `الرسالة:`,
    data.message ?? "—",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رسالة تواصل</title>
</head>
<body style="${BASE_STYLES.wrapper}">
  <div style="${BASE_STYLES.container}">
    <div style="${BASE_STYLES.card}">
      <div style="${BASE_STYLES.header}">
        <h1 style="${BASE_STYLES.headerTitle}">رسالة جديدة من الموقع</h1>
        <p style="${BASE_STYLES.headerSub}">نموذج تواصل معنا</p>
      </div>
      <div style="${BASE_STYLES.body}">
        <p style="${BASE_STYLES.label}">الاسم الكامل</p>
        <p style="${BASE_STYLES.value}">${esc(fullName)}</p>
        <p style="${BASE_STYLES.label}">البريد الإلكتروني</p>
        <p style="${BASE_STYLES.value}">${esc(data.email)}</p>
        <p style="${BASE_STYLES.label}">رقم الجوال</p>
        <p style="${BASE_STYLES.value}">${data.phone ? esc(data.phone) : "—"}</p>
        <div style="${BASE_STYLES.divider}"></div>
        <p style="${BASE_STYLES.label}">الرسالة</p>
        <div style="${BASE_STYLES.messageBox}">
          <p style="${BASE_STYLES.valueLast}">${data.message ? esc(data.message).replace(/\n/g, "<br>") : "—"}</p>
        </div>
      </div>
      ${buildFooter({
        note: "تم الإرسال من نموذج التواصل في الموقع · يمكنك الرد مباشرة على هذا البريد",
        logoUrl: getPublicLogoDataUrl("logo.png") ?? undefined,
        brandName: "مجموعة روائس",
        tagline: "شركة استثمارية متخصصة في حلول الاستثمار المبتكرة والمستدامة",
      })}
    </div>
  </div>
</body>
</html>`.trim();

  return { text, html };
}

function buildFooter(options: {
  note: string;
  logoUrl?: string;
  brandName?: string;
  tagline?: string;
}): string {
  const { note, logoUrl, brandName = "مجموعة روائس", tagline = "شركة استثمارية متخصصة في حلول الاستثمار المبتكرة والمستدامة" } = options;
  return `
      <div style="${BASE_STYLES.footer}">
        ${logoUrl ? `<img src="${logoUrl}" alt="${esc(brandName)}" style="${BASE_STYLES.footerLogo}" />` : ""}
        ${brandName ? `<p style="${BASE_STYLES.footerBrand}">${esc(brandName)}</p>` : ""}
        ${tagline ? `<p style="${BASE_STYLES.footerTagline}">${esc(tagline)}</p>` : ""}
        <div style="${BASE_STYLES.footerDivider}"></div>
        <p style="${BASE_STYLES.footerNote}">${esc(note)}</p>
      </div>`.trim();
}

export type InvestmentEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fund: string | null;
  amount: string | null;
  fundLabel: string;
  amountLabel: string;
};

export function buildInvestmentInterestEmail(data: InvestmentEmailData): {
  text: string;
  html: string;
} {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const text = [
    `طلب جديد من نموذج «سجل اهتمامك»`,
    ``,
    `الاسم: ${fullName}`,
    `البريد: ${data.email}`,
    `الجوال: ${data.phone}`,
    `الصندوق: ${data.fundLabel}`,
    `نطاق الاستثمار: ${data.amountLabel}`,
  ].join("\n");

  const investmentLogoDataUrl = getPublicLogoDataUrl("investmentlogo.png");

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب سجل اهتمام</title>
</head>
<body style="${BASE_STYLES.wrapper}">
  <div style="${BASE_STYLES.container}">
    <div style="${BASE_STYLES.card}">
      <div style="${BASE_STYLES.header}">
        ${investmentLogoDataUrl ? `<img src="${investmentLogoDataUrl}" alt="روائس للاستثمار" style="${BASE_STYLES.headerLogo}" />` : ""}
        <h1 style="${BASE_STYLES.headerTitle}">طلب جديد — سجل الاهتمام بالاستثمار</h1>
        <p style="${BASE_STYLES.headerSub}">نموذج سجل اهتمامك</p>
      </div>
      <div style="${BASE_STYLES.body}">
        <p style="${BASE_STYLES.label}">الاسم الكامل</p>
        <p style="${BASE_STYLES.value}">${esc(fullName)}</p>
        <p style="${BASE_STYLES.label}">البريد الإلكتروني</p>
        <p style="${BASE_STYLES.value}">${esc(data.email)}</p>
        <p style="${BASE_STYLES.label}">رقم الجوال</p>
        <p style="${BASE_STYLES.value}">${esc(data.phone)}</p>
        <div style="${BASE_STYLES.divider}"></div>
        <p style="${BASE_STYLES.label}">الصندوق المهتم به</p>
        <p style="${BASE_STYLES.value}">${esc(data.fundLabel)}</p>
        <p style="${BASE_STYLES.label}">نطاق الاستثمار</p>
        <p style="${BASE_STYLES.valueLast}">${esc(data.amountLabel)}</p>
      </div>
      ${buildFooter({
        note: "تم الإرسال من صفحة الاستثمار · يمكنك الرد مباشرة على هذا البريد",
        logoUrl: investmentLogoDataUrl ?? undefined,
        brandName: "روائس للاستثمار",
        tagline: "فرص استثمارية متنوعة في صناديق الضيافة والاستقدام والمركبات",
      })}
    </div>
  </div>
</body>
</html>`.trim();

  return { text, html };
}

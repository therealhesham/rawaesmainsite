/**
 * استبدال placeholders في قوالب التواصل مع المستثمرين.
 * - {{name}} أو {{ name }} — اسم المستثمر كما هو مسجل
 * - {{اسم}} — نفس المعنى (بديل عربي)
 */
export function applyInvestorNamePlaceholders(text: string, investorName: string): string {
  const safe = investorName.trim() || "—";
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, safe)
    .replace(/\{\{\s*اسم\s*\}\}/g, safe);
}

export function messageContainsNamePlaceholder(subject: string, body: string): boolean {
  const s = `${subject}\n${body}`;
  return /\{\{\s*name\s*\}\}/i.test(s) || /\{\{\s*اسم\s*\}\}/.test(s);
}

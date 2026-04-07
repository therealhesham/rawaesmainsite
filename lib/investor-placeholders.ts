/**
 * استبدال placeholder اسم المستثمر — الصيغة الوحيدة: {{name}}
 */
export function applyInvestorNamePlaceholders(text: string, investorName: string): string {
  const safe = investorName.trim() || "—";
  return text.replace(/\{\{\s*name\s*\}\}/gi, safe);
}

export function messageContainsNamePlaceholder(subject: string, body: string): boolean {
  return /\{\{\s*name\s*\}\}/i.test(`${subject}\n${body}`);
}

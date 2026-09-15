export function toEnglishNumbers(str: string) {
  return str.replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
}

export function hasPersian(text: string) {
  return /[؀-ۿ]/.test(text);
}

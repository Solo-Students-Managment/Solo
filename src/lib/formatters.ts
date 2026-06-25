const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)] ?? digit);
}

export function formatPersianDate(isoDate: string) {
  const date = new Date(isoDate);
  const formatted = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return toPersianDigits(formatted);
}

export function formatPersianDateTime(isoDate: string) {
  const date = new Date(isoDate);
  const formatted = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return toPersianDigits(formatted);
}

export function formatScore(score: number) {
  return `${toPersianDigits(score.toFixed(1))}/۲۰`;
}

export function formatPercent(value: number) {
  return `${toPersianDigits(value)}٪`;
}

export function formatNumber(value: number) {
  return toPersianDigits(value);
}

export function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${toPersianDigits(formatted)} تومان`;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectBrand(value: string): CardBrand {
  const digits = digitsOnly(value);
  if (/^3[47]/.test(digits)) return "amex";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "unknown";
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value);
  const brand = detectBrand(digits);
  const max = brand === "amex" ? 15 : 16;
  const cut = digits.slice(0, max);
  if (brand === "amex") {
    return [cut.slice(0, 4), cut.slice(4, 10), cut.slice(10, 15)].filter(Boolean).join(" ");
  }
  return cut.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function luhnOk(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = digits.charCodeAt(i) - 48;
    if (n < 0 || n > 9) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function expiryOk(value: string, now = new Date()): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 1);
  return end > now;
}

export function cvcOk(value: string, brand: CardBrand): boolean {
  const digits = digitsOnly(value);
  if (brand === "amex") return digits.length === 4;
  if (brand === "unknown") return digits.length === 3 || digits.length === 4;
  return digits.length === 3;
}

export function expectedCardLength(brand: CardBrand): number {
  return brand === "amex" ? 15 : 16;
}

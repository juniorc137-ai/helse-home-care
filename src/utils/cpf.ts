/**
 * Validação de CPF pelo algoritmo padrão de dígitos verificadores
 * (módulo 11). Validação administrativa de identidade, não uma norma
 * clínica — não sujeita à regra de integridade referencial da seção 7.
 */

function calculateCheckDigit(base: string): number {
  let sum = 0;
  let weight = base.length + 1;
  for (const char of base) {
    sum += parseInt(char, 10) * weight;
    weight--;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCPF(rawValue: string): boolean {
  const digits = onlyDigits(rawValue);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos os dígitos iguais

  const base9 = digits.slice(0, 9);
  const digit1 = calculateCheckDigit(base9);
  const digit2 = calculateCheckDigit(base9 + digit1);

  return digits === `${base9}${digit1}${digit2}`;
}

export function formatCPF(rawValue: string): string {
  const digits = onlyDigits(rawValue).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

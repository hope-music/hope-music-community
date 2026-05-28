// Shared verification code store
// In production, use Redis or a database for persistence

interface VerificationEntry {
  code: string;
  expiresAt: number;
}

// Use a Map for temporary storage
// Note: This resets when the server restarts
const verificationCodes = new Map<string, VerificationEntry>();

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeVerificationCode(email: string, code: string, expiresInMinutes: number = 10): void {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  verificationCodes.set(email.toLowerCase(), { code, expiresAt });
}

export function getVerificationCode(email: string): VerificationEntry | undefined {
  return verificationCodes.get(email.toLowerCase());
}

export function deleteVerificationCode(email: string): void {
  verificationCodes.delete(email.toLowerCase());
}

export function isCodeValid(email: string, code: string): boolean {
  const entry = verificationCodes.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email.toLowerCase());
    return false;
  }
  return entry.code === code;
}

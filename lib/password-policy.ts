export interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'An uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'A lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'A number (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'A special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw) },
];

export function validatePassword(pw: string): { valid: boolean; failed: string[] } {
  const failed = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.label);
  return { valid: failed.length === 0, failed };
}

export function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  const score = Math.round((passed / PASSWORD_RULES.length) * 100);
  if (score < 40) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score < 80) return { score, label: 'Fair', color: 'bg-chart-3' };
  if (score < 100) return { score, label: 'Good', color: 'bg-chart-2' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

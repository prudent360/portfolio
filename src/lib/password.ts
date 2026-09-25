export const MIN_PASSWORD_LENGTH = 12;

/** Returns a problem with an admin password, or null if it is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (/^(.)\1+$/.test(password)) return "ADMIN_PASSWORD must not repeat a single character.";
  return null;
}

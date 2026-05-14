// Validation Utilities
// Common validation functions for forms

// Email validation regex (simplified but effective)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Validate required field
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

// Validate minimum length
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

// Validate maximum length
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

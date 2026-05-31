// Professional email regex pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  email = email.trim().toLowerCase();

  // Check basic format
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  // Check length (max 254 characters per RFC 5321)
  if (email.length > 254) {
    return { valid: false, message: 'Email is too long' };
  }

  // Check local part length (before @)
  const [localPart] = email.split('@');
  if (localPart.length > 64) {
    return { valid: false, message: 'Email local part is too long' };
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return { valid: false, message: 'Email cannot contain consecutive dots' };
  }

  // Check if starts/ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, message: 'Email local part cannot start or end with a dot' };
  }

  return { valid: true, message: 'Valid email' };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' };
  }

  return { valid: true, message: 'Valid password' };
};

export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }

  name = name.trim();

  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { valid: false, message: 'Name is too long' };
  }

  return { valid: true, message: 'Valid name' };
};

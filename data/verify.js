
import xss from 'xss';

export const validateString = (str, fieldName) => {
  if (!str || typeof str !== 'string' || str.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return str.trim();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email.toLowerCase().trim();
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return password;
};

export const sanitizeInput = (input) => {
  return xss(input);
};

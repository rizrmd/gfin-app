import type { ValidationRule, ValidationErrors } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const ALPHA_REGEX = /^[a-zA-Z]+$/;
const ALPHA_NUM_REGEX = /^[a-zA-Z0-9]+$/;
const NUMERIC_REGEX = /^[0-9]+$/;

export const validateField = (value: any, rules: ValidationRule | ValidationRule[]): string[] => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  const errors: string[] = [];

  for (const rule of ruleArray) {
    // Handle required
    if (rule === 'required') {
      if (value === undefined || value === null || value === '') {
        errors.push('This field is required');
      }
      continue;
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Handle other rules
    switch (rule) {
      case 'email':
        if (!EMAIL_REGEX.test(value)) {
          errors.push('Invalid email address');
        }
        break;

      case 'url':
        if (!URL_REGEX.test(value)) {
          errors.push('Invalid URL');
        }
        break;

      case 'alpha':
        if (!ALPHA_REGEX.test(value)) {
          errors.push('Must contain only letters');
        }
        break;

      case 'alpha_num':
        if (!ALPHA_NUM_REGEX.test(value)) {
          errors.push('Must contain only letters and numbers');
        }
        break;

      case 'numeric':
        if (!NUMERIC_REGEX.test(value)) {
          errors.push('Must be numeric');
        }
        break;

      case 'integer':
        if (!Number.isInteger(Number(value))) {
          errors.push('Must be an integer');
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Must be a boolean');
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push('Must be an array');
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
        }
        break;

      case 'date':
        if (isNaN(Date.parse(value))) {
          errors.push('Must be a valid date');
        }
        break;

      default:
        // Handle parameterized rules
        if (typeof rule === 'string') {
          if (rule.startsWith('min:')) {
            const min = parseInt(rule.split(':')[1]);
            if (typeof value === 'string' && value.length < min) {
              errors.push(`Must be at least ${min} characters`);
            } else if (typeof value === 'number' && value < min) {
              errors.push(`Must be at least ${min}`);
            }
          }
          else if (rule.startsWith('max:')) {
            const max = parseInt(rule.split(':')[1]);
            if (typeof value === 'string' && value.length > max) {
              errors.push(`Must be at most ${max} characters`);
            } else if (typeof value === 'number' && value > max) {
              errors.push(`Must be at most ${max}`);
            }
          }
          else if (rule.startsWith('between:')) {
            const [min, max] = rule.split(':')[1].split(',').map(Number);
            if (typeof value === 'number' && (value < min || value > max)) {
              errors.push(`Must be between ${min} and ${max}`);
            }
          }
          else if (rule.startsWith('size:')) {
            const size = parseInt(rule.split(':')[1]);
            if (typeof value === 'string' && value.length !== size) {
              errors.push(`Must be exactly ${size} characters`);
            } else if (Array.isArray(value) && value.length !== size) {
              errors.push(`Must contain exactly ${size} items`);
            }
          }
          else if (rule.startsWith('regex:')) {
            const pattern = rule.split(':')[1];
            try {
              const regex = new RegExp(pattern);
              if (!regex.test(value)) {
                errors.push('Invalid format');
              }
            } catch (e) {
              console.error('Invalid regex pattern:', pattern);
            }
          }
          else if (rule.startsWith('before:')) {
            const date = new Date(rule.split(':')[1]);
            if (new Date(value) >= date) {
              errors.push(`Must be before ${date.toLocaleDateString()}`);
            }
          }
          else if (rule.startsWith('after:')) {
            const date = new Date(rule.split(':')[1]);
            if (new Date(value) <= date) {
              errors.push(`Must be after ${date.toLocaleDateString()}`);
            }
          }
        }
    }
  }

  return errors;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  validator: Record<string, ValidationRule | ValidationRule[]>
): ValidationErrors<T> => {
  const errors: ValidationErrors<T> = {};

  for (const [field, rules] of Object.entries(validator)) {
    // Handle nested fields using dot notation
    const value = field.split('.').reduce((obj, key) => obj?.[key], data);
    const fieldErrors = validateField(value, rules);
    
    if (fieldErrors.length > 0) {
      errors[field as keyof typeof errors] = fieldErrors;
    }
  }

  return errors;
};

export const hasErrors = (errors: ValidationErrors<any>): boolean => {
  return Object.keys(errors).length > 0;
};

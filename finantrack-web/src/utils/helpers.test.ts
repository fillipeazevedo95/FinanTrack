import {
  formatCurrency,
  formatDate,
  truncateText,
  capitalize,
  isValidEmail,
  generateId,
  deepClone,
  isEmpty
} from './helpers';

describe('formatCurrency', () => {
  test('should format positive numbers', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
    expect(result).toContain('R$');
  });

  test('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });

  test('should format negative numbers', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('100,00');
    expect(result).toContain('R$');
  });
});

describe('formatDate', () => {
  test('should handle invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('Data inválida');
    expect(formatDate(null as any)).toBe('Data inválida');
  });

  test('should format valid dates', () => {
    const result = formatDate('2024-01-01');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('truncateText', () => {
  test('should not truncate short text', () => {
    const shortText = 'Short text';
    expect(truncateText(shortText, 20)).toBe('Short text');
  });

  test('should truncate long text', () => {
    const longText = 'This is a very long text that should be truncated';
    const result = truncateText(longText, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toContain('...');
  });

  test('should handle custom suffix', () => {
    const longText = 'This is a very long text';
    const result = truncateText(longText, 15, ' [...]');
    expect(result).toContain('[...]');
  });
});

describe('capitalize', () => {
  test('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('javaScript')).toBe('Javascript');
  });

  test('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null as any)).toBe(null);
  });
});

describe('isValidEmail', () => {
  test('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  test('should reject invalid emails', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('generateId', () => {
  test('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('deepClone', () => {
  test('should clone objects', () => {
    const original = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.hobbies).not.toBe(original.hobbies);
  });

  test('should clone arrays', () => {
    const original = [1, 2, { a: 3 }];
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[2]).not.toBe(original[2]);
  });
});

describe('isEmpty', () => {
  test('should detect empty values', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  test('should detect non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty({ name: 'John' })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

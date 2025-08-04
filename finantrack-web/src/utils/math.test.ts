// Testes básicos de matemática e JavaScript

export {}; // Torna este arquivo um módulo

describe('Basic Math Functions', () => {
  test('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 5).toBe(15);
    expect(-5 + 3).toBe(-2);
  });

  test('should multiply numbers correctly', () => {
    expect(3 * 4).toBe(12);
    expect(7 * 8).toBe(56);
    expect(0 * 100).toBe(0);
  });

  test('should divide numbers correctly', () => {
    expect(10 / 2).toBe(5);
    expect(15 / 3).toBe(5);
    expect(7 / 2).toBe(3.5);
  });

  test('should handle decimal operations', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    expect(1.5 * 2).toBe(3);
    expect(5.5 - 2.2).toBeCloseTo(3.3);
  });
});

describe('String Operations', () => {
  test('should concatenate strings', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
    expect(`Hello ${'World'}`).toBe('Hello World');
  });

  test('should handle string methods', () => {
    const text = 'JavaScript';
    expect(text.length).toBe(10);
    expect(text.toUpperCase()).toBe('JAVASCRIPT');
    expect(text.toLowerCase()).toBe('javascript');
  });

  test('should check string includes', () => {
    const text = 'React Testing Library';
    expect(text.includes('React')).toBe(true);
    expect(text.includes('Vue')).toBe(false);
  });
});

describe('Array Operations', () => {
  test('should work with arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr[0]).toBe(1);
    expect(arr[arr.length - 1]).toBe(5);
  });

  test('should filter arrays', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const evenNumbers = numbers.filter(n => n % 2 === 0);
    expect(evenNumbers).toEqual([2, 4, 6]);
  });

  test('should map arrays', () => {
    const numbers = [1, 2, 3];
    const doubled = numbers.map(n => n * 2);
    expect(doubled).toEqual([2, 4, 6]);
  });

  test('should reduce arrays', () => {
    const numbers = [1, 2, 3, 4];
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    expect(sum).toBe(10);
  });
});

describe('Object Operations', () => {
  test('should work with objects', () => {
    const user = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    };

    expect(user.name).toBe('John Doe');
    expect(user.age).toBe(30);
    expect(Object.keys(user)).toEqual(['name', 'age', 'email']);
  });

  test('should handle object destructuring', () => {
    const person = { name: 'Alice', age: 25 };
    const { name, age } = person;
    
    expect(name).toBe('Alice');
    expect(age).toBe(25);
  });

  test('should merge objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    const merged = { ...obj1, ...obj2 };
    
    expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });
});

describe('Date Operations', () => {
  test('should work with dates', () => {
    const date = new Date('2024-01-01T12:00:00Z'); // Usar UTC para evitar problemas de timezone
    expect(date.getUTCFullYear()).toBe(2024);
    expect(date.getUTCMonth()).toBe(0); // Janeiro é 0
  });

  test('should format dates', () => {
    const date = new Date(2024, 0, 15); // Usar construtor com parâmetros para evitar timezone
    const formatted = date.toLocaleDateString('pt-BR');
    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2024');
  });
});

describe('Promise Operations', () => {
  test('should resolve promises', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  test('should handle async functions', async () => {
    const asyncFunction = async () => {
      return 'async result';
    };

    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});

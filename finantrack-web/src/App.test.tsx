import React from 'react';
import { render } from '@testing-library/react';

// Componente simples para teste
const SimpleComponent: React.FC = () => {
  return (
    <div data-testid="simple-component">
      <h1>FinanTrack</h1>
      <p>Sistema de Controle Financeiro</p>
    </div>
  );
};

describe('Simple Component Test', () => {
  test('renders simple component', () => {
    const { getByTestId } = render(<SimpleComponent />);
    const component = getByTestId('simple-component');
    expect(component).toBeInTheDocument();
  });

  test('contains expected text', () => {
    const { getByText } = render(<SimpleComponent />);
    expect(getByText('FinanTrack')).toBeInTheDocument();
    expect(getByText('Sistema de Controle Financeiro')).toBeInTheDocument();
  });
});

// Testes básicos de JavaScript
describe('Basic JavaScript Tests', () => {
  test('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 5).toBe(15);
  });

  test('should work with strings', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
  });

  test('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });

  test('should work with objects', () => {
    const obj = { name: 'Test', value: 42 };
    expect(obj.name).toBe('Test');
    expect(obj.value).toBe(42);
  });
});

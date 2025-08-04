import React from 'react';

interface BarData {
  label: string;
  income: number;
  expense: number;
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, height = 120 }) => {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  // Encontrar valor máximo para escala
  const maxValue = Math.max(
    ...data.flatMap(item => [item.income, item.expense])
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      {/* Gráfico */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '12px', 
          height: height,
          padding: '10px 0',
          marginBottom: '15px'
        }}
      >
        {data.map((item, index) => {
          const incomeHeight = maxValue > 0 ? (item.income / maxValue) * (height - 40) : 0;
          const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * (height - 40) : 0;
          
          return (
            <div 
              key={index}
              style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {/* Barras */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                {/* Barra de receita */}
                <div
                  style={{
                    width: '16px',
                    height: `${incomeHeight}px`,
                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    borderRadius: '2px 2px 0 0',
                    minHeight: item.income > 0 ? '4px' : '0',
                    position: 'relative'
                  }}
                  title={`Receita: ${formatCurrency(item.income)}`}
                />
                
                {/* Barra de despesa */}
                <div
                  style={{
                    width: '16px',
                    height: `${expenseHeight}px`,
                    background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '2px 2px 0 0',
                    minHeight: item.expense > 0 ? '4px' : '0',
                    position: 'relative'
                  }}
                  title={`Despesa: ${formatCurrency(item.expense)}`}
                />
              </div>
              
              {/* Label */}
              <div 
                style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div 
            style={{
              width: '12px',
              height: '12px',
              background: '#10b981',
              borderRadius: '2px'
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Receitas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div 
            style={{
              width: '12px',
              height: '12px',
              background: '#ef4444',
              borderRadius: '2px'
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Despesas</span>
        </div>
      </div>
    </div>
  );
};

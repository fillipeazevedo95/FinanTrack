import React from 'react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

interface DonutChartProps {
  data: CategoryData[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div 
          style={{
            width: size,
            height: size,
            margin: '0 auto 15px',
            borderRadius: '50%',
            background: 'conic-gradient(#e5e7eb 0% 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#9ca3af'
          }}
        >
          📊
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  // Calcular percentuais e criar gradiente
  let currentPercentage = 0;
  const gradientStops = data.map(item => {
    const percentage = (item.value / total) * 100;
    const start = currentPercentage;
    const end = currentPercentage + percentage;
    currentPercentage = end;
    
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Gráfico Donut */}
      <div 
        style={{
          width: size,
          height: size,
          margin: '0 auto 15px',
          borderRadius: '50%',
          background: `conic-gradient(${gradientStops})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Centro do donut */}
        <div 
          style={{
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}
        >
          {data.length}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '4px',
                borderRadius: '4px',
                background: 'var(--bg-primary)'
              }}
            >
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.7rem' }}>
                {item.icon} {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

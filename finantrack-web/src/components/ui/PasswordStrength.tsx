import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'Pelo menos 8 caracteres',
    test: (password) => password.length >= 8
  },
  {
    label: 'Uma letra minúscula',
    test: (password) => /(?=.*[a-z])/.test(password)
  },
  {
    label: 'Uma letra maiúscula',
    test: (password) => /(?=.*[A-Z])/.test(password)
  },
  {
    label: 'Um número',
    test: (password) => /(?=.*\d)/.test(password)
  },
  {
    label: 'Um caractere especial',
    test: (password) => /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)
  }
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  showRequirements = true 
}) => {
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    const passedRequirements = requirements.filter(req => req.test(password)).length;
    
    const strengthLevels = [
      { min: 0, label: 'Muito fraca', color: 'bg-red-500', textColor: 'text-red-600' },
      { min: 1, label: 'Fraca', color: 'bg-red-400', textColor: 'text-red-600' },
      { min: 2, label: 'Regular', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      { min: 3, label: 'Boa', color: 'bg-blue-500', textColor: 'text-blue-600' },
      { min: 4, label: 'Forte', color: 'bg-green-500', textColor: 'text-green-600' },
      { min: 5, label: 'Muito forte', color: 'bg-green-600', textColor: 'text-green-700' }
    ];
    
    const currentLevel = strengthLevels.reverse().find(level => passedRequirements >= level.min) ?? strengthLevels[0]!;
    
    return {
      strength: passedRequirements,
      label: currentLevel.label,
      color: currentLevel.color,
      textColor: currentLevel.textColor,
      percentage: (passedRequirements / requirements.length) * 100
    };
  };

  const strengthInfo = getPasswordStrength();

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Força da senha:</span>
          <span className={`font-medium ${strengthInfo.textColor}`}>
            {strengthInfo.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
            style={{ width: `${strengthInfo.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Requisitos da senha:
          </h4>
          <ul className="space-y-1">
            {requirements.map((requirement, index) => {
              const isPassed = requirement.test(password);
              return (
                <li
                  key={index}
                  className={`flex items-center text-xs transition-colors ${
                    isPassed ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                    isPassed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isPassed ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  {requirement.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export const validatePassword = (password: string): string | true => {
  if (!password) return 'Senha é obrigatória';
  
  const failedRequirements = requirements.filter(req => !req.test(password));
  
  if (failedRequirements.length > 0) {
    return `A senha deve atender aos seguintes requisitos: ${failedRequirements.map(req => req.label.toLowerCase()).join(', ')}`;
  }
  
  return true;
};

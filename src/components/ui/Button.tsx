'use client';
import { CSSProperties, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  fullWidth = false,
  disabled = false 
}: ButtonProps) {
  const styles: { [key: string]: CSSProperties } = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    secondary: {
      background: '#f3f4f6',
      color: '#374151',
    },
    danger: {
      background: '#fee2e2',
      color: '#dc2626',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '0.875rem',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.opacity = '0.9';
          if (variant === 'secondary') e.currentTarget.style.background = '#e5e7eb';
          if (variant === 'danger') e.currentTarget.style.background = '#fecaca';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.opacity = '1';
          if (variant === 'secondary') e.currentTarget.style.background = '#f3f4f6';
          if (variant === 'danger') e.currentTarget.style.background = '#fee2e2';
        }
      }}
    >
      {children}
    </button>
  );
}

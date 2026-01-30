'use client';

interface InputProps {
  type?: 'text' | 'number';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
  error = false,
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => {
        onFocus?.();
        e.target.style.borderColor = '#667eea';
      }}
      onBlur={(e) => {
        onBlur?.();
        e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
      }}
      placeholder={placeholder}
      disabled={disabled}
      min={type === 'number' ? '0' : undefined}
      step={type === 'number' ? '1' : undefined}
      style={{
        
        padding: '0.75rem',
        border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}

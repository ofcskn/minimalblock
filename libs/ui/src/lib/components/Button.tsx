import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
  secondary: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 disabled:opacity-50',
  ghost: 'text-gray-600 hover:bg-gray-100 disabled:opacity-40',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

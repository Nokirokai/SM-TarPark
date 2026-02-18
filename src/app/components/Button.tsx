import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm hover:shadow-md',
    secondary: 'border-2 border-primary text-primary hover:bg-secondary active:scale-95',
    danger: 'bg-destructive text-destructive-foreground hover:opacity-90 active:scale-95 shadow-sm hover:shadow-md',
    success: 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95 shadow-sm hover:shadow-md'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

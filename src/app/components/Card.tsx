import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'occupied' | 'available' | 'violation';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    occupied: 'bg-destructive/10 border-destructive/30',
    available: 'bg-accent/10 border-accent/30',
    violation: 'bg-yellow-500/10 border-yellow-500/30'
  };

  return (
    <div className={`rounded-xl shadow-md border border-border p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-primary/10 text-primary border-primary/20',
    green: 'bg-accent/10 text-accent border-accent/20',
    red: 'bg-destructive/10 text-destructive border-destructive/20',
    yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1 font-semibold">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-semibold ${trend.isPositive ? 'text-accent' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg border ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  className = '' 
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500/10 to-blue-600/5',
      icon: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/20'
    },
    green: {
      bg: 'from-green-500/10 to-green-600/5',
      icon: 'text-green-500 bg-green-500/10 border-green-500/20',
      glow: 'group-hover:shadow-green-500/20'
    },
    yellow: {
      bg: 'from-yellow-500/10 to-yellow-600/5',
      icon: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      glow: 'group-hover:shadow-yellow-500/20'
    },
    red: {
      bg: 'from-red-500/10 to-red-600/5',
      icon: 'text-red-500 bg-red-500/10 border-red-500/20',
      glow: 'group-hover:shadow-red-500/20'
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-600/5',
      icon: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/20'
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      icon: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group relative bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl ${colors.glow} transition-all overflow-hidden ${className}`}
    >
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} rounded-full blur-2xl opacity-50`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon} border`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              trend.isPositive 
                ? 'text-green-600 bg-green-500/10 border border-green-500/20' 
                : 'text-red-600 bg-red-500/10 border border-red-500/20'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide mb-2">
          {title}
        </h3>
        <p className="text-3xl font-black text-foreground tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

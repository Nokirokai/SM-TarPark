import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "occupied" | "available" | "violation";
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = "default", className = "", onClick }: CardProps) {
  const variantClasses = {
    default: "bg-white",
    occupied: "bg-red-50 border-red-200",
    available: "bg-green-50 border-green-200",
    violation: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      className={`rounded-xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg ${variantClasses[variant]} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "danger" | "warning";
}

export function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  const variantColors = {
    default: "bg-blue-800",
    success: "bg-green-600",
    danger: "bg-red-600",
    warning: "bg-yellow-600",
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`${variantColors[variant]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

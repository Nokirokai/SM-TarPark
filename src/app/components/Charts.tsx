import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Occupancy Trend Chart
interface OccupancyTrendProps {
  data?: Array<{ time: string; occupancy: number }>;
}

export function OccupancyTrendChart({ data }: OccupancyTrendProps) {
  const defaultData = [
    { time: "Mon", occupancy: 45 },
    { time: "Tue", occupancy: 52 },
    { time: "Wed", occupancy: 61 },
    { time: "Thu", occupancy: 58 },
    { time: "Fri", occupancy: 75 },
    { time: "Sat", occupancy: 82 },
    { time: "Sun", occupancy: 68 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data || defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="occupancy"
          stroke="#1E40AF"
          strokeWidth={2}
          dot={{ fill: "#1E40AF" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Hourly Peaks Chart
interface HourlyPeaksProps {
  data?: Array<{ hour: string; vehicles: number }>;
}

export function HourlyPeaksChart({ data }: HourlyPeaksProps) {
  const defaultData = [
    { hour: "6AM", vehicles: 45 },
    { hour: "9AM", vehicles: 120 },
    { hour: "12PM", vehicles: 180 },
    { hour: "3PM", vehicles: 150 },
    { hour: "6PM", vehicles: 200 },
    { hour: "9PM", vehicles: 90 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data || defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="vehicles" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Zone Usage Chart
interface ZoneUsageProps {
  data?: Array<{ zone: string; value: number }>;
}

export function ZoneUsageChart({ data }: ZoneUsageProps) {
  const defaultData = [
    { zone: "Zone A", value: 85 },
    { zone: "Zone B", value: 72 },
    { zone: "Zone C", value: 68 },
    { zone: "Zone D", value: 90 },
    { zone: "Zone E", value: 55 },
    { zone: "Zone F", value: 78 },
  ];

  const COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data || defaultData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ zone, value }) => `${zone}: ${value}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {(data || defaultData).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Revenue Chart
interface RevenueChartProps {
  data?: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const defaultData = [
    { date: "Week 1", revenue: 45000 },
    { date: "Week 2", revenue: 52000 },
    { date: "Week 3", revenue: 48000 },
    { date: "Week 4", revenue: 61000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data || defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: "#10B981" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Violations Chart
interface ViolationsChartProps {
  data?: Array<{ type: string; count: number }>;
}

export function ViolationsChart({ data }: ViolationsChartProps) {
  const defaultData = [
    { type: "Overstay", count: 45 },
    { type: "No Payment", count: 28 },
    { type: "Wrong Zone", count: 15 },
    { type: "Expired Ticket", count: 12 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data || defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Credit Score Gauge
interface CreditScoreGaugeProps {
  score: number;
}

export function CreditScoreGauge({ score }: CreditScoreGaugeProps) {
  const getColor = () => {
    if (score >= 0) return "#10B981";
    if (score >= -20) return "#F59E0B";
    return "#EF4444";
  };

  const percentage = Math.max(0, Math.min(100, ((score + 50) / 50) * 100));

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="20"
          />
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor()}
            strokeWidth="20"
            strokeDasharray={`${percentage * 5.03} 503`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: getColor() }}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground font-semibold">Credit Score</span>
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground font-semibold">
        {score >= 0 ? "Good Standing" : score >= -20 ? "Warning" : "Blocked"}
      </div>
    </div>
  );
}
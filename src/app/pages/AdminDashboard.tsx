import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, DollarSign, Users, 
  Download, Calendar, Brain, Activity 
} from 'lucide-react';
import { weeklyTrend, zoneUsage, violationTypes, peakPrediction } from '../data/mockData';
import { useParkingSlots, useDashboardStats, useVehicles, useViolations } from '../../hooks/useData';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');
  
  // Real-time data hooks
  const { slots, refetch: refetchSlots } = useParkingSlots();
  const { stats, refetch: refetchStats } = useDashboardStats();
  const { vehicles, refetch: refetchVehicles } = useVehicles();
  const { violations, refetch: refetchViolations } = useViolations();

  // Auto-refresh data every 3 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Admin Dashboard: Auto-refreshing data at', new Date().toISOString());
      refetchSlots();
      refetchStats();
      refetchVehicles();
      refetchViolations();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetchSlots, refetchStats, refetchVehicles, refetchViolations]);

  // Calculate real-time metrics
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const totalSlots = slots.length || 600;
  const occupancyPercentage = Math.round((occupiedCount / totalSlots) * 100);
  const activeViolations = violations.filter(v => v.status === 'active').length;
  
  // Calculate total revenue from vehicles (₱25/hour)
  const totalRevenue = vehicles.reduce((sum, vehicle) => {
    if (vehicle.exitTime && vehicle.entryTime) {
      const hours = Math.ceil((new Date(vehicle.exitTime).getTime() - new Date(vehicle.entryTime).getTime()) / (1000 * 60 * 60));
      return sum + (hours * 25);
    }
    return sum;
  }, 0);

  const exportReport = () => {
    // Generate report data
    const reportData = {
      dateRange,
      totalRevenue: `₱${totalRevenue.toLocaleString()}`,
      totalVehicles: `${vehicles.length}`,
      avgOccupancy: `${occupancyPercentage}%`,
      activeViolations: `${activeViolations}`,
      timestamp: new Date().toISOString()
    };
    
    // Create CSV content
    const csvContent = `SM TarPark Report - ${dateRange}\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `Total Revenue,₱${totalRevenue.toLocaleString()}\n` +
      `Total Vehicles,${vehicles.length}\n` +
      `Average Occupancy,${occupancyPercentage}%\n` +
      `Active Violations,${activeViolations}\n\n` +
      `Weekly Trend:\n` +
      `Day,Occupied Slots,Revenue\n` +
      weeklyTrend.map(d => `${d.day},${d.occupied},₱${d.revenue}`).join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SM-TarPark-Report-${dateRange}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-semibold">Comprehensive analytics and system management</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Vehicles"
          value={`${vehicles.length}`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg Occupancy"
          value={`${occupancyPercentage}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="yellow"
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Active Violations"
          value={`${activeViolations}`}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          trend={{ value: 15, isPositive: false }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Weekly Occupancy Trend</h2>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="occupied" 
                stroke="#1E40AF" 
                strokeWidth={3}
                name="Occupied Slots"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Weekly Revenue</h2>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue (₱)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Usage */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Parking Zone Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={zoneUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Violation Types */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Violation Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violationTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="type" width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Count">
                {violationTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ML Prediction */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">AI Peak Prediction (Next 24h)</h2>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
            ML Model
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Machine learning forecast based on historical patterns, events, and weather data
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={peakPrediction}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Vehicles', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Actual"
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Next Peak</p>
            <p className="text-lg font-bold text-purple-800">12:00 PM</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Expected Load</p>
            <p className="text-lg font-bold text-blue-800">96%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-lg font-bold text-green-800">94.5%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-lg font-bold text-yellow-800">High</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Staff Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Toll Personnel</span>
              <span className="font-semibold text-blue-800">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Actions Today</span>
              <span className="font-semibold">342</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-semibold text-green-600">2.3 min</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Credit Scores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Score</span>
              <span className="font-semibold text-yellow-600">-5.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blocked Vehicles</span>
              <span className="font-semibold text-red-600">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Good Standing</span>
              <span className="font-semibold text-green-600">1,824</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unpaid Violations</span>
              <span className="font-semibold text-red-600">₱24,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payments</span>
              <span className="font-semibold text-yellow-600">₱8,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Collection Rate</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            className="w-full justify-start"
            onClick={exportReport}
          >
            <Download className="w-4 h-4" />
            Export Occupancy Report
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => navigate('/admin/slots')}
          >
            <Calendar className="w-4 h-4" />
            Schedule Maintenance
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => navigate('/admin/violations')}
          >
            <AlertTriangle className="w-4 h-4" />
            Review Violations
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => navigate('/admin/settings')}
          >
            <Users className="w-4 h-4" />
            Manage Staff
          </Button>
        </div>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-3">System Health</h3>
          <div className="space-y-3">
            {[
              { name: 'Database', status: 'Operational', color: 'green' },
              { name: 'Payment Gateway', status: 'Operational', color: 'green' },
              { name: 'Entry Scanner', status: 'Minor Issues', color: 'yellow' },
              { name: 'Real-time Sync', status: 'Operational', color: 'green' }
            ].map((system) => (
              <div key={system.name} className="flex items-center justify-between">
                <span className="text-gray-700">{system.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${system.color}-500 animate-pulse`} />
                  <span className={`text-sm font-medium text-${system.color}-600`}>
                    {system.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
              <div>
                <p>Toll personnel updated slot B23 status</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
              <div>
                <p>Payment received for ABC123 (₱50)</p>
                <p className="text-xs text-gray-400">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5" />
              <div>
                <p>Vehicle XYZ789 blocked due to violations</p>
                <p className="text-xs text-gray-400">12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5" />
              <div>
                <p>ML model updated with new data</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
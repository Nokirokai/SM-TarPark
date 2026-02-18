import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ParkingMap } from '../components/ParkingMap';
import { useParkingSlots } from '../../hooks/useData';
import { MapPin, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function SlotsPage() {
  const { slots, refetch } = useParkingSlots();

  // Real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const zones = ['A', 'B', 'C', 'D', 'E', 'F'];
  const zoneStats = zones.map(zone => {
    const zoneSlots = slots.filter(s => s.zone === zone);
    const occupied = zoneSlots.filter(s => s.status === 'occupied').length;
    const free = zoneSlots.filter(s => s.status === 'free').length;
    return {
      zone,
      total: zoneSlots.length,
      occupied,
      free,
      rate: zoneSlots.length > 0 ? Math.round((occupied / zoneSlots.length) * 100) : 0
    };
  });

  const statusData = [
    { name: 'Free', value: slots.filter(s => s.status === 'free').length, color: '#10B981' },
    { name: 'Occupied', value: slots.filter(s => s.status === 'occupied').length, color: '#EF4444' },
    { name: 'Reserved', value: slots.filter(s => s.status === 'reserved').length, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Parking Slots Map</h1>
        <p className="text-gray-600 mt-1">Real-time parking slot management and monitoring</p>
      </div>

      {/* Real-time Map */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Live Parking Grid</h2>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-sm text-gray-600">Real-time Updates</span>
          </div>
        </div>
        <ParkingMap slots={slots} interactive={true} />
      </Card>

      {/* Zone Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Zone Occupancy Rates</h2>
          <div className="space-y-3">
            {zoneStats.map(stat => (
              <div key={stat.zone}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">Zone {stat.zone}</span>
                  <span className="text-sm text-gray-600">
                    {stat.occupied}/{stat.total} ({stat.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.rate > 80 ? 'bg-red-500' :
                      stat.rate > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status Distribution</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <p>Loading slot data...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
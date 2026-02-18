// Mock data for SM TarPark system

export interface Vehicle {
  id: string;
  plate: string;
  owner: string;
  creditScore: number;
  entries: number;
  violations: number;
  entryTime?: Date;
  exitTime?: Date;
  slotNumber?: string;
  status: 'parked' | 'exited' | 'blocked';
  fee?: number;
  duration?: string;
}

export interface ParkingSlot {
  id: string;
  zone: string;
  number: number;
  status: 'free' | 'occupied' | 'pending' | 'reserved';
  plate?: string;
  entryTime?: Date;
}

export interface Violation {
  id: string;
  plate: string;
  type: string;
  fine: number;
  date: Date;
  status: 'unpaid' | 'paid' | 'pending';
  photoUrl?: string;
}

export interface Payment {
  id: string;
  plate: string;
  amount: number;
  date: Date;
  method: 'GCash' | 'Cash' | 'Card';
  type: 'parking' | 'violation';
  status: 'completed' | 'pending' | 'failed';
}

export interface OccupancyData {
  time: string;
  occupied: number;
  total: number;
}

// Generate parking slots
export const generateParkingSlots = (): ParkingSlot[] => {
  const zones = ['A', 'B', 'C', 'D', 'E', 'F'];
  const slots: ParkingSlot[] = [];
  
  zones.forEach(zone => {
    for (let i = 1; i <= 100; i++) {
      const random = Math.random();
      const status: ParkingSlot['status'] = 
        random < 0.65 ? 'occupied' : 
        random < 0.75 ? 'pending' : 
        random < 0.80 ? 'reserved' : 
        'free';
      
      slots.push({
        id: `${zone}${i}`,
        zone,
        number: i,
        status,
        plate: status === 'occupied' ? `ABC${Math.floor(Math.random() * 900 + 100)}` : undefined,
        entryTime: status === 'occupied' ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000) : undefined
      });
    }
  });
  
  return slots;
};

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABC123',
    owner: 'Juan Dela Cruz',
    creditScore: 95,
    entries: 156,
    violations: 0,
    status: 'parked',
    slotNumber: 'A15',
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '2h 15m',
    fee: 50
  },
  {
    id: '2',
    plate: 'XYZ789',
    owner: 'Maria Santos',
    creditScore: -25,
    entries: 89,
    violations: 5,
    status: 'blocked',
    slotNumber: 'B23'
  },
  {
    id: '3',
    plate: 'DEF456',
    owner: 'Pedro Garcia',
    creditScore: 75,
    entries: 203,
    violations: 1,
    status: 'parked',
    slotNumber: 'C08',
    entryTime: new Date(Date.now() - 45 * 60 * 1000),
    duration: '45m',
    fee: 20
  },
  {
    id: '4',
    plate: 'GHI012',
    owner: 'Ana Reyes',
    creditScore: -10,
    entries: 45,
    violations: 3,
    status: 'parked',
    slotNumber: 'D12',
    entryTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    duration: '3h 30m',
    fee: 70
  },
  {
    id: '5',
    plate: 'JKL345',
    owner: 'Carlos Ramos',
    creditScore: 88,
    entries: 178,
    violations: 0,
    status: 'exited'
  }
];

// Mock violations
export const mockViolations: Violation[] = [
  {
    id: '1',
    plate: 'XYZ789',
    type: 'Overstay (4+ hours)',
    fine: 500,
    date: new Date('2026-02-15'),
    status: 'unpaid'
  },
  {
    id: '2',
    plate: 'XYZ789',
    type: 'Improper Parking',
    fine: 300,
    date: new Date('2026-02-10'),
    status: 'unpaid'
  },
  {
    id: '3',
    plate: 'GHI012',
    type: 'Overstay (5+ hours)',
    fine: 600,
    date: new Date('2026-02-14'),
    status: 'pending'
  },
  {
    id: '4',
    plate: 'DEF456',
    type: 'No Payment on Exit',
    fine: 200,
    date: new Date('2026-01-28'),
    status: 'paid'
  }
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    plate: 'ABC123',
    amount: 50,
    date: new Date('2026-02-16 08:30'),
    method: 'GCash',
    type: 'parking',
    status: 'completed'
  },
  {
    id: '2',
    plate: 'DEF456',
    amount: 200,
    date: new Date('2026-02-15 14:20'),
    method: 'Cash',
    type: 'violation',
    status: 'completed'
  },
  {
    id: '3',
    plate: 'JKL345',
    amount: 40,
    date: new Date('2026-02-16 09:15'),
    method: 'Card',
    type: 'parking',
    status: 'completed'
  },
  {
    id: '4',
    plate: 'XYZ789',
    amount: 800,
    date: new Date('2026-02-16 10:00'),
    method: 'GCash',
    type: 'violation',
    status: 'pending'
  }
];

// Hourly occupancy data for charts
export const hourlyOccupancy: OccupancyData[] = [
  { time: '6 AM', occupied: 90, total: 600 },
  { time: '7 AM', occupied: 178, total: 600 },
  { time: '8 AM', occupied: 312, total: 600 },
  { time: '9 AM', occupied: 396, total: 600 },
  { time: '10 AM', occupied: 468, total: 600 },
  { time: '11 AM', occupied: 534, total: 600 },
  { time: '12 PM', occupied: 578, total: 600 },
  { time: '1 PM', occupied: 556, total: 600 },
  { time: '2 PM', occupied: 490, total: 600 },
  { time: '3 PM', occupied: 424, total: 600 },
  { time: '4 PM', occupied: 396, total: 600 },
  { time: '5 PM', occupied: 468, total: 600 },
  { time: '6 PM', occupied: 378, total: 600 },
  { time: '7 PM', occupied: 268, total: 600 }
];

// Weekly trend data
export const weeklyTrend = [
  { day: 'Mon', occupied: 245, revenue: 12500 },
  { day: 'Tue', occupied: 267, revenue: 13200 },
  { day: 'Wed', occupied: 289, revenue: 14500 },
  { day: 'Thu', occupied: 278, revenue: 13800 },
  { day: 'Fri', occupied: 298, revenue: 15200 },
  { day: 'Sat', occupied: 256, revenue: 12800 },
  { day: 'Sun', occupied: 198, revenue: 9800 }
];

// Zone usage data
export const zoneUsage = [
  { name: 'Zone A', value: 45, color: '#1E40AF' },
  { name: 'Zone B', value: 38, color: '#10B981' },
  { name: 'Zone C', value: 52, color: '#F59E0B' },
  { name: 'Zone D', value: 41, color: '#EF4444' },
  { name: 'Zone E', value: 48, color: '#8B5CF6' },
  { name: 'Zone F', value: 36, color: '#EC4899' }
];

// Violation types
export const violationTypes = [
  { type: 'Overstay', count: 45, color: '#EF4444' },
  { type: 'No Payment', count: 23, color: '#F59E0B' },
  { type: 'Improper Parking', count: 18, color: '#8B5CF6' },
  { type: 'Others', count: 9, color: '#6B7280' }
];

// Peak prediction (24h forecast)
export const peakPrediction = [
  { hour: '0', predicted: 12, actual: 15 },
  { hour: '2', predicted: 8, actual: 10 },
  { hour: '4', predicted: 15, actual: 12 },
  { hour: '6', predicted: 45, actual: 42 },
  { hour: '8', predicted: 180, actual: 175 },
  { hour: '10', predicted: 245, actual: 240 },
  { hour: '12', predicted: 289, actual: 285 },
  { hour: '14', predicted: 256, actual: null },
  { hour: '16', predicted: 234, actual: null },
  { hour: '18', predicted: 189, actual: null },
  { hour: '20', predicted: 98, actual: null },
  { hour: '22', predicted: 45, actual: null }
];
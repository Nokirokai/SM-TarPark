# SM TarPark API Reference

Complete API documentation for the SM TarPark parking management system.

## Base URL
```
https://psjynbtdjsvoslkqiaie.supabase.co/functions/v1/make-server-66851205
```

## Authentication

### Sign Up
```typescript
// Using the helper
import { authHelpers } from '../utils/supabaseClient';

await authHelpers.signUp(
  'user@example.com',
  'password123',
  {
    name: 'John Doe',
    role: 'toll',
    phone: '+63 912 345 6789'
  }
);
```

### Sign In
```typescript
await authHelpers.signIn('user@example.com', 'password123');
// Returns: { session, user }
```

### Sign Out
```typescript
await authHelpers.signOut();
```

### Get Current Session
```typescript
const session = await authHelpers.getSession();
const accessToken = session?.access_token;
```

## API Endpoints

### 🅿️ Parking Slots

#### Get All Slots
```typescript
import { slotsAPI } from '../services/api';

const { slots } = await slotsAPI.getAll();
// Returns: { slots: Array<Slot> }
```

**Response:**
```json
{
  "slots": [
    {
      "id": "A1",
      "zone": "A",
      "number": 1,
      "status": "free|occupied|pending|reserved",
      "plate": "ABC123",
      "entryTime": "2026-02-16T10:30:00.000Z"
    }
  ]
}
```

#### Get Slots by Zone
```typescript
const { slots } = await slotsAPI.getByZone('A');
```

#### Update Slot Status (Auth Required)
```typescript
await slotsAPI.updateStatus('A1', 'occupied', 'ABC123');
```

### 🚗 Vehicles (All require authentication)

#### Get All Vehicles
```typescript
import { vehiclesAPI } from '../services/api';

const { vehicles } = await vehiclesAPI.getAll();
```

**Response:**
```json
{
  "vehicles": [
    {
      "id": "v_1234567890_abc123",
      "plate": "ABC123",
      "owner": "Juan Dela Cruz",
      "creditScore": 95,
      "entries": 156,
      "violations": 0,
      "status": "parked|exited|blocked",
      "slotNumber": "A15",
      "entryTime": "2026-02-16T10:30:00.000Z"
    }
  ]
}
```

#### Get Vehicle by ID
```typescript
const { vehicle } = await vehiclesAPI.getById('v_1234567890_abc123');
```

#### Get Vehicle by Plate
```typescript
const { vehicle } = await vehiclesAPI.getByPlate('ABC123');
```

#### Record Vehicle Entry
```typescript
const { vehicle } = await vehiclesAPI.recordEntry(
  'ABC123',      // plate
  'Juan Cruz',   // owner
  'A15'          // slotId
);
```

**What it does:**
- Creates new vehicle record or updates existing one
- Updates slot status to 'occupied'
- Records entry time
- Increments entry count

#### Record Vehicle Exit
```typescript
const { vehicle, fee } = await vehiclesAPI.recordExit('v_1234567890_abc123');
```

**Response:**
```json
{
  "vehicle": {
    "id": "v_1234567890_abc123",
    "status": "exited",
    "exitTime": "2026-02-16T14:30:00.000Z",
    "duration": "4h",
    "fee": 100
  },
  "fee": 100
}
```

**What it does:**
- Calculates parking duration
- Calculates fee (₱25 per hour)
- Updates vehicle status to 'exited'
- Frees up the parking slot

#### Update Credit Score
```typescript
await vehiclesAPI.updateCreditScore('v_1234567890_abc123', 85);
```

### ⚠️ Violations (All require authentication)

#### Get All Violations
```typescript
import { violationsAPI } from '../services/api';

const { violations } = await violationsAPI.getAll();
```

**Response:**
```json
{
  "violations": [
    {
      "id": "vio_1234567890_abc123",
      "plate": "ABC123",
      "type": "Overtime Parking",
      "fine": 500,
      "photoUrl": "https://...",
      "date": "2026-02-16T10:30:00.000Z",
      "status": "unpaid|paid|pending"
    }
  ]
}
```

#### Create Violation
```typescript
const { violation } = await violationsAPI.create({
  plate: 'ABC123',
  type: 'Overtime Parking',
  fine: 500,
  photoUrl: 'https://...' // optional
});
```

**What it does:**
- Creates violation record
- Decreases vehicle credit score by 10 points
- Increments vehicle violation count

#### Update Violation Status
```typescript
await violationsAPI.updateStatus('vio_1234567890_abc123', 'paid');
```

### 💰 Payments (All require authentication)

#### Get All Payments
```typescript
import { paymentsAPI } from '../services/api';

const { payments } = await paymentsAPI.getAll();
```

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_1234567890_abc123",
      "plate": "ABC123",
      "amount": 100,
      "method": "GCash|Cash|Card",
      "type": "parking|violation",
      "referenceId": "vio_...",
      "date": "2026-02-16T14:30:00.000Z",
      "status": "completed|pending|failed"
    }
  ]
}
```

#### Create Payment
```typescript
const { payment } = await paymentsAPI.create({
  plate: 'ABC123',
  amount: 100,
  method: 'GCash',
  type: 'parking',
  referenceId: 'v_1234567890_abc123' // optional, for violation payments
});
```

**What it does:**
- Records payment transaction
- If type is 'violation' and referenceId provided, marks violation as paid

#### Process GCash Payment
```typescript
const { payment, message } = await paymentsAPI.processGCash(
  'ABC123',  // plate
  100,       // amount
  'parking'  // type
);
```

**Response:**
```json
{
  "payment": {
    "id": "pay_1234567890_abc123",
    "gcashReferenceNumber": "GC1708084800000"
  },
  "message": "GCash payment processed successfully"
}
```

### 📊 Analytics

#### Get Dashboard Stats (Public)
```typescript
import { analyticsAPI } from '../services/api';

const { stats } = await analyticsAPI.getDashboardStats();
```

**Response:**
```json
{
  "stats": {
    "totalSlots": 300,
    "occupiedSlots": 195,
    "freeSlots": 105,
    "occupancyRate": "65.0",
    "todayRevenue": 12500,
    "unpaidViolations": 15,
    "totalVehicles": 450
  }
}
```

#### Get Occupancy Trend (Public)
```typescript
const { data } = await analyticsAPI.getOccupancyTrend('day'); // or 'week', 'month'
```

**Response:**
```json
{
  "data": [
    {
      "time": "2026-02-16T10:00:00.000Z",
      "occupied": 195,
      "total": 300
    }
  ]
}
```

#### Get Revenue (Auth Required)
```typescript
const { revenue } = await analyticsAPI.getRevenue(
  '2026-02-01',  // start date
  '2026-02-16'   // end date
);
```

**Response:**
```json
{
  "revenue": {
    "total": 125000,
    "parking": 100000,
    "violations": 25000,
    "transactionCount": 1250
  }
}
```

#### Get Peak Prediction (Public)
```typescript
const { predictions } = await analyticsAPI.getPeakPrediction();
```

**Response:**
```json
{
  "predictions": [
    {
      "date": "2026-02-17",
      "predictedPeakTime": "10:00",
      "predictedOccupancy": 75,
      "confidence": 0.89
    }
  ]
}
```

## React Hooks

### useParkingSlots
```typescript
const { slots, loading, error, refetch } = useParkingSlots();
```

### useVehicles (Auth Required)
```typescript
const { vehicles, loading, error, refetch } = useVehicles();
```

### useViolations (Auth Required)
```typescript
const { violations, loading, error, refetch } = useViolations();
```

### usePayments (Auth Required)
```typescript
const { payments, loading, error, refetch } = usePayments();
```

### useDashboardStats
```typescript
const { stats, loading, error, refetch } = useDashboardStats();
```

### useOccupancyTrend
```typescript
const { data, loading, error, refetch } = useOccupancyTrend('day');
```

## Error Handling

All API calls throw errors that can be caught:

```typescript
try {
  await vehiclesAPI.recordEntry(plate, owner, slotId);
  toast.success('Vehicle entry recorded!');
} catch (error: any) {
  toast.error(error.message || 'Operation failed');
  console.error('API Error:', error);
}
```

## Common Use Cases

### 1. Vehicle Entry Flow
```typescript
import { vehiclesAPI, slotsAPI } from '../services/api';
import { toast } from 'sonner';

async function handleVehicleEntry(plate: string, owner: string, slotId: string) {
  try {
    // Record entry
    const result = await vehiclesAPI.recordEntry(plate, owner, slotId);
    
    toast.success(`Vehicle ${plate} parked in slot ${slotId}`);
    
    // Refresh data
    refetchVehicles();
    refetchSlots();
    
    return result;
  } catch (error: any) {
    toast.error('Failed to record entry: ' + error.message);
    throw error;
  }
}
```

### 2. Vehicle Exit & Payment Flow
```typescript
async function handleVehicleExit(vehicleId: string) {
  try {
    // Record exit and get fee
    const { vehicle, fee } = await vehiclesAPI.recordExit(vehicleId);
    
    // Process payment
    await paymentsAPI.create({
      plate: vehicle.plate,
      amount: fee,
      method: 'GCash',
      type: 'parking',
      referenceId: vehicleId
    });
    
    toast.success(`Exit recorded. Fee: ₱${fee}`);
    
    // Refresh data
    refetchVehicles();
    refetchSlots();
    refetchPayments();
  } catch (error: any) {
    toast.error('Exit failed: ' + error.message);
  }
}
```

### 3. Violation Processing
```typescript
async function handleViolation(plate: string, type: string, fine: number) {
  try {
    // Create violation
    const { violation } = await violationsAPI.create({
      plate,
      type,
      fine,
      photoUrl: null
    });
    
    toast.warning(`Violation issued to ${plate}`);
    
    // Refresh data
    refetchViolations();
    refetchVehicles(); // Credit score updated
  } catch (error: any) {
    toast.error('Failed to create violation');
  }
}
```

### 4. Real-time Dashboard Updates
```typescript
import { useEffect } from 'react';

function Dashboard() {
  const { slots, refetch: refetchSlots } = useParkingSlots();
  const { stats, refetch: refetchStats } = useDashboardStats();
  
  useEffect(() => {
    // Refresh every 3 seconds
    const interval = setInterval(() => {
      refetchSlots();
      refetchStats();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [refetchSlots, refetchStats]);
  
  return (
    <div>
      <h1>Occupied: {stats?.occupiedSlots} / {stats?.totalSlots}</h1>
      {/* ... */}
    </div>
  );
}
```

## Testing

### Test Backend Connection
```javascript
// In browser console:
testBackendConnection()
```

### Health Check
```bash
curl https://psjynbtdjsvoslkqiaie.supabase.co/functions/v1/make-server-66851205/health
```

### Test Public Endpoint
```bash
curl -H "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  https://psjynbtdjsvoslkqiaie.supabase.co/functions/v1/make-server-66851205/slots
```

## Rate Limits & Best Practices

1. **Batch Operations**: Use `mset` for multiple updates
2. **Caching**: Hooks automatically cache data
3. **Refresh Strategically**: Don't refresh on every render
4. **Error Handling**: Always wrap API calls in try-catch
5. **Loading States**: Use the `loading` state from hooks
6. **Optimistic Updates**: Update UI before API response for better UX

## Support

- Backend logs: Supabase Dashboard > Edge Functions > Logs
- Database: Supabase Dashboard > Database > kv_store_66851205
- Auth: Supabase Dashboard > Authentication > Users

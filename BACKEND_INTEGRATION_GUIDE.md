# SM TarPark Backend Integration Guide

Your SM TarPark parking management system is now fully integrated with Supabase backend! 🎉

## What's Been Set Up

### 1. **Backend Server (Supabase Edge Function)**
Location: `/supabase/functions/server/index.tsx`

The server includes comprehensive API routes for:

#### Authentication Routes
- `POST /make-server-66851205/auth/signup` - Create new user account
- Sign in handled by Supabase Auth client-side
- Session management

#### Parking Slots Routes
- `GET /make-server-66851205/slots` - Get all parking slots (public)
- `GET /make-server-66851205/slots/zone/:zone` - Get slots by zone
- `PUT /make-server-66851205/slots/:slotId` - Update slot status (auth required)

#### Vehicles Routes (Auth Required)
- `GET /make-server-66851205/vehicles` - Get all vehicles
- `GET /make-server-66851205/vehicles/:id` - Get vehicle by ID
- `GET /make-server-66851205/vehicles/plate/:plate` - Get vehicle by plate
- `POST /make-server-66851205/vehicles/entry` - Record vehicle entry
- `POST /make-server-66851205/vehicles/:id/exit` - Record vehicle exit
- `PUT /make-server-66851205/vehicles/:id/credit` - Update credit score

#### Violations Routes (Auth Required)
- `GET /make-server-66851205/violations` - Get all violations
- `POST /make-server-66851205/violations` - Create violation
- `PUT /make-server-66851205/violations/:id` - Update violation status

#### Payments Routes (Auth Required)
- `GET /make-server-66851205/payments` - Get all payments
- `POST /make-server-66851205/payments` - Create payment
- `POST /make-server-66851205/payments/gcash` - Process GCash payment

#### Analytics Routes
- `GET /make-server-66851205/analytics/dashboard` - Get dashboard stats (public)
- `GET /make-server-66851205/analytics/occupancy` - Get occupancy trend
- `GET /make-server-66851205/analytics/revenue` - Get revenue data (auth required)
- `GET /make-server-66851205/analytics/peak-prediction` - Get ML peak predictions

### 2. **Frontend Integration**

#### Supabase Client
Location: `/src/utils/supabaseClient.ts`
- Configured Supabase client for authentication
- Helper functions for auth operations

#### API Service Layer
Location: `/src/services/api.ts`
- Organized API functions by domain (slots, vehicles, violations, payments, analytics)
- Handles authentication headers automatically
- Error handling built-in

#### React Context for Auth
Location: `/src/contexts/AuthContext.tsx`
- `AuthProvider` wraps the entire app
- `useAuth()` hook for accessing auth state and functions
- Provides: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`

#### Custom Data Hooks
Location: `/src/hooks/useData.ts`
- `useParkingSlots()` - Fetch and manage parking slots
- `useVehicles()` - Fetch vehicles (auth required)
- `useViolations()` - Fetch violations (auth required)
- `usePayments()` - Fetch payments (auth required)
- `useDashboardStats()` - Fetch dashboard statistics
- `useOccupancyTrend(period)` - Fetch occupancy trends

### 3. **Data Storage**

The backend uses Supabase Key-Value store with these collections:
- `parking_slots` - All 300 parking slots (Zones A-F, 50 slots each)
- `vehicles` - Vehicle records with entry/exit history
- `violations` - Violation records
- `payments` - Payment transactions

Data is automatically initialized on server start if not present.

## How to Use

### For Testing Authentication

1. **Create a Test Account:**
   - Go to `/register`
   - Fill in the form (use any email, password minimum 6 chars)
   - System will auto-confirm email (no email server needed)
   - You'll be automatically logged in

2. **Demo Accounts (Create These):**
   ```
   Toll Personnel:
   Email: toll@smtarlac.com
   Password: toll123
   
   Admin:
   Email: admin@smtarlac.com
   Password: admin123
   ```

3. **Test Login:**
   - Go to `/login`
   - Select role (Toll Personnel or Admin)
   - Enter credentials
   - Click Login

### Current Integration Status

✅ **Fully Integrated:**
- Authentication (signup, login, logout)
- Public Dashboard (real-time parking slots and stats)
- Session management
- Toast notifications
- Real-time data refresh (every 3 seconds)

🔄 **Ready to Integrate:**
- Toll Dashboard - vehicle entry/exit
- Admin Dashboard - full management
- Vehicles Page - CRUD operations
- Violations Page - violation management
- Payments Page - payment processing
- Reports Page - analytics and exports

## Next Steps

### To Connect Other Pages:

1. **Import the hooks in your page:**
   ```tsx
   import { useVehicles, useViolations } from '../../hooks/useData';
   ```

2. **Use the hooks:**
   ```tsx
   const { vehicles, loading, error, refetch } = useVehicles();
   ```

3. **Use the API for mutations:**
   ```tsx
   import { vehiclesAPI } from '../../services/api';
   
   // Record entry
   await vehiclesAPI.recordEntry(plate, owner, slotId);
   
   // Record exit
   await vehiclesAPI.recordExit(vehicleId);
   ```

### Example: Vehicle Entry Flow

```tsx
import { vehiclesAPI, slotsAPI } from '../../services/api';
import { toast } from 'sonner';

const handleVehicleEntry = async (plate: string, owner: string, slotId: string) => {
  try {
    // Record vehicle entry
    const result = await vehiclesAPI.recordEntry(plate, owner, slotId);
    
    toast.success(`Vehicle ${plate} parked in slot ${slotId}`);
    
    // Refresh data
    refetchVehicles();
    refetchSlots();
  } catch (error) {
    toast.error('Failed to record vehicle entry');
    console.error(error);
  }
};
```

## Testing the Backend

### Health Check
Open browser to: `https://psjynbtdjsvoslkqiaie.supabase.co/functions/v1/make-server-66851205/health`

Should return: `{"status":"ok","timestamp":"..."}`

### View Database
Visit: https://supabase.com/dashboard/project/psjynbtdjsvoslkqiaie/database/tables

You can view the `kv_store_66851205` table to see stored data.

## Important Notes

1. **Authentication Required Routes:**
   - Most management routes require authentication
   - Pass the access token in Authorization header
   - The API service handles this automatically

2. **Public Routes:**
   - Parking slots (read-only)
   - Dashboard stats
   - Public dashboard access

3. **Real-time Updates:**
   - The PublicDashboard refreshes every 3 seconds
   - You can adjust the interval in the useEffect

4. **Error Handling:**
   - All API calls have try-catch blocks
   - Toast notifications show success/error messages
   - Console logs for debugging

## Troubleshooting

### If Login Fails:
- Check browser console for errors
- Verify the user was created (check Supabase Auth dashboard)
- Ensure password is at least 6 characters

### If Data Doesn't Load:
- Check network tab in browser dev tools
- Verify API endpoint is responding (health check)
- Check console for error messages

### If 401 Unauthorized:
- User needs to be logged in
- Session may have expired - logout and login again
- Check that Authorization header is being sent

## Summary

Your parking management system now has:
- ✅ Full authentication system
- ✅ Backend API with all CRUD operations
- ✅ Real-time data updates
- ✅ Proper error handling
- ✅ Toast notifications
- ✅ Public dashboard with live data
- ✅ Ready-to-use hooks and API functions

The foundation is complete! You can now connect the remaining pages (Toll Dashboard, Admin Dashboard, etc.) using the same patterns demonstrated in the PublicDashboard.

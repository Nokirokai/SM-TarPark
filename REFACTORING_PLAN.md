# SM TarPark Comprehensive Refactoring Plan

## Issues to Fix

### 1. Authentication & Role-Based Access
- [x] Create useUserRole hook for role management
- [ ] Update DashboardLayout to show only role-specific nav items
- [ ] Add role guard to prevent cross-role access
- [ ] Fix JWT token passing in all API calls

### 2. Remove Sample/Demo Data
- [ ] Clean TollDashboard - remove hardcoded vehicles
- [ ] Clean AdminDashboard - remove hardcoded data
- [ ] Ensure all data comes from backend API

### 3. Slots Map Sync
- [ ] Fix real-time updates between toll and public view
- [ ] Implement proper WebSocket or polling mechanism
- [ ] Ensure slot status updates immediately

### 4. Vehicles Page
- [ ] Remove "Add Vehicle" button
- [ ] Add "Delete Vehicle" button with confirmation
- [ ] Fix "invalid JWT" error on vehicle entry
- [ ] Make table functional with real data
- [ ] Add proper filtering and search

### 5. Violations Page
- [ ] Connect to real backend data
- [ ] Add create violation functionality
- [ ] Add update/resolve violation
- [ ] Add photo upload support
- [ ] Fix filtering and status updates

### 6. Payments Page
- [ ] Connect to real payment data
- [ ] Add payment creation form
- [ ] Implement GCash payment flow
- [ ] Add payment verification
- [ ] Fix export functionality

### 7. Reports Page
- [ ] Make all export buttons functional
- [ ] Connect charts to real data
- [ ] Add date range filtering
- [ ] Generate PDF/Excel exports

### 8. Settings Page
- [ ] Fix Add Zone functionality
- [ ] Fix Edit Zone functionality
- [ ] Implement GCash API key management
- [ ] Sync User Management with real Supabase accounts
- [ ] Fix profile editing

### 9. Profile Page
- [ ] Make update profile functional
- [ ] Add GCash number field
- [ ] Fix save functionality

### 10. Replace Emojis with SVG Icons
- [ ] Find and replace all emoji uses with lucide-react icons
- [ ] Update PublicDashboard
- [ ] Update all other components

### 11. Public View Real-time Sync
- [ ] Ensure parking map updates when toll adds vehicle
- [ ] Implement proper refresh mechanism
- [ ] Test sync between toll and public views

## Implementation Priority
1. Fix authentication and JWT issues first (blocking)
2. Implement role-based access control
3. Fix Vehicles page and remove sample data
4. Fix Slots sync and real-time updates
5. Make each feature tab functional
6. Replace emojis
7. Polish and testing

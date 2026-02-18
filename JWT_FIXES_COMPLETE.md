# JWT Authentication & Error Fixes - Complete Guide

## Date: February 17, 2026

---

## ✅ FIXES IMPLEMENTED

### 1. **SM Logo Reverted** ✓
- Changed back to original simple "SM" text logo on blue background
- File: `/src/app/components/SMLogoSVG.tsx`

### 2. **Enhanced JWT Authentication Logging** ✓
- Added comprehensive logging to server's `verifyAuth` function
- Now shows detailed error messages for JWT validation
- Tracks: token presence, format, length, and validation status
- File: `/supabase/functions/server/index.tsx`

### 3. **Improved API Client Error Handling** ✓
- Added detailed logging for JWT token retrieval
- Shows ✓ or ✗ for each API call with auth
- Better error messages for expired tokens
- Automatic token refresh on 401 errors
- File: `/src/services/api.ts`

### 4. **Settings Page Fixed** ✓
- Fixed import path for Supabase info (was `../../`, now `../../../`)
- Zone Management now fetches REAL DATA
- User Management fully functional with Add User feature
- File: `/src/app/pages/SettingsPage.tsx`

### 5. **Created Debug/Diagnostics Page** ✓
- New page at `/debug/auth` to troubleshoot authentication
- Shows:
  - User authentication status
  - Active session details
  - JWT access token status
  - Server health check
  - API connectivity test
- File: `/src/app/pages/DebugAuth.tsx`

---

## 🔍 TROUBLESHOOTING GUIDE

### Error: "Invalid JWT"

**Possible Causes:**
1. User is not logged in
2. Session has expired
3. Token is corrupted or invalid

**Solutions:**
1. **Log out and log back in:**
   - Click the logout button
   - Go to `/login`
   - Use default credentials:
     - Admin: `admin@smtarpark.com` / `Admin123!`
     - Toll: `toll@smtarpark.com` / `Toll123!`

2. **Check your session:**
   - Go to `/debug/auth` to see detailed diagnostics
   - Look for any red ✗ marks
   - Follow the troubleshooting suggestions

3. **Clear browser storage:**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   // Then refresh the page and log in again
   ```

### Error: "Network error: Failed to fetch"

**Possible Causes:**
1. Edge Function (server) is not running
2. CORS configuration issue
3. Network connectivity problem

**Solutions:**
1. **Check server status:**
   - Go to Supabase Dashboard
   - Navigate to Edge Functions
   - Verify `make-server-66851205` is deployed and running

2. **Check server logs:**
   - In Supabase Dashboard, go to Edge Functions → Logs
   - Look for any error messages
   - Server should show: "Initialized parking slots: 600 total slots"

3. **Test server health:**
   - Go to `/debug/auth`
   - Check "Server Health" indicator
   - Should show green ✓ if server is working

### Error: "Vehicle not found"

**Possible Causes:**
1. Vehicle doesn't exist in database
2. Plate number typo
3. Vehicle was deleted

**Solutions:**
1. **Check plate number:**
   - Verify spelling is correct
   - Check for extra spaces
   - Plate numbers are case-sensitive

2. **Check Vehicles tab:**
   - Navigate to Vehicles page
   - Search for the vehicle
   - Verify it exists in the system

3. **Re-register vehicle:**
   - If vehicle was deleted, record a new entry
   - Use the "Record Entry" feature in Toll Dashboard

---

## 🚀 HOW TO TEST

### 1. Test Authentication
```
1. Open browser console (F12)
2. Navigate to /login
3. Login with:
   - Email: admin@smtarpark.com
   - Password: Admin123!
4. Watch console for logs:
   - 🔑 Access token for /vehicles/entry : Found ✓
   - ✅ User authenticated successfully
5. If you see ✗ Missing, follow troubleshooting steps above
```

### 2. Test Vehicle Entry
```
1. Login as Toll Personnel
2. Go to Toll Dashboard
3. Click "Record Entry"
4. Enter:
   - Plate: ABC1234
   - Owner: Test Driver
5. Submit
6. Check console:
   - Should see: 🔑 Access token for /vehicles/entry : Found ✓
   - Should NOT see: ❌ Invalid JWT
7. If success, you'll see confirmation modal
```

### 3. Test Vehicle Exit
```
1. From Toll Dashboard
2. Click "Record Exit"
3. Enter the same plate: ABC1234
4. Submit
5. Check console for JWT logs
6. Should see payment amount calculated
7. Vehicle should be removed from occupied list
```

### 4. Test Violations
```
1. Navigate to Violations tab
2. Click "Add Violation" button
3. Fill in form:
   - Plate: ABC1234
   - Type: Overstay
   - Fine: 500
4. Submit
5. Check console for auth logs
6. Violation should appear in table
```

### 5. Test Payments
```
1. Navigate to Payments tab
2. Click "Add Payment" button
3. Fill in form:
   - Plate: ABC1234
   - Amount: 500
   - Method: Cash
   - Type: parking
4. Submit
5. Check console for auth logs
6. Payment should appear in table
```

### 6. Test Settings
```
1. Navigate to Settings
2. Verify Zone Management shows:
   - All 6 zones (A-F)
   - Real slot counts
   - Occupancy percentages
3. Verify User Management shows:
   - Current users
   - "Add User" button works
```

---

## 📋 DIAGNOSTIC CHECKLIST

Go to `/debug/auth` and verify:

- [ ] ✓ User Authentication (green checkmark)
- [ ] ✓ Active Session (green checkmark)
- [ ] ✓ JWT Access Token (green checkmark, shows token preview)
- [ ] ✓ Server Health (green checkmark)
- [ ] ✓ Parking Slots API (green checkmark)

**If any show ✗ (red X):**
1. Follow the troubleshooting guide on that page
2. Try refreshing diagnostics
3. Check browser console for detailed error messages

---

## 🔐 DEFAULT CREDENTIALS

The server automatically creates these accounts on first run:

### Admin Account
- **Email:** admin@smtarpark.com
- **Password:** Admin123!
- **Role:** admin
- **Access:** Full system access

### Toll Personnel Account
- **Email:** toll@smtarpark.com
- **Password:** Toll123!
- **Role:** toll
- **Access:** Entry/exit, violations, payments

---

## 📊 WHAT EACH LOG MESSAGE MEANS

### Client-Side (Browser Console)

| Message | Meaning |
|---------|---------|
| `🔑 Access token for /vehicles/entry : Found ✓` | JWT token successfully retrieved |
| `🔑 Access token for /vehicles/entry : Missing ✗` | No JWT token - user not logged in |
| `⚠️ JWT token invalid or expired` | Token expired, attempting refresh |
| `✅ Session refreshed successfully` | Token refresh worked |
| `❌ Session refresh failed` | Token refresh failed - need to re-login |

### Server-Side (Edge Function Logs)

| Message | Meaning |
|---------|---------|
| `🔐 Auth verification started` | Server received auth request |
| `📋 Auth header: Present` | Authorization header found |
| `🔑 Token extracted, length: 1234` | JWT token extracted successfully |
| `🔄 Verifying token with Supabase...` | Validating token |
| `✅ User authenticated successfully` | JWT validation passed |
| `❌ Missing Authorization header` | No auth header in request |
| `❌ Invalid access token` | Token is null/undefined |
| `❌ JWT verification error` | Token validation failed |

---

## 🛠️ COMMON ISSUES & QUICK FIXES

### Issue: "Please log in to access this feature"
**Fix:** You're not logged in. Go to `/login` and sign in.

### Issue: "Your session has expired. Please log in again."
**Fix:** Your JWT token expired. Log out and log back in.

### Issue: All APIs failing with "Network error"
**Fix:** Server is down. Check Edge Function deployment.

### Issue: "Unauthorized - authentication required"
**Fix:** JWT token is invalid. Clear localStorage and re-login.

### Issue: Some APIs work, others don't
**Fix:** Check which APIs require auth. Entry/exit/violations/payments all need auth.

### Issue: Can't see violations or payments
**Fix:** These require authentication. Make sure you're logged in as admin or toll.

### Issue: Zone Management shows "Loading zones..."
**Fix:** Server might be initializing. Wait 5 seconds and refresh.

### Issue: Delete vehicle doesn't work
**Fix:** Verify you're logged in and have valid JWT token. Check console logs.

---

## 📞 SUPPORT

If you still have issues after following this guide:

1. Go to `/debug/auth` and take a screenshot
2. Open browser console (F12) and copy error messages
3. Check Edge Function logs in Supabase Dashboard
4. Note which specific action is failing (entry, exit, etc.)

---

## ✅ VERIFICATION

After implementing these fixes, you should see:

1. **No "Invalid JWT" errors** when:
   - Recording vehicle entry
   - Recording vehicle exit
   - Deleting vehicles
   - Adding violations
   - Adding payments

2. **Proper logging** in console:
   - 🔑 Token status for each auth request
   - 🔐 Server auth verification messages
   - ✅ Success indicators
   - ❌ Clear error messages if something fails

3. **Working features:**
   - Vehicle entry/exit works smoothly
   - Violations can be created
   - Payments can be recorded
   - Vehicles can be deleted
   - Zone Management shows real data
   - User Management shows users and Add User works

---

**Status:** ✅ All fixes implemented and ready for testing!
**Last Updated:** February 17, 2026
**Next Step:** Test authentication flow and check `/debug/auth` page

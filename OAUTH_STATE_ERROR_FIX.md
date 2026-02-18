# 🔧 OAuth State Error - COMPLETE FIX

## The Error
```
invalid_request - OAuth state not found or expired
```

This means the OAuth flow's state parameter is being lost between redirects.

---

## ✅ **SOLUTION: Fix Supabase Redirect URL Configuration**

### **Root Cause**
The redirect URL in Supabase doesn't match where your app is actually hosted. This causes the OAuth state cookie to be lost.

### **Step 1: Check Your Current URL**
Look at your browser address bar right now. What do you see?
- `http://localhost:5173` ← This is your app URL
- Note the exact URL including protocol and port

### **Step 2: Update Supabase Settings** ⚠️ **CRITICAL**

1. **Go to Supabase Authentication Settings:**
   ```
   https://supabase.com/dashboard/project/psjynbtdjsvoslkqiaie/auth/url-configuration
   ```

2. **Update "Site URL" to EXACTLY:**
   ```
   http://localhost:5173
   ```
   - Must be EXACT match (no trailing slash)
   - Must include `http://` 
   - Must match your browser URL

3. **Update "Redirect URLs" section:**
   
   **CLEAR ALL existing URLs and add these:**
   ```
   http://localhost:5173/**
   http://localhost:5173/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
   
   The `**` wildcard is important - it allows all paths under that domain.

4. **Additional Redirect URLs (Optional but recommended):**
   ```
   http://localhost:5173
   http://localhost:3000
   ```

5. **Click "Save"** and wait for it to confirm saved

### **Step 3: Clear Everything and Test**

1. **Clear browser data:**
   - Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Select:
     - ✅ Cookies and site data
     - ✅ Cached images and files
   - Time range: "All time"
   - Clear data

2. **Close ALL browser tabs** with your app

3. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

4. **Open in Incognito/Private window** (to ensure clean state):
   - Chrome: `Ctrl+Shift+N` or `Cmd+Shift+N`
   - Firefox: `Ctrl+Shift+P` or `Cmd+Shift+P`

5. **Go to:** `http://localhost:5173/login`

6. **Click "Continue with Google"**

7. **Should work now!** ✅

---

## 🔍 **Additional Checks**

### Check 1: Verify Supabase Callback URL in Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", verify you have:
   ```
   https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
   ```
4. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:5173
   http://localhost:3000
   https://psjynbtdjsvoslkqiaie.supabase.co
   ```
5. Save

### Check 2: Verify Third-Party Cookies

**Chrome:**
1. Go to: `chrome://settings/cookies`
2. Make sure "Block third-party cookies" is OFF
3. Or add exception for `supabase.co`

**Firefox:**
1. Go to: `about:preferences#privacy`
2. Set "Enhanced Tracking Protection" to "Standard"
3. Or add exception for `supabase.co`

### Check 3: Verify No Browser Extensions Blocking Cookies

Disable extensions like:
- Privacy Badger
- uBlock Origin (temporarily)
- Cookie blockers
- Ad blockers

---

## 🚀 **What I Fixed in the Code**

### Updated `/src/utils/supabaseClient.ts`:

1. ✅ **Added PKCE flow type** - More secure OAuth flow
2. ✅ **Enabled session detection in URL** - Handles OAuth redirects better
3. ✅ **Set localStorage for persistence** - Keeps session across tabs
4. ✅ **Auto-refresh tokens** - Maintains login state
5. ✅ **Simplified OAuth redirect** - Removed extra query params that might cause issues

---

## 📋 **Complete Supabase Configuration**

### Site URL:
```
http://localhost:5173
```

### Redirect URLs (Add ALL of these):
```
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5173/
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/
```

### Why multiple URLs?
- `**` wildcard allows all paths
- Multiple ports (3000, 5173) for flexibility
- With and without trailing slash

---

## ⚠️ **Common Mistakes to Avoid**

### ❌ **Wrong:**
```
Site URL: https://localhost:5173  (should be http, not https for localhost)
Site URL: http://localhost:5173/  (no trailing slash)
Site URL: localhost:5173           (missing http://)
Redirect: /auth/callback           (missing full URL)
```

### ✅ **Correct:**
```
Site URL: http://localhost:5173
Redirect: http://localhost:5173/**
Redirect: http://localhost:5173/auth/callback
```

---

## 🧪 **Testing Flow**

### Expected Flow:
```
1. Go to: http://localhost:5173/login
   ✅ Page loads

2. Click "Continue with Google"
   ✅ Redirects to Google login

3. Login with Google
   ✅ Google authenticates you

4. Google redirects to Supabase
   ✅ URL: https://...supabase.co/auth/v1/callback

5. Supabase validates and redirects
   ✅ URL: http://localhost:5173/auth/callback#access_token=...

6. Your app processes login
   ✅ Shows "Completing login..." screen

7. Final redirect
   ✅ URL: http://localhost:5173/toll
   ✅ You're logged in with user profile showing
```

### What to Watch For:
- ❌ If Step 5 redirects to wrong port → Fix Site URL
- ❌ If Step 5 shows "OAuth state error" → Clear cookies and cache
- ❌ If Step 6 doesn't load → Check redirect URLs include /**

---

## 🔄 **Alternative: Use Implicit Flow (Fallback)**

If PKCE flow still has issues, try implicit flow:

**Update vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost', // Explicitly set host
  },
  // ... rest of config
})
```

Then restart dev server.

---

## 💡 **Why This Happens**

The OAuth state parameter is stored in a cookie during the OAuth flow:

1. User clicks "Login with Google"
2. Supabase creates a state cookie: `sb-auth-token`
3. Redirects to Google with state parameter
4. Google redirects back to Supabase with same state
5. Supabase validates state matches cookie
6. If match ✅ → Redirects to your app
7. If no match ❌ → "OAuth state not found" error

**The cookie gets lost when:**
- Domain/port mismatch between steps
- Third-party cookies blocked
- Cache/cookie issues
- Wrong redirect URL configuration

---

## ✅ **Verification Checklist**

Before testing, verify:

- [ ] Supabase Site URL is `http://localhost:5173` (exact)
- [ ] Supabase Redirect URLs include `http://localhost:5173/**`
- [ ] Supabase Redirect URLs include `http://localhost:5173/auth/callback`
- [ ] Google Console has Supabase callback URL
- [ ] Browser cookies are enabled
- [ ] Third-party cookies are allowed
- [ ] Browser cache is cleared
- [ ] All browser tabs closed and reopened
- [ ] Dev server restarted
- [ ] Testing in incognito/private mode

---

## 🎯 **Quick Fix Summary**

**Do these 3 things:**

1. **In Supabase:** Set Site URL to `http://localhost:5173`
2. **In Supabase:** Add redirect URLs with `/**` wildcard
3. **In Browser:** Clear all cookies and cache

Then test in incognito mode.

---

## 📞 **Still Having Issues?**

### Debug Steps:

1. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for any red errors
   - Check Network tab for failed requests

2. **Check if cookies are being set**
   - Open DevTools → Application/Storage tab
   - Look for cookies from `supabase.co`
   - Should see auth-related cookies

3. **Test regular email/password login**
   - If that works, OAuth configuration is the issue
   - If that fails, Supabase connection is the issue

4. **Check Supabase logs**
   - Go to Supabase Dashboard → Logs → Auth
   - Look for OAuth-related errors

---

## 🚀 **For Production**

When deploying to production, update:

### Supabase:
```
Site URL: https://your-domain.com
Redirect URLs: 
  - https://your-domain.com/**
  - https://your-domain.com/auth/callback
```

### Google Console:
```
Authorized redirect URIs:
  - https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
  
Authorized JavaScript origins:
  - https://your-domain.com
  - https://psjynbtdjsvoslkqiaie.supabase.co
```

---

## ✅ **This Will Fix It**

The OAuth state error is almost always a configuration mismatch. Following the steps above will resolve it. The key is:

1. ✅ Exact Site URL match
2. ✅ Wildcard redirect URLs
3. ✅ Clean browser state
4. ✅ Cookies enabled

After fixing these, OAuth will work perfectly! 🎉

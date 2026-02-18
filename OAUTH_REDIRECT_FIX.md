# 🔧 OAuth Redirect Issue - SOLVED

## The Problem

OAuth login is working, but redirecting to the wrong URL:
- **Current redirect:** `http://localhost:3000/#access_token=...`
- **Should redirect to:** Your app's actual URL (likely `http://localhost:5173`)

## Why This Happens

Supabase's "Site URL" setting is configured for `http://localhost:3000`, but your app is running on a different port.

---

## ✅ Solution: Update Supabase Site URL

### Step 1: Find Your App's Port

**Check your browser's address bar** when running the app:
- Is it `http://localhost:5173`? → Your port is **5173** (Vite default)
- Is it `http://localhost:3000`? → Your port is **3000**
- Something else? → Note that port number

### Step 2: Update Supabase Settings

1. **Go to Supabase URL Configuration:**
   ```
   https://supabase.com/dashboard/project/psjynbtdjsvoslkqiaie/auth/url-configuration
   ```

2. **Update "Site URL":**
   - Change from: `http://localhost:3000`
   - Change to: `http://localhost:5173` (or your actual port)

3. **Update "Redirect URLs":**
   - Click "Add URL" or edit existing
   - Add: `http://localhost:5173/auth/callback`
   - You can add multiple URLs for different ports:
     ```
     http://localhost:3000/auth/callback
     http://localhost:5173/auth/callback
     http://localhost:5174/auth/callback
     ```

4. **Save Changes**

### Step 3: Update OAuth Provider Settings

#### Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", make sure you have:
   ```
   https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
   ```
   (No need to add localhost - Supabase handles that)

#### Facebook Developer Console:
1. Go to your app settings
2. Facebook Login → Settings
3. Make sure "Valid OAuth Redirect URIs" has:
   ```
   https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
   ```

---

## 🧪 Testing After Fix

1. **Clear your browser cache** (important!)
2. Go to: `http://localhost:5173/login` (use your correct port)
3. Click "Continue with Google"
4. Authenticate
5. Should redirect to: `http://localhost:5173/auth/callback`
6. Then to: `http://localhost:5173/toll`
7. ✅ You're logged in!

---

## 🚀 Alternative: Quick Test on Port 3000

If you want to test immediately without changing Supabase settings:

1. **Update your vite.config.ts:**
   ```typescript
   export default defineConfig({
     server: {
       port: 3000
     },
     plugins: [react(), tailwindcss()],
     // ... rest of config
   })
   ```

2. **Restart your dev server**

3. **Access app at:** `http://localhost:3000`

4. **Try OAuth login again** - should work now!

---

## 📋 Current URL Structure

### OAuth Flow:
```
1. User clicks "Login with Google"
   → http://localhost:XXXX/login

2. Redirects to Google
   → https://accounts.google.com/...

3. Google authenticates user
   
4. Google redirects to Supabase
   → https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback

5. Supabase redirects to your app (using Site URL setting)
   → http://localhost:XXXX/auth/callback#access_token=...

6. AuthCallback processes login

7. Final redirect to dashboard
   → http://localhost:XXXX/toll
```

The **"Site URL"** in Step 5 must match your app's actual URL!

---

## ⚠️ Common Issues

### Issue: Still redirecting to wrong port after changing Site URL
**Solution:** 
- Clear browser cache
- Try incognito/private mode
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Invalid redirect URI" error
**Solution:**
- Verify Supabase callback is in Google/Facebook console
- Should be: `https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback`
- NOT your localhost URL

### Issue: Tokens in URL but not logging in
**Solution:**
- Check browser console for errors
- Supabase client should automatically process hash params
- Make sure you're on the `/auth/callback` route

---

## 🎯 Quick Checklist

- [ ] Identified actual app port (check browser URL)
- [ ] Updated Supabase Site URL to match
- [ ] Added redirect URLs to Supabase
- [ ] Verified Google Console has Supabase callback URL
- [ ] Verified Facebook has Supabase callback URL
- [ ] Cleared browser cache
- [ ] Tested OAuth login
- [ ] Successfully redirected to dashboard

---

## 💡 For Production

When deploying:

1. **Update Supabase Site URL to production domain:**
   ```
   https://your-domain.com
   ```

2. **Add production redirect URLs:**
   ```
   https://your-domain.com/auth/callback
   ```

3. **Update Google OAuth redirect:**
   ```
   https://your-domain.com/auth/callback
   ```

4. **Update Facebook OAuth redirect:**
   ```
   https://your-domain.com/auth/callback
   ```

---

## ✅ Summary

**The fix is simple:** Update Supabase's "Site URL" to match your app's actual port.

1. Find your port (check browser)
2. Update in Supabase dashboard
3. Test OAuth login
4. Should work perfectly!

**OAuth is already working** - you got the tokens! Just need the redirect configured correctly. 🎉

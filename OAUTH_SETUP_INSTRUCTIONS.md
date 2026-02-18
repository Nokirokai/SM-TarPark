# 🔐 OAuth Setup Instructions (Google & Facebook)

## Overview
Your SM TarPark system supports OAuth login through Google and Facebook. This guide walks you through configuring both providers in Supabase.

---

## 🔵 Google OAuth Setup

### Step 1: Configure Google OAuth in Supabase

1. **Go to Supabase Authentication Settings:**
   - Visit: https://supabase.com/dashboard/project/psjynbtdjsvoslkqiaie/auth/providers
   
2. **Enable Google Provider:**
   - Find "Google" in the providers list
   - Click to enable it
   
3. **Add Your Google Client ID:**
   ```
   Client ID: 35236336690-f6se3j0dcn8m3vk6urk21beq3qmp4vpk.apps.googleusercontent.com
   ```
   
4. **Get Your Client Secret:**
   - Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID
   - Copy the **Client Secret**
   - Paste it into Supabase
   
5. **Set Redirect URL in Google Cloud Console:**
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add this to **Authorized redirect URIs:**
   ```
   https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
   ```
   
6. **Save both configurations**

### Google OAuth - Additional Configuration

In Google Cloud Console, ensure these settings:
- **Authorized JavaScript origins:**
  ```
  https://psjynbtdjsvoslkqiaie.supabase.co
  http://localhost:5173
  ```
  
- **Authorized redirect URIs:**
  ```
  https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
  http://localhost:5173/auth/callback
  ```

---

## 🔵 Facebook OAuth Setup

### Step 1: Create Facebook App (if you haven't already)

1. **Go to Facebook Developers:**
   - Visit: https://developers.facebook.com/apps/
   
2. **Create New App:**
   - Click "Create App"
   - Select "Consumer" or "Business" type
   - Fill in app details
   
3. **Get App ID and App Secret:**
   - Once created, go to Settings > Basic
   - Copy your **App ID**
   - Copy your **App Secret** (click "Show")

### Step 2: Configure Facebook Login

1. **Add Facebook Login Product:**
   - In your Facebook App dashboard
   - Go to "Add Products"
   - Click "Set Up" on "Facebook Login"
   
2. **Configure OAuth Redirect URIs:**
   - Go to Facebook Login > Settings
   - Add this to "Valid OAuth Redirect URIs":
   ```
   https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
   ```
   - Save changes

### Step 3: Configure Facebook in Supabase

1. **Go to Supabase Authentication Settings:**
   - Visit: https://supabase.com/dashboard/project/psjynbtdjsvoslkqiaie/auth/providers
   
2. **Enable Facebook Provider:**
   - Find "Facebook" in the providers list
   - Click to enable it
   
3. **Add Facebook Credentials:**
   - **Client ID:** [Your Facebook App ID]
   - **Client Secret:** [Your Facebook App Secret]
   
4. **Save configuration**

---

## 🔄 How OAuth Flow Works

1. **User clicks "Continue with Google" or "Continue with Facebook"**
2. **Supabase redirects to OAuth provider (Google/Facebook)**
3. **User authenticates with provider**
4. **Provider redirects back to:** `/auth/callback`
5. **AuthCallback page processes the login**
6. **User is redirected based on role:**
   - Admin → `/admin`
   - Toll → `/toll`
   - Default → `/toll`

---

## 🧪 Testing OAuth Login

### Test Google OAuth:
1. Click "Continue with Google" on login page
2. Select your Google account
3. Grant permissions
4. You should be redirected to `/auth/callback`
5. Then automatically redirected to dashboard

### Test Facebook OAuth:
1. Click "Continue with Facebook/GCash"
2. Login with Facebook credentials
3. Grant permissions
4. You should be redirected to `/auth/callback`
5. Then automatically redirected to dashboard

---

## ⚠️ Common Issues & Fixes

### Issue 1: "provider is not enabled" error
**Fix:** Enable the provider in Supabase Authentication Settings

### Issue 2: Redirect URI mismatch
**Fix:** Ensure redirect URIs match exactly in both provider console and Supabase:
```
https://psjynbtdjsvoslkqiaie.supabase.co/auth/v1/callback
```

### Issue 3: OAuth login works but user has no role
**Solution:** After first OAuth login, update user metadata:
1. Go to Supabase Authentication > Users
2. Find the user
3. Edit user metadata to add:
   ```json
   {
     "name": "User Name",
     "role": "toll"
   }
   ```

### Issue 4: "Invalid client_id" error
**Fix:** 
- For Google: Verify Client ID in Google Cloud Console
- For Facebook: Verify App ID in Facebook Developer Console

---

## 📋 Quick Checklist

### Google OAuth Setup:
- [ ] Google Provider enabled in Supabase
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] Redirect URI added to Google Cloud Console
- [ ] Tested login flow

### Facebook OAuth Setup:
- [ ] Facebook App created
- [ ] Facebook Login product added
- [ ] Facebook Provider enabled in Supabase
- [ ] App ID added to Supabase
- [ ] App Secret added to Supabase
- [ ] Redirect URI added to Facebook App Settings
- [ ] Tested login flow

---

## 🎯 Default User Roles for OAuth

When users sign in via OAuth for the first time, they won't have a role assigned. You have two options:

### Option 1: Manual Role Assignment (Recommended for staff)
After OAuth login, admin manually assigns role in Supabase dashboard

### Option 2: Auto-assign Default Role (Toll Personnel)
Modify AuthCallback.tsx to auto-assign role on first login

### Option 3: Role Selection Page
Create a role selection page after first OAuth login

---

## 🚀 Production Deployment

When deploying to production:

1. **Update redirect URIs in provider consoles to use production domain:**
   ```
   https://your-production-domain.com/auth/callback
   ```

2. **Update Supabase Site URL:**
   - Go to Supabase Authentication Settings
   - Update "Site URL" to your production URL

3. **Test OAuth flows in production environment**

---

## 📞 Support Resources

- **Supabase OAuth Docs:** https://supabase.com/docs/guides/auth/social-login
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Facebook Login Docs:** https://developers.facebook.com/docs/facebook-login

---

## ✅ Current Status

- ✅ OAuth code implementation ready
- ✅ AuthCallback page created
- ✅ Google Client ID provided
- ⚠️ **Needs:** Google Client Secret configuration in Supabase
- ⚠️ **Needs:** Facebook App ID and Secret configuration in Supabase

**Next Step:** Configure providers in Supabase dashboard using the instructions above.

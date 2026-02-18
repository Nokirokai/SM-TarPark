# OAuth Setup Guide for SM TarPark

## 🎉 Your SM TarPark system now supports OAuth authentication!

The following OAuth providers are integrated:
- ✅ **Google OAuth** - Sign in with Google accounts
- ✅ **GitHub OAuth** - Sign in with GitHub accounts  
- ✅ **Facebook OAuth** - Sign in with Facebook (can be used for GCash integration)

---

## 📋 Prerequisites

You mentioned you've already enabled auth hooks and OAuth in your Supabase backend. Now you need to configure each OAuth provider.

---

## 🔧 Configuration Steps

### 1. **Google OAuth Setup**

#### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For **Application type**, select **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
8. Copy your **Client ID** and **Client Secret**

#### Step 2: Configure in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and toggle it **ON**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

#### Reference:
📖 [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

### 2. **GitHub OAuth Setup**

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: SM TarPark
   - **Homepage URL**: `https://your-app-domain.com`
   - **Authorization callback URL**:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy your **Client ID** and generate a **Client Secret**

#### Step 2: Configure in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and toggle it **ON**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

#### Reference:
📖 [Supabase GitHub OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-github)

---

### 3. **Facebook OAuth Setup** (for GCash Integration)

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App**
3. Select **Consumer** as the app type
4. Fill in app details
5. Add **Facebook Login** product to your app
6. Configure **Facebook Login Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
7. Copy your **App ID** and **App Secret**

#### Step 2: Configure in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Facebook** and toggle it **ON**
4. Paste your **App ID** as Client ID and **App Secret** as Client Secret
5. Click **Save**

#### Reference:
📖 [Supabase Facebook OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

---

## 🚀 Testing OAuth Login

### Test Flow:
1. Go to your login page: `/login`
2. Click one of the OAuth buttons:
   - "Continue with Google"
   - "Continue with GitHub"
   - "Continue with Facebook/GCash"
3. You'll be redirected to the OAuth provider
4. After authentication, you'll return to `/auth/callback`
5. You'll be automatically redirected to the appropriate dashboard

### Expected Behavior:
- ✅ OAuth button click → Provider login page
- ✅ Provider authentication → Redirect back to app
- ✅ App processes OAuth callback → User logged in
- ✅ Redirect to dashboard based on user role

---

## 🔒 Security Notes

### Redirect URLs
The system is configured to redirect to:
```
${window.location.origin}/auth/callback
```

This means:
- **Local development**: `http://localhost:3000/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

**Important**: Make sure to add BOTH URLs to your OAuth provider settings during development and production.

### Session Management
- OAuth sessions are managed by Supabase Auth
- Sessions persist in browser local storage
- Auth state changes are automatically detected
- Users can sign out from any device

---

## 🎨 UI Features

### Login Page Enhancements:
1. **Three OAuth buttons** with proper branding:
   - Google (with official Google colors)
   - GitHub (with GitHub branding)
   - Facebook/GCash (blue theme for Filipino market)

2. **Loading states** during OAuth redirect
3. **Error handling** with toast notifications
4. **Seamless callback** handling

### Auth Callback Page:
- Shows loading spinner
- Displays "Completing login..." message
- Auto-redirects after 1.5 seconds
- Routes users based on role

---

## 🛠️ Backend Configuration

### Auth Hooks (Already Enabled)
Your backend already supports:
- ✅ User creation on OAuth signup
- ✅ Session management
- ✅ JWT token verification
- ✅ Auth state changes

### Endpoints:
- `POST /auth/signup` - Email/password signup
- OAuth handled by Supabase Auth directly
- Session verification on protected routes

---

## 🌐 User Metadata

When users sign up with OAuth, their profile data is automatically populated:
```javascript
{
  email: "user@example.com",
  user_metadata: {
    name: "John Doe",
    avatar_url: "https://...",
    provider: "google" // or "github", "facebook"
  }
}
```

You can extend this in the future to store user roles and preferences.

---

## 📊 Next Steps

### 1. **Configure OAuth Providers**
   - Set up Google OAuth credentials
   - Set up GitHub OAuth app
   - Set up Facebook OAuth app (optional)

### 2. **Update Redirect URLs**
   - Add development URL to all providers
   - Add production URL when deploying

### 3. **Test Each Provider**
   - Test Google login flow
   - Test GitHub login flow
   - Test Facebook login flow

### 4. **Customize User Experience**
   - Add role selection after OAuth signup
   - Customize user profiles based on provider
   - Add additional metadata fields

### 5. **Production Deployment**
   - Update OAuth redirect URLs with production domain
   - Test all OAuth flows in production
   - Monitor auth errors in Supabase dashboard

---

## ⚠️ Important Reminders

1. **Provider Setup Required**: OAuth won't work until you configure credentials in Supabase
2. **Redirect URLs Must Match**: Ensure redirect URLs match exactly in both OAuth app and Supabase
3. **HTTPS Required**: OAuth providers require HTTPS in production (localhost is okay for dev)
4. **Rate Limits**: Be aware of OAuth provider rate limits during testing
5. **User Consent**: Users must grant permissions on first OAuth login

---

## 🆘 Troubleshooting

### "Provider is not enabled" Error
- ✅ Enable the provider in Supabase Dashboard
- ✅ Configure Client ID and Client Secret
- ✅ Click Save in Supabase settings

### "Redirect URI mismatch" Error
- ✅ Check OAuth app settings
- ✅ Verify redirect URL matches: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- ✅ Include both http (dev) and https (prod) URLs

### OAuth Works But No User Data
- ✅ Check Supabase Auth logs
- ✅ Verify user_metadata is populated
- ✅ Check console for auth state changes

### Stuck on Callback Page
- ✅ Clear browser cache and cookies
- ✅ Check browser console for errors
- ✅ Verify AuthContext is properly set up
- ✅ Check that onAuthStateChange listener is working

---

## 📞 Support Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **GitHub OAuth Docs**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Facebook OAuth Docs**: https://developers.facebook.com/docs/facebook-login

---

## ✅ Checklist

Use this checklist to track your OAuth setup:

- [ ] Google OAuth credentials created
- [ ] Google OAuth configured in Supabase
- [ ] Google login tested successfully
- [ ] GitHub OAuth app created
- [ ] GitHub OAuth configured in Supabase
- [ ] GitHub login tested successfully
- [ ] Facebook OAuth app created (optional)
- [ ] Facebook OAuth configured in Supabase
- [ ] Facebook login tested successfully
- [ ] Production redirect URLs configured
- [ ] All OAuth flows tested in production

---

**Happy coding! 🚀**

Your SM TarPark system is now ready for OAuth authentication. Just complete the provider configurations in Supabase and you're good to go!

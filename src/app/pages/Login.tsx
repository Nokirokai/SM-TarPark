import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { LogIn, User, Lock, Github, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { signIn = async () => { throw new Error('Auth not ready'); }, signInWithOAuth = async () => { throw new Error('Auth not ready'); } } = auth || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'toll' | 'admin'>('toll');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill credentials when role changes
  const fillCredentials = (selectedRole: 'toll' | 'admin') => {
    if (selectedRole === 'admin') {
      setEmail('admin@smtarpark.com');
      setPassword('Admin123!');
    } else {
      setEmail('toll@smtarpark.com');
      setPassword('Toll123!');
    }
  };

  const handleResetAccounts = async () => {
    setResetting(true);
    setError('');
    try {
      const result = await authAPI.resetAccounts();
      toast.success('Default accounts reset successfully! You can now login.');
      console.log('Reset result:', result);
      // Auto-fill based on current role selection
      fillCredentials(role);
    } catch (err: any) {
      console.error('Reset accounts error:', err);
      setError('Failed to reset accounts: ' + err.message);
      toast.error('Failed to reset accounts');
    } finally {
      setResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await signIn(email, password);
      
      toast.success('Logged in successfully!');
      
      // Navigate based on role from server response
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/toll');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'facebook') => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithOAuth(provider);
      toast.info(`Redirecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
    } catch (err: any) {
      console.error('OAuth login error:', err);
      
      if (err.message?.includes('not enabled')) {
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured yet. Please ask admin to enable it in Supabase settings.`);
        toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login not configured`);
      } else {
        setError(err.message || `Failed to login with ${provider}`);
        toast.error(`Failed to login with ${provider}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 blur-3xl rounded-full" 
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Theme Toggle - Fixed Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl glow-sm"
            >
              <span className="text-white font-black text-2xl">SM</span>
            </motion.div>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-2">SM TarPark</h1>
          <p className="text-muted-foreground font-semibold">Smart Parking Management System</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-black text-foreground mb-6">Staff Login</h2>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                Login as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole('toll');
                    fillCredentials('toll');
                  }}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    role === 'toll'
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg glow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted border border-border'
                  }`}
                >
                  Toll Personnel
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole('admin');
                    fillCredentials('admin');
                  }}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    role === 'admin'
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg glow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted border border-border'
                  }`}
                >
                  Administrator
                </motion.button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@smtarlac.com"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded accent-primary" />
                <span className="text-muted-foreground font-semibold">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-accent font-bold transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" loading={loading} className="w-full py-3 bg-gradient-to-br from-primary to-blue-600 hover:from-blue-600 hover:to-primary shadow-lg glow-sm">
                <LogIn className="w-5 h-5" />
                Login
              </Button>
            </motion.div>
          </form>

          {/* OAuth Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground font-semibold">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {/* Google OAuth */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="w-full px-4 py-3 border border-border rounded-xl hover:bg-secondary transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-card"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-foreground">Continue with Google</span>
                </div>
              </motion.button>

              {/* GitHub OAuth */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <Github className="w-5 h-5" />
                  <span>Continue with GitHub</span>
                </div>
              </motion.button>

              {/* Facebook OAuth */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-card"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Reset Accounts */}
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetAccounts}
              className="text-sm text-muted-foreground hover:text-primary font-semibold transition-colors"
              disabled={resetting}
            >
              <RefreshCw className={`w-4 h-4 inline-block mr-1 ${resetting ? 'animate-spin' : ''}`} />
              Reset default accounts
            </motion.button>
          </div>

          {/* Public Access */}
          <div className="mt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/public')}
              className="text-sm text-primary hover:text-accent font-bold transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              View public parking availability
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-muted-foreground text-sm font-semibold">
            © 2026 SM Tarlac. All rights reserved.
          </p>
          <h3 className="text-primary text-sm font-black uppercase tracking-wide">
            Website by Angel Bitangcol
          </h3>
        </motion.div>
      </div>
    </div>
  );
}
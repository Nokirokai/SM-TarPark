import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { oauthHelpers } from '../../utils/supabaseClient';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const { exchangeOAuthToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Wait for Supabase to process the OAuth callback
        if (window.location.hash || window.location.search.includes('code=')) {
          // Give Supabase SDK time to process the redirect
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Get the Supabase session from OAuth
        const supabaseSession = await oauthHelpers.getSession();

        if (supabaseSession?.access_token) {
          // Exchange the Supabase token for our server session
          const user = await exchangeOAuthToken(supabaseSession.access_token);

          toast.success(`Welcome, ${user.name}!`);

          // Navigate based on role
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/toll', { replace: true });
          }
        } else {
          // No session after OAuth - something went wrong
          toast.error('Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error processing OAuth callback:', error);
        toast.error('An error occurred during login: ' + (error.message || 'Unknown error'));
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    if (isProcessing) {
      processOAuthCallback();
    }
  }, [navigate, isProcessing, exchangeOAuthToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-800 font-bold text-2xl">SM</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">SM TarPark</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-white text-lg">Completing login...</p>
        </div>
      </div>
    </div>
  );
}

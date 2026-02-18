import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getSessionToken } from '../../utils/supabaseClient';
import { healthCheck, slotsAPI, authAPI } from '../../services/api';
import { toast } from 'sonner';

export function DebugAuth() {
  const { user } = useAuth();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [serverHealth, setServerHealth] = useState<boolean | null>(null);
  const [slotsTest, setSlotsTest] = useState<boolean | null>(null);
  const [authMeTest, setAuthMeTest] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const runDiagnostics = async () => {
    setChecking(true);
    
    // Check session token
    const token = getSessionToken();
    setSessionToken(token);
    console.log('Session Token:', token ? `${token.substring(0, 30)}...` : 'NULL');

    // Check server health
    try {
      await healthCheck();
      setServerHealth(true);
      console.log('Server health check passed');
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerHealth(false);
    }

    // Check slots API (public, no auth needed)
    try {
      const response = await slotsAPI.getAll() as any;
      setSlotsTest(!!response.slots);
      console.log('Slots API test passed:', response.slots?.length, 'slots');
    } catch (error) {
      console.error('Slots API test failed:', error);
      setSlotsTest(false);
    }

    // Check auth/me endpoint (requires session token)
    if (token) {
      try {
        await authAPI.me();
        setAuthMeTest(true);
        console.log('Auth/me test passed - session is valid');
      } catch (error) {
        console.error('Auth/me test failed:', error);
        setAuthMeTest(false);
      }
    } else {
      setAuthMeTest(null);
    }

    setChecking(false);
    toast.success('Diagnostics complete');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Diagnostics</h1>
          <p className="text-gray-600 mt-1">Debug session and API connection issues</p>
          <p className="text-sm text-green-700 mt-2 bg-green-50 px-3 py-1 rounded inline-block">
            Using server-managed session tokens (no JWT)
          </p>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Status</h2>
            <Button onClick={runDiagnostics} disabled={checking}>
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {/* User Authentication Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {user ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">User Authentication</p>
                {user ? (
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <p>Logged in as: <span className="font-mono">{user.email}</span></p>
                    <p>User ID: <span className="font-mono">{user.id}</span></p>
                    <p>Name: <span className="font-mono">{user.name}</span></p>
                    <p>Role: <span className="font-mono">{user.role}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 mt-1">Not logged in</p>
                )}
              </div>
            </div>

            {/* Session Token Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {sessionToken ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Server Session Token</p>
                {sessionToken ? (
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <p>Token stored in localStorage</p>
                    <p className="font-mono text-xs break-all">
                      {sessionToken.substring(0, 50)}...
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 mt-1">No session token found</p>
                )}
              </div>
            </div>

            {/* Auth/Me Test */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {authMeTest === null ? (
                <AlertTriangle className="w-6 h-6 text-gray-400 flex-shrink-0" />
              ) : authMeTest ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Server Session Validation</p>
                {authMeTest === null ? (
                  <p className="text-sm text-gray-600 mt-1">No token to test</p>
                ) : authMeTest ? (
                  <p className="text-sm text-green-600 mt-1">Session is valid on server</p>
                ) : (
                  <p className="text-sm text-red-600 mt-1">Session invalid or expired</p>
                )}
              </div>
            </div>

            {/* Server Health */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {serverHealth === null ? (
                <AlertTriangle className="w-6 h-6 text-gray-400 flex-shrink-0 animate-pulse" />
              ) : serverHealth ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Server Health</p>
                {serverHealth === null ? (
                  <p className="text-sm text-gray-600 mt-1">Checking...</p>
                ) : serverHealth ? (
                  <p className="text-sm text-green-600 mt-1">Server is reachable</p>
                ) : (
                  <p className="text-sm text-red-600 mt-1">Server is not responding</p>
                )}
              </div>
            </div>

            {/* Slots API Test */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {slotsTest === null ? (
                <AlertTriangle className="w-6 h-6 text-gray-400 flex-shrink-0 animate-pulse" />
              ) : slotsTest ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Parking Slots API</p>
                {slotsTest === null ? (
                  <p className="text-sm text-gray-600 mt-1">Checking...</p>
                ) : slotsTest ? (
                  <p className="text-sm text-green-600 mt-1">API is working</p>
                ) : (
                  <p className="text-sm text-red-600 mt-1">API request failed</p>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How Session Auth Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. You log in with email/password via the server</li>
              <li>2. Server verifies credentials with Supabase</li>
              <li>3. Server creates a session token stored in KV</li>
              <li>4. Frontend stores the session token in localStorage</li>
              <li>5. All API requests send this token (no JWT involved)</li>
              <li>6. Server validates the token by looking it up in KV</li>
            </ul>
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
          <div className="prose prose-sm max-w-none">
            <ol className="space-y-2 text-gray-700">
              <li>Not logged in? Go to <a href="/login" className="text-blue-800 underline font-semibold">/login</a></li>
              <li>Session expired? Log out and log back in</li>
              <li>Server not responding? Wait a moment and refresh</li>
              <li>Use the default credentials: admin@smtarpark.com / Admin123!</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}

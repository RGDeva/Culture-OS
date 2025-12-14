'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { handlePostLogin } from '@/lib/auth-utils';

type DebugInfo = {
  time: string;
  message: string;
  data?: string | null;
};

declare global {
  interface Window {
    debugLog: (message: string, data?: any) => void;
  }
}

// Safe debug logging function for SSR
const debugLog = (message: string, data?: any) => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage, data || '');
  
  try {
    const logs = JSON.parse(localStorage.getItem('login-debug-logs') || '[]');
    logs.push({ 
      timestamp, 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null 
    });
    localStorage.setItem('login-debug-logs', JSON.stringify(logs.slice(-50)));
  } catch (e) {
    console.error('Failed to store debug log:', e);
  }
};

export default function LoginPage() {
  const { ready, authenticated, user, getAccessToken, login, logout } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  
  const addDebugInfo = useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = new Date().toISOString();
    const newEntry = {
      time: timestamp.split('T')[1].split('.')[0],
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    setDebugInfo(prev => [...prev.slice(-9), newEntry]);
    debugLog(`[LoginPage] ${message}`, data);
  }, []);

  // Handle wallet connection and authentication
  const handleWalletConnect = useCallback(async () => {
    if (!ready) {
      setError('Authentication service not ready. Please try again.');
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    setStatus('Connecting wallet...');
    addDebugInfo('Initiating wallet connection');

    try {
      // First, log out any existing session to ensure a clean state
      await logout();
      addDebugInfo('Logged out existing session');
      
      // Initiate the wallet connection
      await login();
      addDebugInfo('Login initiated');
      setStatus('Authentication in progress...');
      
      addDebugInfo('Wallet connection initiated');
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message.includes('User rejected') 
        ? 'Connection cancelled by user' 
        : 'Failed to connect wallet. Please try again.';
      
      addDebugInfo('Wallet connection error', { 
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      setError(errorMessage);
      setIsLoggingIn(false);
      setStatus('Ready to connect');
    }
  }, [ready, login, logout, addDebugInfo]);

  // Handle authentication state changes
  useEffect(() => {
    if (!ready) {
      setStatus('Initializing authentication...');
      addDebugInfo('Privy not ready yet');
      return;
    }
    
    const checkAuthStatus = async () => {
      setStatus('Checking authentication status...');
      addDebugInfo(`Auth check - Authenticated: ${authenticated}, User: ${!!user}`);
      
      try {
        if (authenticated && user) {
          setStatus('Authenticated, setting up session...');
          addDebugInfo('User authenticated, setting up session', { 
            userId: user.id,
            wallet: user.wallet
          });
          
          setIsLoading(true);
          
          try {
            const token = await getAccessToken();
            if (!token) {
              throw new Error('No access token available');
            }
            
            addDebugInfo('Access token retrieved, handling post-login...');
            setStatus('Completing login...');
            
            const { success, error: loginError } = await handlePostLogin(
              async () => token,
              router,
              redirectTo
            );
            
            if (!success) {
              addDebugInfo('Error in handlePostLogin', { error: loginError });
              setError(loginError || 'Failed to complete login. Please try again.');
              setStatus('Login incomplete');
            } else {
              addDebugInfo('Login flow completed successfully');
            }
          } catch (err) {
            const error = err as Error;
            addDebugInfo('Error during auth check', { 
              message: error.message, 
              stack: error.stack 
            });
            setError('An error occurred during authentication. Please try again.');
            setStatus('Error occurred');
          } finally {
            setIsLoading(false);
          }
        } else {
          setStatus('Ready to connect');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setError('Failed to check authentication status');
        setStatus('Error occurred');
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [ready, authenticated, user, getAccessToken, router, redirectTo, addDebugInfo]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold text-red-400">Login Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleWalletConnect}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                'Try Again'
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
          {/* Debug info section */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg text-left">
              <div className="text-green-400 font-mono mb-2">Debug Info:</div>
              {debugInfo.map((info, i) => (
                <div key={i} className="text-gray-400 border-b border-gray-700 py-1">
                  <span className="text-green-300">[{info.time}]</span> {info.message}
                  {info.data && (
                    <pre className="text-xs mt-1 text-gray-500 overflow-x-auto">
                      {info.data}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main login view
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-2">NoCulture OS</h1>
          <p className="text-gray-400">Sign in to access your intelligence dashboard</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-green-400/20 p-8">
          <button
            onClick={handleWalletConnect}
            disabled={isLoggingIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting Wallet...</span>
              </>
            ) : (
              <span>Sign In with Privy</span>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-green-400 hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-green-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

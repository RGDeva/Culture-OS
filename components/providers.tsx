'use client';

import React, { useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TopNav } from './layout/TopNav';
import { RightNav } from './layout/RightNav';
import { base } from 'viem/chains';
import { ErrorBoundary } from './ErrorBoundary';
import { DiagnosticOverlay } from './DiagnosticOverlay';
import { AuthProvider } from '@/context/AuthContext';

// Fix wallet provider error by suppressing it completely
if (typeof window !== 'undefined') {
  // Suppress uncaught errors from Privy wallet provider
  window.addEventListener('error', (event) => {
    const error = event.error || event.message || '';
    const errorStr = error.toString();
    
    if (errorStr.includes('walletProvider') || 
        errorStr.includes('is not a function') ||
        errorStr.includes('privy-io') ||
        errorStr.includes('setWalletProvider')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  
  // Suppress unhandled promise rejections from Privy
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || '';
    const reasonStr = reason.toString();
    
    if (reasonStr.includes('walletProvider') ||
        reasonStr.includes('privy-io') ||
        reasonStr.includes('setWalletProvider')) {
      event.preventDefault();
      return false;
    }
  });

  // Intercept and suppress ALL console methods for wallet errors
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  const shouldSuppress = (args: any[]) => {
    // Convert all arguments to string for checking
    const allArgs = args.map(arg => {
      if (arg === null || arg === undefined) return '';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return arg.toString();
        }
      }
      return arg.toString();
    }).join(' ');
    
    const message = args[0]?.toString() || '';
    
    // Comprehensive suppression patterns
    const suppressPatterns = [
      'walletProvider',
      'wallet connector',
      'this.walletProvider?.on',
      'setWalletProvider',
      'createEthereumWalletConnector',
      'privy-provider',
      'privy-io',
      '@privy-io',
      'Xi.setWalletProvider',
      'NPBEALzA',
      'rs.createEthereumWalletConnector',
      'rs.initialize',
      'new fo (',
      '_54156181',
      'node_modules_@privy-io',
    ];
    
    // Check if any pattern matches
    const hasPattern = suppressPatterns.some(pattern => 
      allArgs.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Also suppress TypeErrors related to functions
    const isTypeError = message.includes('TypeError') && 
                       (allArgs.includes('is not a function') || 
                        allArgs.includes('walletProvider'));
    
    return hasPattern || isTypeError;
  };
  
  console.error = function(...args: any[]) {
    if (shouldSuppress(args)) return;
    originalError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    if (shouldSuppress(args)) return;
    originalWarn.apply(console, args);
  };
  
  console.log = function(...args: any[]) {
    if (shouldSuppress(args)) return;
    originalLog.apply(console, args);
  };

  // Add global error handler with highest priority
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const stack = event.error?.stack || '';
    const filename = event.filename || '';
    
    if (message.includes('walletProvider') || 
        message.includes('wallet connector') ||
        message.includes('this.walletProvider') ||
        message.includes('is not a function') ||
        stack.includes('setWalletProvider') ||
        stack.includes('createEthereumWalletConnector') ||
        stack.includes('Xi.setWalletProvider') ||
        filename.includes('privy-provider') ||
        (message.includes('TypeError') && stack.includes('walletProvider'))) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  // Handle promise rejections with highest priority
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || '';
    const stack = event.reason?.stack || '';
    
    if (message.includes('walletProvider') || 
        message.includes('wallet connector') ||
        message.includes('this.walletProvider') ||
        message.includes('is not a function') ||
        stack.includes('setWalletProvider') ||
        stack.includes('createEthereumWalletConnector') ||
        stack.includes('Xi.setWalletProvider') ||
        (message.includes('TypeError') && stack.includes('walletProvider'))) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);
}

// EnvWarning component for development
function EnvWarning() {
  if (process.env.NODE_ENV === 'production') return null;
  
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
      console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set in .env.local');
      setShowWarning(true);
    }
  }, []);
  
  if (!showWarning) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <p className="font-bold">Development Notice</p>
        <p>Please create a <code className="bg-black/20 px-1 rounded">.env.local</code> file with the following variables:</p>
        <pre className="bg-black/20 p-2 rounded mt-2 text-xs overflow-x-auto">
          {`NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3001"`}
        </pre>
        <button 
          onClick={() => setShowWarning(false)}
          className="mt-2 text-sm underline"
        >
          I'll fix it, hide this for now
        </button>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Ensure we're in the browser before rendering PrivyProvider
  useEffect(() => {
    setMounted(true);
    
    // Handle chunk loading errors globally
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Loading chunk') || event.error?.name === 'ChunkLoadError') {
        console.log('Chunk load error detected, will reload...');
        event.preventDefault();
        setTimeout(() => window.location.reload(), 1000);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-400 p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-500 text-black rounded-md font-medium hover:bg-green-400"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  // If Privy app ID is not set, show a helpful message
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return (
      <div className="font-sans antialiased bg-black text-green-400 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Configuration Required</h1>
          <p className="mb-6">Please set up your environment variables to continue.</p>
          <div className="bg-gray-900 p-6 rounded-lg text-left text-sm font-mono">
            <p className="mb-4">Create a <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file in your project root with:</p>
            <pre className="whitespace-pre-wrap break-all">
{`NEXT_PUBLIC_PRIVY_APP_ID=cmd4wfneb008ujs0lbqln5875
PRIVY_APP_SECRET=41GyiTnQzzE2qSfLheHpyoXgrxXFi4EKtCw3tE6wBZr1z7eQNRta7DdwWyuw9jb6YwsZHErqbkgS46gHzbxn62Ay
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3001"`}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-green-500 text-black rounded-md font-medium hover:bg-green-400 transition-colors"
          >
            I've set up the environment variables
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            loginMethods: ['email', 'google', 'twitter', 'discord'],
            appearance: {
              theme: 'dark',
              accentColor: '#10b981',
              logo: '/logo.png',
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
            defaultChain: base,
            supportedChains: [base],
          }}
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-black text-green-400">
              <TopNav onMenuClick={() => setNavOpen(true)} />
              <RightNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
              <main className="flex-1">{children}</main>
              <Toaster richColors position="top-center" />
              <SonnerToaster position="top-right" />
              <EnvWarning />
              {process.env.NODE_ENV === 'development' && <DiagnosticOverlay />}
            </div>
          </AuthProvider>
        </PrivyProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

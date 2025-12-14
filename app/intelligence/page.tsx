"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2 } from 'lucide-react';

/**
 * Intelligence Center - Redirects to Dashboard
 * The Intelligence Center is now integrated into the dashboard
 * with full Recoupable integration and onboarding flow.
 */
const IntelligenceCenter = () => {
  const router = useRouter();
  const privyHook = usePrivy();
  const { ready } = privyHook || {};

  useEffect(() => {
    if (ready) {
      // Redirect to dashboard which has the integrated Intelligence Center
      router.push('/dashboard');
    }
  }, [ready, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400">
      <div className="text-center font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-green-400 mx-auto mb-4" />
        <p>REDIRECTING_TO_INTELLIGENCE_CENTER...</p>
      </div>
    </div>
  );
};

export default IntelligenceCenter;

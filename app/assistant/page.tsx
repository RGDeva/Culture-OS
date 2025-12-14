'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AssistantView } from '@/components/intelligence/AssistantView';

export default function AssistantPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login?redirect=/assistant');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">AI Assistant</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[80vh] flex flex-col">
        <AssistantView />
      </div>
    </div>
  );
}

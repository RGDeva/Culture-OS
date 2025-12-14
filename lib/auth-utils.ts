import { useRouter } from 'next/navigation';

interface UserData {
  onboarded: boolean;
  [key: string]: any;
}

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const handlePostLogin = async (
  getAccessToken: () => Promise<string>,
  router: ReturnType<typeof useRouter>,
  redirectTo?: string
) => {
  try {
    // Get the access token
    const token = await getAccessToken();
    if (!token) {
      console.error('No access token available');
      // Redirect to dashboard anyway in demo mode
      router.push(redirectTo || '/dashboard');
      return { success: true, error: 'No access token - demo mode' };
    }

    // Get user data from our API with timeout
    try {
      const response = await fetchWithTimeout('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }, 2000); // 2 second timeout

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Failed to fetch user data, using fallback:', errorData);
        // Redirect to dashboard anyway
        router.push(redirectTo || '/dashboard');
        return { success: true, error: 'API error - using fallback' };
      }

      const userData: UserData = await response.json();
      
      // Redirect based on onboarding status
      if (userData.onboarded) {
        const redirectPath = redirectTo || '/dashboard';
        router.push(redirectPath);
      } else {
        const redirectPath = `/onboarding${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;
        router.push(redirectPath);
      }

      return { success: true, user: userData };
    } catch (fetchError) {
      // If API fails or times out, just redirect to dashboard
      console.warn('API timeout or error, redirecting anyway:', fetchError);
      router.push(redirectTo || '/dashboard');
      return { success: true, error: 'Timeout - using fallback' };
    }
  } catch (error) {
    console.error('Error in handlePostLogin:', error);
    // Always redirect even on error to prevent stuck state
    router.push(redirectTo || '/dashboard');
    return { success: true, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

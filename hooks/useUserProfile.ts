'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useErrorHandler } from '@/components/ErrorBoundary';

interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  bio?: string;
  image?: string;
  artistAccountId?: string;
  onboarded: boolean;
  socials?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export function useUserProfile() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!ready || !authenticated) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Handle 503 gracefully (Prisma not configured)
        if (response.status === 503) {
          console.warn('[PROFILE] Database not configured, using fallback');
          setProfile(null);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile({
        ...data,
        bio: data.socials?.bio || '',
        image: data.socials?.image || ''
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      console.error('[PROFILE] Error fetching profile:', error);
      setError(error);
      if (handleError) {
        handleError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated, getAccessToken, handleError]);

  const updateProfile = useCallback(async (updates: { name?: string; bio?: string; image?: string }) => {
    if (!ready || !authenticated) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updates.name,
          bio: updates.bio,
          image: updates.image
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(prev => ({
        ...prev,
        ...data,
        bio: data.bio || '',
        image: data.image || ''
      }));
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      handleError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [ready, authenticated, getAccessToken, handleError]);

  // Fetch profile when component mounts or dependencies change
  useEffect(() => {
    if (ready && authenticated) {
      fetchProfile();
    }
  }, [ready, authenticated, fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refresh: fetchProfile,
    updateProfile
  };
}

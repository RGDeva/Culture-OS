"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { RecoupClient } from '@/lib/recoup';

interface RecoupContextType {
  client: RecoupClient | null;
  isAuthenticated: boolean;
  login: (apiKey: string) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const RecoupContext = createContext<RecoupContextType | undefined>(undefined);

export function RecoupProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<RecoupClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('recoup_api_key');
    if (apiKey) {
      setClient(new RecoupClient(apiKey));
    }
    setLoading(false);
  }, []);

  const login = (apiKey: string) => {
    try {
      const newClient = new RecoupClient(apiKey);
      setClient(newClient);
      localStorage.setItem('recoup_api_key', apiKey);
      setError(null);
    } catch (err) {
      setError('Failed to initialize Recoup client');
      console.error(err);
    }
  };

  const logout = () => {
    setClient(null);
    localStorage.removeItem('recoup_api_key');
  };

  return (
    <RecoupContext.Provider
      value={{
        client,
        isAuthenticated: !!client,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </RecoupContext.Provider>
  );
}

export const useRecoup = () => {
  const context = useContext(RecoupContext);
  if (context === undefined) {
    throw new Error('useRecoup must be used within a RecoupProvider');
  }
  return context;
};

"use client";

import { useState } from 'react';
import { useRecoup } from '@/context/RecoupContext';

export const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useRecoup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    try {
      await login(apiKey);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-green-400/30 rounded p-6 max-w-2xl mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4">ENTER_RECOUP_API_KEY</h2>
      <p className="text-green-300/80 mb-6">
        To access the Intelligence Center, please enter your Recoup API key.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk_..."
            className="w-full bg-black/50 border border-green-400/30 rounded px-4 py-2 font-mono text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!apiKey.trim() || isLoading}
          className={`px-6 py-2 rounded font-mono font-bold ${
            !apiKey.trim() || isLoading
              ? 'bg-green-400/30 text-green-400/50 cursor-not-allowed'
              : 'bg-green-400 text-black hover:bg-green-300 transition-colors'
          }`}
        >
          {isLoading ? 'CONNECTING...' : 'CONNECT'}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t border-green-400/20 text-sm text-green-400/60">
        <p>Don't have a Recoup API key?</p>
        <a
          href="https://recoupable.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline mt-1 inline-block"
        >
          Get your API key →
        </a>
      </div>
    </div>
  );
};

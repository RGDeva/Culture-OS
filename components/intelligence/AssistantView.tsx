'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface AssistantContext {
  lastInteraction?: string;
  conversationHistory?: Array<{role: string, content: string}>;
  userPreferences?: Record<string, any>;
}

export const AssistantView = () => {
  const { getAccessToken, ready, authenticated } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AssistantContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. Ask me anything about your fans, posts, or analytics.',
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (ready && authenticated) {
      inputRef.current?.focus();
    }
  }, [ready, authenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !ready || !authenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sending',
    };

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get the user's auth token
      const token = await getAccessToken();
      
      // Call our API endpoint
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Update context with any new data from the API
      if (data.context) {
        setContext(prev => ({
          ...prev,
          ...data.context,
        }));
      }

      // Add assistant's response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || "I'm not sure how to respond to that.",
        timestamp: new Date(),
        status: 'sent',
      };

      // Update messages with both user and assistant messages
      setMessages(prev => [
        ...prev.slice(0, -1), // All messages except the last one
        {
          ...prev[prev.length - 1], // The last message (user's message)
          status: 'sent',
        },
        assistantMessage,
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the user's message to show error state
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          status: 'error',
        },
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
          status: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
            <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ask me anything about your fans, posts, or analytics
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : message.role === 'system'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-bl-none'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : message.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-green-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Assistant' : 'System'}
                </span>
                <span className="text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.status === 'sending' && (
                  <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                )}
                {message.status === 'error' && (
                  <span className="text-xs text-red-500">Error</span>
                )}
              </div>
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || !ready || !authenticated}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !ready || !authenticated}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        {!authenticated && (
          <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
            Please sign in to use the AI Assistant
          </p>
        )}
      </div>
    </div>
  );
};

export default AssistantView;

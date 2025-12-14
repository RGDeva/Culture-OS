"use client";

import { useState, useEffect } from 'react';
import { Loader2, Users, Heart, MessageSquare } from 'lucide-react';

export const DashboardView = () => {
  const [loading, setLoading] = useState(true);
  
  // Mock data
  const stats = [
    { title: 'TOTAL_FOLLOWERS', value: '12.4K', change: '+12.4%', icon: Users, trend: 'up' },
    { title: 'ENGAGEMENT_RATE', value: '8.2%', change: '+2.1%', icon: Heart, trend: 'up' },
    { title: 'AVG_LIKES', value: '1.2K', change: '-3.2%', icon: Heart, trend: 'down' },
    { title: 'AVG_COMMENTS', value: '142', change: '+5.7%', icon: MessageSquare, trend: 'up' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200); // Reduced from 800ms to 200ms
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        <span className="ml-2">LOADING_DASHBOARD...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="border border-green-400/30 rounded p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-green-300/80">{stat.title}</h3>
              <stat.icon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div className="flex items-end mt-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={`ml-2 text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Chart */}
      <div className="border border-green-400/30 rounded p-4">
        <h3 className="font-mono mb-4">ENGAGEMENT_OVERVIEW</h3>
        <div className="h-48 flex items-end space-x-1">
          {[20, 35, 45, 30, 60, 50, 75].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-400/30 rounded-t-sm" 
                style={{ height: `${value}%` }}
              />
              <span className="text-xs mt-1 text-green-400/60">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

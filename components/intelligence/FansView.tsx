"use client";

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Users, TrendingUp } from 'lucide-react';

interface FanLocation {
  city: string;
  country: string;
  count: number;
  percentage: number;
}

interface FanAnalytics {
  totalFans: number;
  growthRate: number;
  platformBreakdown: Record<string, number>;
  topLocations: FanLocation[];
}

export const FansView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<FanAnalytics | null>(null);

  useEffect(() => {
    const fetchFanAnalytics = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockData: FanAnalytics = {
          totalFans: 12480,
          growthRate: 12.4,
          platformBreakdown: {
            'Instagram': 45,
            'TikTok': 35,
            'YouTube': 12,
            'Twitter': 8
          },
          topLocations: [
            { city: 'New York', country: 'US', count: 1872, percentage: 15 },
            { city: 'Los Angeles', country: 'US', count: 1497, percentage: 12 },
            { city: 'Toronto', country: 'CA', count: 998, percentage: 8 },
          ]
        };
        
        setAnalytics(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch fan analytics:', err);
        setError('Failed to load fan analytics');
        setLoading(false);
      }
    };

    fetchFanAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        <span className="ml-2">LOADING_FAN_DATA...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="border border-red-400/30 bg-red-400/10 p-4 rounded text-red-400">
        {error || 'No data available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Fans */}
        <div className="border border-green-400/30 rounded p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-green-400 mr-2" />
            <h3 className="text-sm font-mono">TOTAL_FANS</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {analytics.totalFans.toLocaleString()}
          </p>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">
              +{analytics.growthRate}% from last month
            </span>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="border border-green-400/30 rounded p-4">
          <h3 className="text-sm font-mono mb-3">PLATFORM_BREAKDOWN</h3>
          <div className="space-y-2">
            {Object.entries(analytics.platformBreakdown).map(([platform, percentage]) => (
              <div key={platform} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>{platform}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-green-400/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-400 h-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Location */}
        <div className="border border-green-400/30 rounded p-4">
          <div className="flex items-center mb-3">
            <MapPin className="h-5 w-5 text-green-400 mr-2" />
            <h3 className="text-sm font-mono">TOP_LOCATION</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">
              {analytics.topLocations[0].city}, {analytics.topLocations[0].country}
            </p>
            <p className="text-green-400/80 text-sm">
              {analytics.topLocations[0].percentage}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="border border-green-400/30 rounded overflow-hidden">
        <div className="bg-green-400/10 p-3 border-b border-green-400/30">
          <h3 className="font-mono">TOP_LOCATIONS</h3>
        </div>
        <div className="divide-y divide-green-400/10">
          {analytics.topLocations.map((location, index) => (
            <div key={index} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{location.city}, {location.country}</p>
                <p className="text-sm text-green-400/60">{location.count.toLocaleString()} followers</p>
              </div>
              <span className="text-green-400">{location.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

"use client";

import { TrendingUp, Clock, BarChart2 } from 'lucide-react';

export const SummaryPanel = () => {
  const topPosts = [
    { id: 1, title: 'New single announcement', engagement: '12.4K' },
    { id: 2, title: 'Studio session', engagement: '8.7K' },
  ];

  return (
    <div className="space-y-6">
      <div className="border border-green-400/20 p-4 rounded">
        <h4 className="font-mono text-sm text-green-300 mb-3 flex items-center">
          <BarChart2 className="h-4 w-4 mr-2" />
          TOP_POSTS
        </h4>
        <div className="space-y-3">
          {topPosts.map((post) => (
            <div key={post.id} className="flex items-start">
              <div className="bg-green-400/10 text-green-400 text-xs w-6 h-6 flex items-center justify-center rounded mr-2 mt-0.5">
                {post.id}
              </div>
              <div>
                <p className="text-sm">{post.title}</p>
                <p className="text-xs text-green-400/60">{post.engagement} engagements</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-green-400/20 p-4 rounded">
        <h4 className="font-mono text-sm text-green-300 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          PERFORMANCE
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-300/80">Engagement</span>
            <span className="font-mono text-green-400">8.2%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300/80">Growth (7d)</span>
            <span className="font-mono text-green-400">+12.4%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-300/80">Best time to post</span>
            <span className="font-mono text-green-400">6-8 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

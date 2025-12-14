"use client";

import { useState } from 'react';
import { Loader2, MessageSquare, Heart, Share2, BarChart2 } from 'lucide-react';

interface Post {
  id: string;
  platform: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
}

export const PostsView = () => {
  const [loading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number>(0);

  // Mock data
  const posts: Post[] = [
    {
      id: '1',
      platform: 'Instagram',
      content: 'New track dropping Friday! 🎵 #NewMusic',
      likes: 1248,
      comments: 87,
      shares: 45,
      engagement: 12.3
    },
    {
      id: '2',
      platform: 'TikTok',
      content: 'Studio session 🎧 #InTheLab',
      likes: 3241,
      comments: 142,
      shares: 98,
      engagement: 8.7
    },
    {
      id: '3',
      platform: 'Twitter',
      content: 'Tour dates announced! Tickets on sale now.',
      likes: 876,
      comments: 34,
      shares: 56,
      engagement: 5.2
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        <span className="ml-2">LOADING_POSTS...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Posts List */}
      <div className="lg:col-span-1 border border-green-400/30 rounded">
        <div className="bg-green-400/10 p-3 border-b border-green-400/30">
          <h3 className="font-mono">RECENT_POSTS</h3>
        </div>
        <div className="divide-y divide-green-400/10">
          {posts.map((post, index) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(index)}
              className={`w-full text-left p-3 hover:bg-green-400/5 ${
                selectedPost === index ? 'bg-green-400/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{post.platform}</span>
                <span className="text-xs text-green-400/60">2h ago</span>
              </div>
              <p className="text-sm mt-1 text-green-300/80 line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center mt-2 text-xs space-x-3">
                <span className="text-green-400/60">
                  <Heart className="h-3 w-3 inline mr-1" /> {post.likes.toLocaleString()}
                </span>
                <span className="text-green-400/60">
                  <MessageSquare className="h-3 w-3 inline mr-1" /> {post.comments}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Post Detail */}
      {posts[selectedPost] && (
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-green-400/30 rounded p-4">
            <h3 className="font-mono text-lg mb-4">POST_ANALYTICS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-green-400/20 p-3 rounded">
                <p className="text-sm text-green-300/80 mb-1">LIKES</p>
                <p className="text-xl font-bold">{posts[selectedPost].likes.toLocaleString()}</p>
              </div>
              <div className="border border-green-400/20 p-3 rounded">
                <p className="text-sm text-green-300/80 mb-1">COMMENTS</p>
                <p className="text-xl font-bold">{posts[selectedPost].comments}</p>
              </div>
              <div className="border border-green-400/20 p-3 rounded">
                <p className="text-sm text-green-300/80 mb-1">SHARES</p>
                <p className="text-xl font-bold">{posts[selectedPost].shares}</p>
              </div>
              <div className="border border-green-400/20 p-3 rounded">
                <p className="text-sm text-green-300/80 mb-1">ENGAGEMENT</p>
                <p className="text-xl font-bold">{posts[selectedPost].engagement}%</p>
              </div>
            </div>
          </div>
          
          <div className="border border-green-400/30 rounded p-4">
            <h3 className="font-mono text-lg mb-4">AUDIENCE_INSIGHTS</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-300/80 mb-1">TOP_LOCATIONS</p>
                <div className="space-y-2">
                  {['New York, US', 'Los Angeles, US', 'Toronto, CA'].map((loc, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-16 text-xs text-green-400/60">{loc}</div>
                      <div className="flex-1 bg-green-400/10 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-400 h-full" 
                          style={{ width: `${[40, 30, 20][i]}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs w-8 text-right">
                        {[40, 30, 20][i]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BarChart2, Users, Zap, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-blue-500" />,
      title: 'AI Assistant',
      description: 'Get insights and recommendations powered by AI to grow your audience and engagement.',
      action: 'Try Now',
      path: '/assistant',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-green-500" />,
      title: 'Analytics',
      description: 'Track your performance and understand your audience with detailed analytics.',
      action: 'View Dashboard',
      path: '/analytics',
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: 'Audience',
      description: 'Manage your followers and understand your community better.',
      action: 'See Audience',
      path: '/audience',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, Creator! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1.2K</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Followers</p>
            <div className="text-sm text-green-500 mt-1">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">4.8%</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</p>
            <div className="text-sm text-green-500 mt-1">+0.5% from last week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">New Messages</p>
            <div className="text-sm text-blue-500 mt-1">3 unread</div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="h-12">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="p-0 text-blue-600 dark:text-blue-400 hover:bg-transparent"
                  onClick={() => router.push(feature.path)}
                >
                  {feature.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { id: 1, text: 'Your post received 24 new likes', time: '2 hours ago', type: 'like' },
            { id: 2, text: 'You gained 12 new followers', time: '5 hours ago', type: 'follower' },
            { id: 3, text: 'Your analytics report is ready', time: '1 day ago', type: 'analytics' },
          ].map((item) => (
            <div key={item.id} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                {item.type === 'like' && <span className="text-blue-500">👍</span>}
                {item.type === 'follower' && <span className="text-green-500">👥</span>}
                {item.type === 'analytics' && <span className="text-purple-500">📊</span>}
              </div>
              <div>
                <p className="font-medium">{item.text}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

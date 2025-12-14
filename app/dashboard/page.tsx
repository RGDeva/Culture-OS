"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MatrixBackground } from '@/components/matrix-background';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Upload, Music, Users, Mic2, Settings, FileAudio } from 'lucide-react';
import Link from 'next/link';
import { ProfileCompletionBanner } from '@/components/ProfileCompletionBanner';
import { RecoupDataPanel } from '@/components/intelligence/RecoupDataPanel';
import { WalletPanelSimple } from '@/components/dashboard/WalletPanelSimple';
import { TransactionHistorySimple } from '@/components/dashboard/TransactionHistorySimple';

export default function Dashboard() {
  const router = useRouter();
  const privyHook = usePrivy();
  const { ready, authenticated, user, logout } = privyHook || {};
  const profileHook = useUserProfile();
  const { profile, isLoading: isProfileLoading } = profileHook || { profile: null, isLoading: false };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (ready) {
        if (!authenticated) {
          router.push('/login');
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('[DASHBOARD] Error in auth check:', err);
      setError(err instanceof Error ? err.message : 'Failed to check authentication');
      setIsLoading(false);
    }
  }, [ready, authenticated, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="font-mono text-red-400 mb-4">ERROR: {error}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (isLoading || isProfileLoading || !ready) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-400 mb-4" />
          <p className="font-mono">LOADING_SYSTEM...</p>
        </div>
      </div>
    );
  }

  const userRole = profile?.artistAccountId ? 'artist' : 'user';
  const userEmail = user?.email as string | undefined;
  const userName = profile?.displayName || (userEmail && typeof userEmail === 'string' ? userEmail.split('@')[0] : 'User');
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <MatrixBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="border-b border-green-400/20">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <ArrowLeft className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="font-mono text-sm">BACK_HOME</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-full border border-green-400/20">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-mono text-green-400/80">CONNECTED</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center text-green-400 text-sm font-medium">
                  {userInitial}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-green-400/60">{userRole.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2">DASHBOARD</h1>
            <p className="text-green-400/70">Welcome back, {userName}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/50 border border-green-400/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400/70 mb-1">TOTAL ASSETS</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <FileAudio className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 border border-green-400/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400/70 mb-1">COLLABORATORS</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 border border-green-400/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400/70 mb-1">ACTIVE PROJECTS</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <Music className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 border border-green-400/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400/70 mb-1">EARNINGS</p>
                  <p className="text-2xl font-bold">$1,240</p>
                </div>
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Banner */}
          {user?.id && <ProfileCompletionBanner />}

          {/* Wallet & Transactions Grid */}
          {user?.id && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <WalletPanelSimple userId={user.id} />
              <TransactionHistorySimple userId={user.id} />
            </div>
          )}

          {/* Recoupable Intelligence Center */}
          {user?.id && (
            <div className="mb-8">
              <RecoupDataPanel userId={user.id} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold font-mono mb-4">QUICK_ACTIONS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/vault/upload">
                <Button className="w-full h-full min-h-[120px] flex flex-col items-center justify-center space-y-2 bg-black/50 border border-green-400/20 hover:bg-green-400/10 transition-colors group">
                  <div className="p-3 bg-green-400/10 rounded-full group-hover:bg-green-400/20 transition-colors">
                    <Upload className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="font-medium">UPLOAD</span>
                  <span className="text-xs text-green-400/70">New Asset</span>
                </Button>
              </Link>
              
              <Link href="/studio">
                <Button className="w-full h-full min-h-[120px] flex flex-col items-center justify-center space-y-2 bg-black/50 border border-green-400/20 hover:bg-green-400/10 transition-colors group">
                  <div className="p-3 bg-green-400/10 rounded-full group-hover:bg-green-400/20 transition-colors">
                    <Mic2 className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="font-medium">STUDIO</span>
                  <span className="text-xs text-green-400/70">Create & Edit</span>
                </Button>
              </Link>
              
              <Link href="/network">
                <Button className="w-full h-full min-h-[120px] flex flex-col items-center justify-center space-y-2 bg-black/50 border border-green-400/20 hover:bg-green-400/10 transition-colors group">
                  <div className="p-3 bg-green-400/10 rounded-full group-hover:bg-green-400/20 transition-colors">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="font-medium">NETWORK</span>
                  <span className="text-xs text-green-400/70">Connect & Collaborate</span>
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button className="w-full h-full min-h-[120px] flex flex-col items-center justify-center space-y-2 bg-black/50 border border-green-400/20 hover:bg-green-400/10 transition-colors group">
                  <div className="p-3 bg-green-400/10 rounded-full group-hover:bg-green-400/20 transition-colors">
                    <Settings className="h-6 w-6 text-green-400" />
                  </div>
                  <span className="font-medium">PROFILE</span>
                  <span className="text-xs text-green-400/70">Settings & Preferences</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-mono">RECENT_ACTIVITY</h2>
              <Button variant="ghost" size="sm" className="text-green-400 hover:bg-green-400/10">
                VIEW_ALL
              </Button>
            </div>
            
            <div className="bg-black/30 border border-green-400/20 rounded-lg overflow-hidden">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border-b border-green-400/10 last:border-0 hover:bg-green-400/5 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-400/10 flex items-center justify-center text-green-400 text-sm">
                      {item}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New collaboration request</p>
                      <p className="text-xs text-green-400/60">2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-green-400/30 text-green-400 hover:bg-green-400/10">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-green-400/10 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-green-400/50 mb-2 md:mb-0">
                © {new Date().getFullYear()} NoCulture OS. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-green-400/70 hover:text-green-400 hover:bg-transparent">
                  Terms
                </Button>
                <Button variant="ghost" size="sm" className="text-green-400/70 hover:text-green-400 hover:bg-transparent">
                  Privacy
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400/70 hover:text-red-400 hover:bg-transparent"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

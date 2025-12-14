'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Menu, X, User, LogOut, LogIn, LayoutDashboard, Search, Music, ShoppingCart, Network, Radio, Mic2, BookOpen, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from './theme-provider';

export function MainNav() {
  // Safely get Privy context with error handling
  let privyContext;
  try {
    privyContext = usePrivy();
  } catch (error) {
    console.error('Error initializing Privy:', error);
    privyContext = {
      ready: false,
      user: null,
      authenticated: false,
      logout: async () => {},
      login: () => {},
      getAccessToken: async () => null,
    };
  }
  
  const { ready, user, authenticated, logout, login, getAccessToken } = privyContext;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInitial, setUserInitial] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      name: 'VAULT', 
      href: '/vault', 
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      description: 'Your digital assets and content',
      requiresAuth: true
    },
    { 
      name: 'MARKETPLACE', 
      href: '/marketplace', 
      icon: <ShoppingCart className="h-4 w-4 mr-2" />,
      description: 'Discover and trade assets',
      requiresAuth: false
    },
    { 
      name: 'NETWORK', 
      href: '/network', 
      icon: <Network className="h-4 w-4 mr-2" />,
      description: 'Connect with creators and fans',
      requiresAuth: true
    },
    { 
      name: 'STUDIO', 
      href: '/studio', 
      icon: <Mic2 className="h-4 w-4 mr-2" />,
      description: 'Create and manage your content',
      requiresAuth: true
    },
    { 
      name: 'MUSIC', 
      href: '/music', 
      icon: <Music className="h-4 w-4 mr-2" />,
      description: 'Explore and stream music',
      requiresAuth: false
    },
  ];

  // Handle user initialization and authentication state
  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      if (user?.email && typeof user.email === 'string') {
        setUserInitial(user.email.charAt(0).toUpperCase());
      } else if (user?.wallet?.address && typeof user.wallet.address === 'string') {
        setUserInitial(user.wallet.address.charAt(0).toUpperCase());
      }
    }
  }, [ready, user]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [logout, router]);

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border/10 shadow-xl' 
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent',
        'group/header'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className={cn(
                'relative flex items-center group/logo',
                'transition-all duration-300 hover:scale-105 active:scale-95'
              )}
            >
              <div className={cn(
                'absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20',
                'rounded-lg blur-sm opacity-0 group-hover/logo:opacity-100',
                'transition-opacity duration-300',
              )} />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                NoCulture
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'group relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  'hover:bg-accent/80 hover:text-accent-foreground',
                  pathname.startsWith(item.href)
                    ? 'bg-accent/20 text-accent-foreground font-semibold'
                    : 'text-foreground/80 hover:text-foreground',
                  'flex items-center',
                  item.requiresAuth && !authenticated ? 'hidden' : ''
                )}
                onClick={() => {
                  if (item.requiresAuth && !authenticated) {
                    handleLogin();
                  }
                }}
              >
                <span className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </span>
                <span className={cn(
                  'absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary transition-all duration-300',
                  pathname.startsWith(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}></span>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button 
              className={cn(
                'p-2 rounded-full text-gray-400 hover:text-white',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background'
              )}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Auth buttons */}
            {authenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'hidden sm:inline-flex items-center space-x-1',
                    'hover:bg-gray-800 hover:border-green-400/50',
                    pathname === '/dashboard' ? 'border-green-400 text-green-400' : ''
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="relative group">
                  <button 
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-full',
                      'bg-gray-800 hover:bg-gray-700 transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background'
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-black font-bold">
                      {(typeof user?.email === 'string' ? user.email.charAt(0).toUpperCase() : (user?.email?.address ? user.email.address.charAt(0).toUpperCase() : 'U'))}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Your Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Button 
                onClick={login}
                variant="default"
                size="sm"
                className="hidden sm:flex items-center space-x-1"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className={cn(
            'md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full',
            'pt-16',
            'overflow-y-auto',
            'transform-gpu' // Enable GPU acceleration for smoother animations
          )}
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0)'
          }}
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200',
                  'flex items-center',
                  pathname.startsWith(item.href)
                    ? 'bg-accent/20 text-accent-foreground font-semibold'
                    : 'text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground',
                  item.requiresAuth && !authenticated ? 'hidden' : ''
                )}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (item.requiresAuth && !authenticated) {
                    handleLogin();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-border/50">
            {isLoading ? (
              <div className="px-4 py-4 flex justify-center">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : authenticated ? (
              <div className="px-4 space-y-3">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-3 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-4">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

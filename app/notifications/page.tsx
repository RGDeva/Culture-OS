'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Bell, Check, X, DollarSign, ShoppingBag, Users, Heart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'payment' | 'purchase' | 'tip' | 'follow' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const { user, authenticated } = usePrivy()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authenticated && user) {
      fetchNotifications()
    }
  }, [authenticated, user])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const res = await fetch(`/api/notifications?userId=${user?.id}`)
      // const data = await res.json()
      
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received $50 for "NEON_DREAMS_BEAT"',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          actionUrl: '/earnings'
        },
        {
          id: '2',
          type: 'tip',
          title: 'New Tip',
          message: 'Someone sent you a $10 tip!',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          actionUrl: '/earnings'
        },
        {
          id: '3',
          type: 'purchase',
          title: 'New Purchase',
          message: 'Your product "CYBER_KIT_V2" was purchased',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          actionUrl: '/marketplace'
        },
        {
          id: '4',
          type: 'follow',
          title: 'New Follower',
          message: 'PRODUCER_X started following you',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          actionUrl: '/network'
        },
        {
          id: '5',
          type: 'system',
          title: 'Welcome to NoCulture OS',
          message: 'Complete your profile to unlock all features',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          actionUrl: '/profile/setup'
        },
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    // TODO: API call to mark as read
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    // TODO: API call to mark all as read
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    // TODO: API call to delete
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-5 w-5" />
      case 'purchase':
        return <ShoppingBag className="h-5 w-5" />
      case 'tip':
        return <Heart className="h-5 w-5" />
      case 'follow':
        return <Users className="h-5 w-5" />
      case 'system':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return 'text-green-400'
      case 'purchase':
        return 'text-cyan-400'
      case 'tip':
        return 'text-pink-400'
      case 'follow':
        return 'text-purple-400'
      case 'system':
        return 'text-yellow-400'
      default:
        return 'text-green-400'
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Bell className="h-16 w-16 dark:text-green-400 text-green-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
            AUTHENTICATION_REQUIRED
          </h1>
          <p className="dark:text-green-400/60 text-green-700/70 font-mono">
            Please login to view notifications
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 dark:text-green-400 text-green-700" />
            <h1 className="text-4xl font-bold font-mono dark:text-green-400 text-green-700">
              NOTIFICATIONS
            </h1>
          </div>
          <p className="dark:text-green-400/60 text-green-700/70 font-mono text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={`font-mono ${
              filter === 'all'
                ? 'bg-green-600 text-white dark:bg-green-400 dark:text-black'
                : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700'
            }`}
          >
            ALL ({notifications.length})
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'outline'}
            className={`font-mono ${
              filter === 'unread'
                ? 'bg-green-600 text-white dark:bg-green-400 dark:text-black'
                : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700'
            }`}
          >
            UNREAD ({unreadCount})
          </Button>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="ml-auto font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              MARK_ALL_READ
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse font-mono dark:text-green-400 text-green-700">
              LOADING_NOTIFICATIONS...
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 border-2 dark:border-green-400/30 border-green-600/40 rounded-lg dark:bg-black/50 bg-white/80">
            <Bell className="h-16 w-16 dark:text-green-400/30 text-green-700/30 mx-auto mb-4" />
            <p className="font-mono dark:text-green-400/60 text-green-700/70">
              {filter === 'unread' ? 'NO_UNREAD_NOTIFICATIONS' : 'NO_NOTIFICATIONS_YET'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  border-2 rounded-lg p-4 transition-all
                  ${notification.read
                    ? 'dark:border-green-400/20 border-green-600/30 dark:bg-black/30 bg-white/60'
                    : 'dark:border-green-400/50 border-green-600/50 dark:bg-green-400/5 bg-green-50'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${getIconColor(notification.type)} flex-shrink-0 mt-1`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-mono font-bold ${
                        notification.read
                          ? 'dark:text-green-400/70 text-green-700/70'
                          : 'dark:text-green-400 text-green-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className={`text-sm font-mono mb-2 ${
                      notification.read
                        ? 'dark:text-green-400/50 text-green-700/60'
                        : 'dark:text-green-400/80 text-green-700/80'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-mono dark:text-green-400/40 text-green-700/50">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.actionUrl && (
                        <>
                          <span>•</span>
                          <a
                            href={notification.actionUrl}
                            className="dark:text-green-400 text-green-700 hover:underline"
                          >
                            VIEW
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 dark:text-green-400 text-green-700 dark:hover:bg-green-400/10 hover:bg-green-600/10 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 dark:text-red-400 text-red-600 dark:hover:bg-red-400/10 hover:bg-red-600/10 rounded transition-colors"
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Info, AlertCircle, Target, DollarSign, Music } from 'lucide-react'
import { Button } from './button'

interface Notification {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'BOUNTY' | 'EARNING'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      // Simulate notifications from various sources
      const mockNotifications: Notification[] = []

      // Check for new bounty earnings
      const bountiesRes = await fetch(`/api/bounties/me?userId=${userId}`).catch(() => null)
      if (bountiesRes?.ok) {
        const data = await bountiesRes.json()
        if (data.summary?.earnings?.pendingCents > 0) {
          mockNotifications.push({
            id: 'bounty-pending',
            type: 'BOUNTY',
            title: 'Bounty Earnings Pending',
            message: `You have $${(data.summary.earnings.pendingCents / 100).toFixed(2)} pending from bounties`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/earnings'
          })
        }
      }

      // Check for new earnings
      const earningsRes = await fetch(`/api/earnings/recent?userId=${userId}&limit=1`).catch(() => null)
      if (earningsRes?.ok) {
        const data = await earningsRes.json()
        if (data.earnings?.length > 0) {
          const latest = data.earnings[0]
          mockNotifications.push({
            id: `earning-${latest.id}`,
            type: 'EARNING',
            title: 'New Earning',
            message: `+$${(latest.amountCents / 100).toFixed(2)} from ${latest.platform}`,
            timestamp: new Date(latest.createdAt),
            read: false,
            actionUrl: '/earnings'
          })
        }
      }

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('[NOTIFICATIONS] Error loading:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return <Check className="h-4 w-4 text-green-400" />
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case 'BOUNTY':
        return <Target className="h-4 w-4 text-green-400" />
      case 'EARNING':
        return <DollarSign className="h-4 w-4 text-yellow-400" />
      default:
        return <Info className="h-4 w-4 dark:text-green-400 text-green-700" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 dark:bg-green-400 bg-green-600 text-black text-xs font-mono font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white z-50 shadow-lg">
            {/* Header */}
            <div className="sticky top-0 dark:bg-black bg-white border-b dark:border-green-400/30 border-green-600/40 p-3 flex items-center justify-between">
              <div className="font-mono text-sm font-bold dark:text-green-400 text-green-700">
                NOTIFICATIONS ({notifications.length})
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-mono dark:text-green-400/70 text-green-700/80 hover:dark:text-green-400 hover:text-green-700"
                >
                  MARK_ALL_READ
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y dark:divide-green-400/20 divide-green-600/30">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:dark:bg-green-400/5 hover:bg-green-600/5 transition-colors ${
                      !notification.read ? 'dark:bg-green-400/10 bg-green-600/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono font-bold dark:text-green-400 text-green-700 mb-1">
                          {notification.title}
                        </div>
                        <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-2">
                          {notification.message}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                            {getTimeAgo(notification.timestamp)}
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-mono dark:text-green-400/70 text-green-700/80 hover:dark:text-green-400 hover:text-green-700"
                            >
                              MARK_READ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 dark:text-green-400/30 text-green-700/40 mx-auto mb-3" />
                  <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

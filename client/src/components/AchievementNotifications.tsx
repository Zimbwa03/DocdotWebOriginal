
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trophy, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  badge_id?: number;
  message: string;
  xp_earned: number;
  badge_name?: string;
  badge_icon?: string;
  badge_color?: string;
  created_at: string;
}

export function AchievementNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      await fetch(`/api/notifications/${user.id}/mark-read`, {
        method: 'POST'
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {notification.badge_id ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: notification.badge_color || '#FFD700' }}
                        >
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.message}</p>
                      {notification.xp_earned > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Zap className="w-3 h-3" />
                          <span className="text-xs">+{notification.xp_earned} XP</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAsRead}
                    className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {notifications.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            onClick={markAsRead}
            variant="outline"
            size="sm"
            className="bg-white/90 text-gray-700 hover:bg-white"
          >
            Mark All as Read ({notifications.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
}

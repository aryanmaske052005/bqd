import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Info,
  CalendarDays,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter() {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Using Polling instead of Realtime to avoid the "White Screen" crash
  // Polling every 15 seconds provides a stable "real-time" experience
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [user?.id]); // Use user.id for stable dependency

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      // 1. Fetch Audit Logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('target_user', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Fetch Docs for Expiry
      const { data: docs } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id);

      const initial: Notification[] = [];

      // Process Logs
      logs?.forEach(log => {
        let type: Notification['type'] = 'info';
        if (log.action.includes('APPROVED')) type = 'success';
        else if (log.action.includes('REJECTED')) type = 'error';
        else if (log.action === 'VC_ISSUED') type = 'success';

        initial.push({
          id: log.id,
          type,
          title: (log.action || 'Update').replace(/_/g, ' '),
          message: log.action === 'VC_ISSUED' ? 'New Credential issued to wallet' : `Status update on ${new Date(log.created_at).toLocaleDateString()}`,
          timestamp: log.created_at,
          read: false
        });
      });

      // Process Expiry
      docs?.forEach(doc => {
        if (doc.expiry_date) {
          const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000);
          if (daysLeft <= 10) {
            initial.push({
              id: `expiry-${doc.id}`,
              type: daysLeft < 0 ? 'error' : 'warning',
              title: daysLeft < 0 ? 'Document Expired' : 'Expires Soon',
              message: `${(doc.doc_type || 'ID').replace(/_/g, ' ')} ${daysLeft < 0 ? 'is expired' : `expires in ${daysLeft} days`}`,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
      });

      // Sort and update state
      const sorted = initial.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Only update if data changed (to prevent flickering)
      setNotifications(prev => {
        if (JSON.stringify(prev) === JSON.stringify(sorted)) return prev;
        return sorted;
      });
      
      setUnreadCount(sorted.length);
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-indigo-600 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5 text-slate-500" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-slate-200" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
          <h3 className="font-semibold text-sm">Activity Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={markAllAsRead}>
              Clear Badge
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleDateString()} · {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" className="w-full text-xs text-indigo-600" asChild>
            <Link to={role === 'user' ? '/dashboard/user' : '#'}>View Full Audit Log</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

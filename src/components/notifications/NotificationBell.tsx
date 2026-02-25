import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, MessageCircle, Sparkles, Heart, X, Handshake, CalendarCheck, CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  Notification,
} from "@/hooks/useNotifications";
import { ProfileContactDialog } from "@/components/messaging/ProfileContactDialog";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [contactDialog, setContactDialog] = useState<{ open: boolean; profileId: string; profileName: string }>({ open: false, profileId: "", profileName: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case "match":
        return <Sparkles className="h-4 w-4 text-accent-foreground" />;
      case "interest":
        return <Heart className="h-4 w-4 text-destructive" />;
      case "skill_trade_request":
        return <Handshake className="h-4 w-4 text-primary" />;
      case "skill_trade_accepted":
        return <CalendarCheck className="h-4 w-4 text-green-600" />;
      case "skill_trade_counter":
        return <CalendarClock className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    // Message notifications go to the conversation
    if (notification.type === "message" && notification.related_conversation_id) {
      return `/messages/${notification.related_conversation_id}`;
    }
    // Skill trade notifications go to the conversation
    if (
      (notification.type === "skill_trade_request" || 
       notification.type === "skill_trade_accepted" || 
       notification.type === "skill_trade_counter") && 
      notification.related_conversation_id
    ) {
      return `/messages/${notification.related_conversation_id}`;
    }
    // Interest notifications go to the interested user's profile
    if (notification.type === "interest") {
      if (notification.related_user_id) {
        return `/profile/${notification.related_user_id}`;
      }
      return `/profile`;
    }
    // Fallback to service if available
    if (notification.related_service_id) {
      return `/services/${notification.related_service_id}`;
    }
    return null;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    
    const link = getNotificationLink(notification);
    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground border-2 border-background"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => markAllRead.mutate()}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification.mutate(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                      {notification.type === "interest" && notification.related_user_id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notification.read) markRead.mutate(notification.id);
                              // Extract name from title (e.g. "Aodh D. is interested!")
                              const nameMatch = notification.title.match(/^(.+?)\s+is interested/);
                              const name = nameMatch ? nameMatch[1] : "this user";
                              setIsOpen(false);
                              setContactDialog({ open: true, profileId: notification.related_user_id!, profileName: name });
                            }}
                          >
                            <Send className="h-3 w-3" />
                            Send Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notification.read) markRead.mutate(notification.id);
                              setIsOpen(false);
                              navigate(`/profile/${notification.related_user_id}`);
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      ) : getNotificationLink(notification) ? (
                        <p className="text-xs text-primary mt-1">
                          {notification.type === "message" || 
                           notification.type === "skill_trade_request" || 
                           notification.type === "skill_trade_accepted" ||
                           notification.type === "skill_trade_counter" 
                            ? "View conversation →" 
                            : "View service →"}
                        </p>
                      ) : null}
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll be notified about messages and matching services
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
      <ProfileContactDialog
        open={contactDialog.open}
        onOpenChange={(open) => setContactDialog(prev => ({ ...prev, open }))}
        profileId={contactDialog.profileId}
        profileName={contactDialog.profileName}
      />
    </div>
  );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, MessageCircle, Check, Trash2, MoreVertical } from 'lucide-react';
import { CommunityPost, CATEGORY_CONFIG, STICKY_NOTE_COLORS } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePostStatus, useDeletePost } from '@/hooks/useCommunityPosts';
import { useNavigate } from 'react-router-dom';

// Helper component to make URLs clickable
function LinkifyText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

interface StickyNoteProps {
  post: CommunityPost;
}

export function StickyNote({ post }: StickyNoteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateStatus = useUpdatePostStatus();
  const deletePost = useDeletePost();
  const [isHovered, setIsHovered] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[post.category];
  const bgColor = STICKY_NOTE_COLORS[post.category];
  const isOwner = user?.id === post.user_id;

  const handleMessage = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Navigate to messages with the post owner
    navigate(`/messages?userId=${post.user_id}`);
  };

  const handleMarkResolved = () => {
    updateStatus.mutate({ id: post.id, status: 'resolved' });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(post.id);
    }
  };

  // Create a subtle rotation for visual interest
  const rotation = (post.id.charCodeAt(0) % 5) - 2;

  return (
    <div
      className={`${bgColor} p-4 rounded-sm shadow-md relative transition-all duration-200 cursor-pointer min-h-[180px] flex flex-col`}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        boxShadow: isHovered 
          ? '4px 4px 12px rgba(0,0,0,0.2)' 
          : '2px 2px 6px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pin decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-sm border-2 border-red-600" />

      {/* Category badge */}
      <span className={`text-xs font-medium ${categoryConfig.color} ${categoryConfig.bgColor} px-2 py-0.5 rounded-full self-start mb-2`}>
        {categoryConfig.label}
      </span>

      {/* Title */}
      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
        {post.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3 flex-1">
        <LinkifyText text={post.description || ''} />
      </p>

      {/* Location & Time */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {post.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {post.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {format(new Date(post.created_at), 'MMM d')}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-black/10">
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.poster_avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {post.poster_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {post.poster_name || 'Anonymous'}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Sign in to see poster
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleMessage}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Message
            </Button>
          )}

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.status === 'active' && (
                  <DropdownMenuItem onClick={handleMarkResolved}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Resolved badge */}
      {post.status === 'resolved' && (
        <div className="absolute inset-0 bg-black/5 rounded-sm flex items-center justify-center">
          <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full rotate-[-10deg]">
            Resolved
          </span>
        </div>
      )}
    </div>
  );
}

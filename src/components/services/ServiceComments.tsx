import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Loader2, Trash2, Flag, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDisplayName } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ReportCommentDialog } from "@/components/reports/ReportCommentDialog";

interface Comment {
  id: string;
  service_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}

interface ServiceCommentsProps {
  serviceId: string;
  serviceOwnerId?: string | null;
}

export function ServiceComments({ serviceId, serviceOwnerId }: ServiceCommentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [reportTarget, setReportTarget] = useState<{ commentId: string; userId: string } | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["service-comments", serviceId],
    queryFn: async () => {
      const { data: rawComments, error } = await supabase
        .from("service_comments")
        .select("*")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!rawComments?.length) return [];

      // Fetch user profiles
      const userIds = [...new Set(rawComments.map((c: any) => c.user_id))];
      const profilePromises = userIds.map(async (uid) => {
        const { data } = await supabase.rpc("get_basic_profile", { _profile_id: uid });
        return data?.[0] || null;
      });
      const profiles = await Promise.all(profilePromises);
      const profileMap = Object.fromEntries(
        profiles.filter(Boolean).map((p) => [p.id, p])
      );

      return rawComments.map((c: any) => ({
        id: c.id,
        service_id: c.service_id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        user_name: profileMap[c.user_id]?.full_name || null,
        user_avatar: profileMap[c.user_id]?.avatar_url || null,
      })) as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("service_comments").insert({
        service_id: serviceId,
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-comments", serviceId] });
      setNewComment("");
      toast.success("Comment posted!");
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("service_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-comments", serviceId] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    addComment.mutate(newComment);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="shadow-elevated border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Questions & Comments
            {comments.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({comments.length})
              </span>
            )}
          </h2>
        </div>

        {/* Comment input */}
        {user ? (
          <div className="flex gap-3 mb-6">
            <Textarea
              placeholder="Ask a question or leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              maxLength={2000}
              className="resize-none flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || addComment.isPending}
              size="icon"
              className="h-auto self-end"
            >
              {addComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Sign in
            </Link>{" "}
            to ask a question or leave a comment.
          </p>
        )}

        {/* Comments list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No comments yet. Be the first to ask a question!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <Link to={`/profile/${comment.user_id}`}>
                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={comment.user_avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(comment.user_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${comment.user_id}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {formatDisplayName(comment.user_name)}
                        </Link>
                        {comment.user_id === serviceOwnerId && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Owner
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {user && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(user.id === comment.user_id || user.id === serviceOwnerId) && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteComment.mutate(comment.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                            {user.id !== comment.user_id && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setReportTarget({
                                    commentId: comment.id,
                                    userId: comment.user_id,
                                  })
                                }
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                Report Comment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Report dialog */}
      {reportTarget && (
        <ReportCommentDialog
          open={!!reportTarget}
          onOpenChange={(open) => !open && setReportTarget(null)}
          commentId={reportTarget.commentId}
          reportedUserId={reportTarget.userId}
          serviceId={serviceId}
        />
      )}
    </Card>
  );
}

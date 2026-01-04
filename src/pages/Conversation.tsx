import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Send, ExternalLink, Info, CheckCircle2, Star, AlertTriangle, MoreVertical, Lock } from "lucide-react";
import { ReportUserDialog } from "@/components/reports/ReportUserDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, useSendMessage, useMarkAsRead } from "@/hooks/useMessaging";
import { format, isToday, isYesterday, isBefore, startOfToday } from "date-fns";
import { cn, formatDisplayName } from "@/lib/utils";
import { ContactSharingCard } from "@/components/messaging/ContactSharingCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { ConversationPrompts } from "@/components/messaging/ConversationPrompts";
import { SwapAcceptanceCard } from "@/components/messaging/SwapAcceptanceCard";
import { SwapCompletionCard } from "@/components/messaging/SwapCompletionCard";
import { useToast } from "@/hooks/use-toast";

interface ConversationDetails {
  id: string;
  service_id: string | null;
  participant_1: string;
  participant_2: string;
  completed_by_1: boolean;
  completed_by_2: boolean;
  accepted_by_1: boolean;
  accepted_by_2: boolean;
  agreed_completion_date: string | null;
  swap_status: string;
  offered_skill: string | null;
  offered_skill_category: string | null;
  service?: { id: string; title: string; category?: string; type?: string; user_id?: string } | null;
  other_profile?: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [showContactCard, setShowContactCard] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: convLoading } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      if (!id || !user) return null;

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          service:service_id (id, title, category, type, user_id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const otherUserId = data.participant_1 === user.id ? data.participant_2 : data.participant_1;
      
      // Use RPC function to get basic profile info (excludes email/phone for security)
      const { data: profileData } = await supabase
        .rpc("get_basic_profile", { _profile_id: otherUserId });

      const profile = profileData?.[0] || null;

      return { ...data, other_profile: profile } as ConversationDetails;
    },
    enabled: !!id && !!user,
  });

  const { data: messages, isLoading: messagesLoading } = useMessages(id);

  // Check if user has already reviewed
  const { data: existingReview } = useQuery({
    queryKey: ["existing-review", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("conversation_id", id)
        .eq("reviewer_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  // Determine if current user is participant 1 or 2
  const isParticipant1 = conversation?.participant_1 === user?.id;
  const hasMarkedComplete = isParticipant1 
    ? conversation?.completed_by_1 
    : conversation?.completed_by_2;
  const otherHasMarkedComplete = isParticipant1 
    ? conversation?.completed_by_2 
    : conversation?.completed_by_1;
  
  // Swap acceptance status
  const bothAccepted = conversation?.accepted_by_1 && conversation?.accepted_by_2;
  const completionDateReached = conversation?.agreed_completion_date && 
    (isBefore(new Date(conversation.agreed_completion_date), startOfToday()) || 
     isToday(new Date(conversation.agreed_completion_date)));
  const canShowReviewOptions = bothAccepted && completionDateReached;
  const canReview = canShowReviewOptions && (hasMarkedComplete || otherHasMarkedComplete) && !existingReview;
  
  // Check if current user is the service owner
  const isServiceOwner = conversation?.service?.user_id === user?.id;
  
  // Check if both parties have reviewed
  const { data: otherReview } = useQuery({
    queryKey: ["other-review", id, conversation?.other_profile?.id],
    queryFn: async () => {
      if (!id || !conversation?.other_profile?.id) return null;
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("conversation_id", id)
        .eq("reviewer_id", conversation.other_profile.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!conversation?.other_profile?.id,
  });
  
  const bothReviewed = !!existingReview && !!otherReview;
  
  // Check if swap is closed (no more messaging)
  const isSwapClosed = conversation?.swap_status === 'closed';

  const handleMarkComplete = async () => {
    if (!id || !user || !conversation) return;
    
    setIsMarkingComplete(true);
    try {
      const updateField = isParticipant1 ? "completed_by_1" : "completed_by_2";
      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: true })
        .eq("id", id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      
      toast({
        title: "Trade marked complete",
        description: "You can now leave a review for this trade.",
      });
      
      // Open review dialog
      setShowReviewDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark complete",
        variant: "destructive",
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Mark messages as read when viewing
  useEffect(() => {
    if (id && user) {
      markAsRead.mutate(id);
    }
  }, [id, user, messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;

    await sendMessage.mutateAsync({
      conversationId: id,
      content: newMessage,
    });
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`;
    }
    return format(date, "dd MMM, HH:mm");
  };

  if (authLoading || convLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Conversation not found</h2>
              <Button onClick={() => navigate("/messages")}>
                Back to Messages
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20 flex flex-col">
        <div className="container max-w-3xl flex-1 flex flex-col py-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.other_profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(conversation.other_profile?.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {formatDisplayName(conversation.other_profile?.full_name)}
              </p>
              {conversation.service && (
                <Link 
                  to={`/services/${conversation.service.id}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {conversation.service.title}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactCard(!showContactCard)}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                
                {conversation.other_profile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <ReportUserDialog
                          reportedUserId={conversation.other_profile.id}
                          reportedUserName={formatDisplayName(conversation.other_profile.full_name)}
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Contact Sharing Card */}
          <Collapsible open={showContactCard} onOpenChange={setShowContactCard}>
            <CollapsibleContent className="mb-4">
              {conversation.other_profile && (
                <ContactSharingCard
                  conversationId={conversation.id}
                  otherUserId={conversation.other_profile.id}
                  otherUserName={formatDisplayName(conversation.other_profile.full_name)}
                />
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Swap Acceptance Card */}
          {conversation.service && (
            <SwapAcceptanceCard
              conversationId={conversation.id}
              isParticipant1={isParticipant1}
              acceptedBy1={conversation.accepted_by_1 || false}
              acceptedBy2={conversation.accepted_by_2 || false}
              agreedCompletionDate={conversation.agreed_completion_date}
              swapStatus={conversation.swap_status || 'pending'}
              otherUserName={formatDisplayName(conversation.other_profile?.full_name)}
              serviceTitle={conversation.service.title}
              offeredSkill={conversation.offered_skill || undefined}
              offeredSkillCategory={conversation.offered_skill_category || undefined}
            />
          )}

          {/* Swap Completion Card - For service owner after both reviewed */}
          <SwapCompletionCard
            conversationId={conversation.id}
            serviceId={conversation.service_id}
            serviceTitle={conversation.service?.title}
            isServiceOwner={isServiceOwner}
            bothReviewed={bothReviewed}
            swapStatus={conversation.swap_status || 'pending'}
            onClose={() => navigate("/messages")}
          />

          {/* Trade Completion & Review Actions - Only show after completion date reached */}
          {canShowReviewOptions && (
            <div className="mb-4 flex flex-wrap gap-2">
              {!hasMarkedComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  className="gap-2"
                >
                  {isMarkingComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark Trade Complete
                </Button>
              )}
              
              {hasMarkedComplete && !existingReview && (
                <Button
                  size="sm"
                  onClick={() => setShowReviewDialog(true)}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Leave a Review
                </Button>
              )}
              
              {hasMarkedComplete && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  You marked this complete
                </span>
              )}
              
              {otherHasMarkedComplete && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {formatDisplayName(conversation.other_profile?.full_name)} marked complete
                </span>
              )}
              
              {existingReview && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  Review submitted
                </span>
              )}
            </div>
          )}

          {/* Safety Reminder */}
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              <strong>Safety reminder:</strong> Meet in public places when possible. SwapSkills facilitates 
              connections but cannot guarantee exchange outcomes.{" "}
              <Link to="/safety" className="text-primary hover:underline">Stay safe</Link>
            </p>
          </div>

          {/* Messages */}
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => {
                  const isOwn = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input - Disabled if swap is closed */}
            {isSwapClosed ? (
              <div className="p-4 border-t">
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-3">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">This swap has been closed. Messaging is disabled.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t space-y-3">
                {/* AI Suggested Prompts */}
                <ConversationPrompts
                  serviceTitle={conversation.service?.title}
                  serviceCategory={conversation.service?.category}
                  serviceType={conversation.service?.type}
                  onSelectPrompt={(prompt) => setNewMessage(prompt)}
                />
                
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      maxLength={10000}
                      className="resize-none min-h-[44px]"
                    />
                    {newMessage.length > 9000 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {newMessage.length}/10000
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="shrink-0"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
      
      {/* Review Dialog */}
      {conversation.other_profile && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          conversationId={conversation.id}
          reviewedUserId={conversation.other_profile.id}
          reviewedUserName={formatDisplayName(conversation.other_profile.full_name)}
          serviceId={conversation.service_id}
          serviceTitle={conversation.service?.title}
          onReviewSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ["existing-review", id, user?.id] });
          }}
        />
      )}
    </div>
  );
}

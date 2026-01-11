import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useMessaging";
import { formatDistanceToNow } from "date-fns";
import { formatDisplayName } from "@/lib/utils";

export default function Messages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: conversations, isLoading } = useConversations();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (authLoading) {
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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
              <p className="text-muted-foreground mb-6">
                You need to be signed in to access your conversations.
              </p>
              <Button onClick={() => navigate("/auth")}>
                Sign In
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
      <main className="flex-1 bg-secondary/20">
        <div className="container py-8 max-w-3xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl font-bold mb-6">Messages</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Link
                        to={`/profile/${conversation.other_profile?.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.other_profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(conversation.other_profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Link
                            to={`/profile/${conversation.other_profile?.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold truncate hover:underline"
                          >
                            {formatDisplayName(conversation.other_profile?.full_name)}
                          </Link>
                          <div className="flex items-center gap-2 shrink-0">
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <Badge variant="default" className="rounded-full">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            {conversation.last_message && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>

                        {conversation.service && (
                          <p className="text-sm text-primary mb-1 truncate">
                            Re: {conversation.service.title}
                          </p>
                        )}

                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.sender_id === user.id ? "You: " : ""}
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start a conversation by contacting a service provider.
                </p>
                <Button onClick={() => navigate("/browse")}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

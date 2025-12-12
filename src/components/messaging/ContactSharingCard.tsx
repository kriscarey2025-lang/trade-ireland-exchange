import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  useContactShares, 
  useShareContact, 
  useRevokeContactShare,
  useProfileForConversation 
} from "@/hooks/useContactSharing";
import { Share2, ShieldCheck, ShieldOff, Mail, Phone, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContactSharingCardProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string | null;
}

export function ContactSharingCard({ 
  conversationId, 
  otherUserId,
  otherUserName 
}: ContactSharingCardProps) {
  const { data: shares, isLoading } = useContactShares(conversationId);
  const { data: otherProfile } = useProfileForConversation(otherUserId);
  const shareContact = useShareContact();
  const revokeShare = useRevokeContactShare();

  const handleShare = () => {
    shareContact.mutate({ conversationId, sharedWithId: otherUserId });
  };

  const handleRevoke = () => {
    revokeShare.mutate({ conversationId, sharedWithId: otherUserId });
  };

  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Contact Sharing</span>
        </div>

        {/* My sharing status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your contact info:</span>
            {shares?.given ? (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Shared
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <ShieldOff className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
          
          {shares?.given ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleRevoke}
              disabled={revokeShare.isPending}
            >
              {revokeShare.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              Revoke Access
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={handleShare}
              disabled={shareContact.isPending}
            >
              {shareContact.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              Share My Contact Info
            </Button>
          )}
        </div>

        {/* Their sharing status */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {otherUserName || "Their"}'s contact:
            </span>
            {shares?.received ? (
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                <ShieldCheck className="h-3 w-3" />
                Available
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <ShieldOff className="h-3 w-3" />
                Not shared
              </Badge>
            )}
          </div>

          {shares?.received && otherProfile?.contact_shared && (
            <div className="bg-background rounded-lg p-3 space-y-2">
              {otherProfile.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${otherProfile.email}`} className="text-primary hover:underline">
                    {otherProfile.email}
                  </a>
                </div>
              )}
              {otherProfile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${otherProfile.phone}`} className="text-primary hover:underline">
                    {otherProfile.phone}
                  </a>
                </div>
              )}
              {!otherProfile.email && !otherProfile.phone && (
                <p className="text-sm text-muted-foreground">
                  No contact details on their profile
                </p>
              )}
            </div>
          )}
          
          {!shares?.received && (
            <p className="text-xs text-muted-foreground">
              {otherUserName || "They"} hasn't shared their contact info with you yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

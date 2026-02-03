import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Linkedin, Facebook, Instagram, Globe, Save, AlertTriangle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const socialLinksSchema = z.object({
  linkedin_url: z.string().trim().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  facebook_url: z.string().trim().url("Please enter a valid Facebook URL").optional().or(z.literal("")),
  instagram_url: z.string().trim().url("Please enter a valid Instagram URL").optional().or(z.literal("")),
  website_url: z.string().trim().url("Please enter a valid website URL").optional().or(z.literal("")),
});

interface SocialLinksCardProps {
  userId: string;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  websiteUrl?: string | null;
  onUpdate: (linkedin: string | null, facebook: string | null, instagram: string | null, website?: string | null) => void;
}

export function SocialLinksCard({ 
  userId, 
  linkedinUrl, 
  facebookUrl, 
  instagramUrl,
  websiteUrl,
  onUpdate 
}: SocialLinksCardProps) {
  const [saving, setSaving] = useState(false);
  const [linkedin, setLinkedin] = useState(linkedinUrl || "");
  const [facebook, setFacebook] = useState(facebookUrl || "");
  const [instagram, setInstagram] = useState(instagramUrl || "");
  const [website, setWebsite] = useState(websiteUrl || "");

  const hasLinks = linkedinUrl || facebookUrl || instagramUrl || websiteUrl;
  const hasChanges = linkedin !== (linkedinUrl || "") || 
                     facebook !== (facebookUrl || "") || 
                     instagram !== (instagramUrl || "") ||
                     website !== (websiteUrl || "");

  const handleSave = async () => {
    const result = socialLinksSchema.safeParse({
      linkedin_url: linkedin || undefined,
      facebook_url: facebook || undefined,
      instagram_url: instagram || undefined,
      website_url: website || undefined,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        linkedin_url: linkedin.trim() || null,
        facebook_url: facebook.trim() || null,
        instagram_url: instagram.trim() || null,
        website_url: website.trim() || null,
      })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update social links");
      setSaving(false);
      return;
    }

    onUpdate(
      linkedin.trim() || null,
      facebook.trim() || null,
      instagram.trim() || null,
      website.trim() || null
    );

    toast.success("Social links updated!");
    setSaving(false);
  };

  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Social Media & Website</CardTitle>
        </div>
        <CardDescription>
          Connect your social profiles and website to build trust with other members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            These links will be visible to other users on your service listings, helping them verify who you are.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Company/Personal Website
            </Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={saving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/yourprofile"
              disabled={saving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[#E4405F]" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              disabled={saving}
            />
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Links
              </>
            )}
          </Button>
        )}

        {hasLinks && !hasChanges && (
          <div className="pt-2 flex flex-wrap gap-3">
            {websiteUrl && (
              <a 
                href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                View Website
              </a>
            )}
            {linkedinUrl && (
              <a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#0A66C2] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                View LinkedIn
              </a>
            )}
            {facebookUrl && (
              <a 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#1877F2] transition-colors"
              >
                <Facebook className="h-4 w-4" />
                View Facebook
              </a>
            )}
            {instagramUrl && (
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#E4405F] transition-colors"
              >
                <Instagram className="h-4 w-4" />
                View Instagram
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

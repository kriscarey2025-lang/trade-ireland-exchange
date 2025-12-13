import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, MapPin, Phone, Mail, Edit2, Save, X, AlertTriangle, Linkedin, Facebook, Instagram, Camera } from "lucide-react";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { UserListings } from "@/components/profile/UserListings";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { VerificationRequestCard } from "@/components/profile/VerificationRequestCard";
import { UserRatingBadge } from "@/components/reviews/UserRatingBadge";
import { ReviewsList } from "@/components/reviews/ReviewsList";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(20).optional(),
  linkedin_url: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
  facebook_url: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
  instagram_url: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")),
});

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerificationRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  verification_status: VerificationStatus;
  linkedin_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    // Also set loading to false if auth is done but no user
    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  // Fetch profile data and verification request
  useEffect(() => {
    async function fetchProfileAndVerification() {
      if (!user) return;
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        toast.error("Failed to load profile");
        return;
      }
      
      if (profileData) {
        setProfile({
          ...profileData,
          verification_status: (profileData.verification_status as VerificationStatus) || 'unverified'
        });
        setFullName(profileData.full_name || "");
        setLocation(profileData.location || "");
        setBio(profileData.bio || "");
        setPhone(profileData.phone || "");
        setLinkedinUrl(profileData.linkedin_url || "");
        setFacebookUrl(profileData.facebook_url || "");
        setInstagramUrl(profileData.instagram_url || "");
      }

      // Fetch verification request
      const { data: verificationData } = await supabase
        .from('verification_requests')
        .select('id, status, admin_notes, submitted_at, reviewed_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (verificationData) {
        setVerificationRequest(verificationData as VerificationRequest);
      }
      
      setLoading(false);
    }
    
    if (user) {
      fetchProfileAndVerification();
    }
  }, [user]);

  const handleSave = async () => {
    const result = profileSchema.safeParse({
      full_name: fullName,
      location: location || undefined,
      bio: bio || undefined,
      phone: phone || undefined,
      linkedin_url: linkedinUrl || undefined,
      facebook_url: facebookUrl || undefined,
      instagram_url: instagramUrl || undefined,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        location: location.trim() || null,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
      })
      .eq('id', user!.id);

    if (error) {
      toast.error("Failed to update profile");
      setSaving(false);
      return;
    }

    setProfile(prev => prev ? {
      ...prev,
      full_name: fullName.trim(),
      location: location.trim() || null,
      bio: bio.trim() || null,
      phone: phone.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
    } : null);

    toast.success("Profile updated successfully");
    setIsEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setFacebookUrl(profile.facebook_url || "");
      setInstagramUrl(profile.instagram_url || "");
    }
    setIsEditing(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card className="shadow-elevated border-border/50 overflow-hidden">
            <div className="h-24 bg-gradient-hero" />
            <CardHeader className="relative pb-4">
              <div className="absolute -top-12 left-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="pt-14 flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {profile?.full_name || "Your Name"}
                    <VerifiedBadge status={profile?.verification_status || "unverified"} size="md" />
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email}
                  </CardDescription>
                  {user && (
                    <div className="mt-2">
                      <UserRatingBadge userId={user.id} />
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1.5" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {profile?.location && !isEditing && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Profile Details Card */}
          <Card className="shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>
                {isEditing ? "Update your profile details below" : "Your personal information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Dublin, Cork, Galway..."
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+353 1234567"
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself and the skills you offer..."
                      rows={4}
                      disabled={saving}
                    />
                    <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Social Media Links (optional)</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        These links will be visible to other users when you post a service or request.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/yourprofile"
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/yourprofile"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave} 
                      disabled={saving}
                      className="rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-xl"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-muted-foreground">{profile?.full_name || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-muted-foreground">{profile?.location || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-muted-foreground">{profile?.phone || "Not set"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Bio</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {profile?.bio || "No bio added yet. Click 'Edit Profile' to add one."}
                    </p>
                  </div>

                  {(profile?.linkedin_url || profile?.facebook_url || profile?.instagram_url) && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-3">Social Media</p>
                        <div className="flex gap-3">
                          {profile?.linkedin_url && (
                            <a 
                              href={profile.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Linkedin className="h-5 w-5" />
                              LinkedIn
                            </a>
                          )}
                          {profile?.facebook_url && (
                            <a 
                              href={profile.facebook_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Facebook className="h-5 w-5" />
                              Facebook
                            </a>
                          )}
                          {profile?.instagram_url && (
                            <a 
                              href={profile.instagram_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Instagram className="h-5 w-5" />
                              Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ID Verification Card */}
          {user && profile && (
            <VerificationRequestCard
              userId={user.id}
              verificationStatus={profile.verification_status}
              existingRequest={verificationRequest}
              onStatusChange={(newStatus) => {
                setProfile(prev => prev ? { ...prev, verification_status: newStatus } : null);
              }}
            />
          )}

          {/* User Listings */}
          {user && <UserListings userId={user.id} />}

          {/* Reviews Section */}
          {user && (
            <Card className="shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Reviews</CardTitle>
                <CardDescription>What others are saying about you</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsList userId={user.id} />
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="shadow-elevated border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete your account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account and all associated data
                  </p>
                </div>
                <DeleteAccountDialog userEmail={profile?.email || null} />
              </div>
            </CardContent>
          </Card>

          {/* Member Since */}
          <p className="text-center text-sm text-muted-foreground">
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IE', { 
              month: 'long', 
              year: 'numeric' 
            }) : '—'}
          </p>
        </div>
      </main>
    </div>
  );
}

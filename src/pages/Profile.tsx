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
import { Loader2, User, MapPin, Phone, Mail, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { UserListings } from "@/components/profile/UserListings";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(20).optional(),
});

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        toast.error("Failed to load profile");
        return;
      }
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
      }
      
      setLoading(false);
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    const result = profileSchema.safeParse({
      full_name: fullName,
      location: location || undefined,
      bio: bio || undefined,
      phone: phone || undefined,
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
    }
    setIsEditing(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-14 flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{profile?.full_name || "Your Name"}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email}
                  </CardDescription>
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Listings */}
          {user && <UserListings userId={user.id} />}

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

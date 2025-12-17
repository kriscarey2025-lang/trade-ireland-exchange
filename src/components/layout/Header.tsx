import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu, X, Search, User, Plus, Sparkles, LogOut, MessageCircle, ChevronDown, Shield, Flag, CheckCircle, Megaphone, Clipboard, Lightbulb, RefreshCw, BookOpen, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const discoverMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isLoggedIn = !!user;

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['user-is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      return data ?? false;
    },
    enabled: !!user?.id,
  });

  // Check if user is an advertiser
  const { data: isAdvertiser } = useQuery({
    queryKey: ['user-is-advertiser', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setPostMenuOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
      if (discoverMenuRef.current && !discoverMenuRef.current.contains(event.target as Node)) {
        setDiscoverMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
    setMobileMenuOpen(false);
  };

  const discoverLinks = [
    { href: "/community", label: "Community Board", icon: Clipboard },
    { href: "/how-it-works", label: "How It Works", icon: Compass },
    { href: "/matches", label: "AI Matches", icon: Sparkles },
    { href: "#brainstorm", label: "Brainstorm Ideas", icon: Lightbulb, action: () => setBrainstormOpen(true) },
  ];

  const mainNavLinks = [
    { href: "/browse", label: "Browse Skills" },
    { href: "/stories", label: "Swap-Skill Stories" },
    ...(isAdvertiser ? [{ href: "/advertiser", label: "My Ads", icon: Megaphone }] : []),
  ];

  const adminLinks = [
    { href: "/admin/advertisers", label: "Advertisers", icon: Megaphone },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/verification", label: "Verification", icon: CheckCircle },
    { href: "/admin/feedback", label: "Messages & Feedback", icon: MessageCircle },
  ];

  const isDiscoverActive = discoverLinks.some(l => location.pathname === l.href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg group">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-hero text-white shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-sm">🤝</span>
          </div>
          <span className="hidden sm:inline text-foreground">
            Swap<span className="text-primary">Skills</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          {/* Discover Dropdown */}
          <div className="relative" ref={discoverMenuRef}>
            <button
              onClick={() => setDiscoverMenuOpen(!discoverMenuOpen)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                isDiscoverActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Compass className="h-4 w-4" />
              Discover
              <ChevronDown className={cn("h-3 w-3 transition-transform", discoverMenuOpen && "rotate-180")} />
            </button>
            {discoverMenuOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-background rounded-lg border border-border shadow-lg py-1 z-50">
                {discoverLinks.map((link) => 
                  link.action ? (
                    <button
                      key={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-left"
                      onClick={() => {
                        setDiscoverMenuOpen(false);
                        link.action();
                      }}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                        location.pathname === link.href && "bg-muted text-primary"
                      )}
                      onClick={() => setDiscoverMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Admin Dropdown */}
          {isAdmin && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  adminLinks.some(l => location.pathname === l.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
                <ChevronDown className={cn("h-3 w-3 transition-transform", adminMenuOpen && "rotate-180")} />
              </button>
              {adminMenuOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-background rounded-lg border border-border shadow-lg py-1 z-50">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                        location.pathname === link.href && "bg-muted text-primary"
                      )}
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link to="/browse">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          {isLoggedIn ? (
            <>
              <div className="relative" ref={postMenuRef}>
                <Button 
                  variant="accent" 
                  size="sm" 
                  className="rounded-xl"
                  onClick={() => setPostMenuOpen(!postMenuOpen)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Post
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {postMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-background rounded-xl border border-border shadow-lg py-1 z-50">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/services/new"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          onClick={() => setPostMenuOpen(false)}
                        >
                          <RefreshCw className="h-4 w-4 text-primary" />
                          Skill Swap
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p>Create a skill swap post to offer or request services</p>
                      </TooltipContent>
                    </Tooltip>
                    <button
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left"
                      onClick={() => {
                        setPostMenuOpen(false);
                        setBrainstormOpen(true);
                      }}
                    >
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Brainstorm Ideas
                    </button>
                    <div className="border-t border-border my-1" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/getting-started"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground font-medium"
                          onClick={() => setPostMenuOpen(false)}
                        >
                          <span>🧙‍♂️</span>
                          Create Post Wizard
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p>Answer a few questions and we'll create a post for you using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
              <NotificationBell />
              <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                <Link to="/messages">
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="rounded-xl" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" className="rounded-xl shadow-md hover:shadow-lg" asChild>
                <Link to="/auth?mode=signup">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Join Free
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 space-y-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Discover
            </div>
            {discoverLinks.map((link) => 
              link.action ? (
                <button
                  key={link.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted w-full text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    link.action();
                  }}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Admin Links */}
            {isAdmin && (
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Admin
                </div>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-border space-y-2">
              {isLoggedIn ? (
                <>
                  <Button variant="accent" className="w-full rounded-xl" asChild>
                    <Link to="/services/new" onClick={() => setMobileMenuOpen(false)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Skill Swap
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setBrainstormOpen(true);
                    }}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Brainstorm Ideas
                  </Button>
                  <Button variant="ghost" className="w-full rounded-xl text-foreground font-medium" asChild>
                    <Link to="/getting-started" onClick={() => setMobileMenuOpen(false)}>
                      <span className="mr-2">🧙‍♂️</span>
                      Create Post Wizard
                    </Link>
                  </Button>
                  <div className="border-t border-border my-2" />
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  </Button>
                  <Button variant="ghost" className="w-full rounded-xl" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="hero" className="w-full rounded-xl" asChild>
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Join Free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </header>
  );
}

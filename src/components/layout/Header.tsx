import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu, X, Search, User, PenLine, Sparkles, LogOut, MessageCircle, ChevronDown, Shield, Flag, CheckCircle, Megaphone, Clipboard, Lightbulb, RefreshCw, BookOpen, Compass, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import swapSkillsLogo from "@/assets/swapskills-logo.png";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
  const [browseMenuOpen, setBrowseMenuOpen] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const discoverMenuRef = useRef<HTMLDivElement>(null);
  const browseMenuRef = useRef<HTMLDivElement>(null);
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
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
      if (discoverMenuRef.current && !discoverMenuRef.current.contains(event.target as Node)) {
        setDiscoverMenuOpen(false);
      }
      if (browseMenuRef.current && !browseMenuRef.current.contains(event.target as Node)) {
        setBrowseMenuOpen(false);
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

  const browseLinks = [
    { href: "/browse", label: "Browse Skills", icon: Search },
    { href: "/matches", label: "AI Matches", icon: Sparkles },
  ];

  const discoverLinks = [
    { href: "/community", label: "Community Board", icon: Clipboard },
    { href: "/how-it-works", label: "How It Works", icon: Compass },
    { href: "#brainstorm", label: "Brainstorm Ideas", icon: Lightbulb, action: () => setBrainstormOpen(true) },
  ];

  const mainNavLinks = [
    { href: "/stories", label: "Swap-Skill Stories" },
    ...(isAdvertiser ? [{ href: "/advertiser", label: "My Ads", icon: Megaphone }] : []),
  ];

  const adminLinks = [
    { href: "/admin/advertisers", label: "Advertisers", icon: Megaphone },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/verification", label: "Verification", icon: CheckCircle },
    { href: "/admin/feedback", label: "Messages & Feedback", icon: MessageCircle },
  ];

  const isBrowseActive = browseLinks.some(l => location.pathname === l.href);
  const isDiscoverActive = discoverLinks.some(l => location.pathname === l.href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg group">
          <img 
            src={swapSkillsLogo} 
            alt="SwapSkills Logo" 
            className="w-8 h-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
          />
          <span className="hidden sm:inline text-foreground">
            Swap<span className="text-primary">Skills</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          {/* Browse Dropdown */}
          <div className="relative" ref={browseMenuRef}>
            <button
              onClick={() => setBrowseMenuOpen(!browseMenuOpen)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                isBrowseActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Search className="h-4 w-4" />
              Browse
              <ChevronDown className={cn("h-3 w-3 transition-transform", browseMenuOpen && "rotate-180")} />
            </button>
            {browseMenuOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-background rounded-lg border border-border shadow-lg py-1 z-50">
                {browseLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                      location.pathname === link.href && "bg-muted text-primary"
                    )}
                    onClick={() => setBrowseMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                <a href="https://www.facebook.com/people/Swap-Skills/61584889451637/?sk=followers" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Follow us on Facebook</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link to="/browse">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          {isLoggedIn ? (
            <>
              <Button 
                variant="accent" 
                size="sm" 
                className="rounded-xl"
                asChild
              >
                <Link to="/new-service">
                  <PenLine className="h-4 w-4 mr-1" />
                  Start a Post
                </Link>
              </Button>
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
              Browse
            </div>
            {browseLinks.map((link) => (
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
            ))}
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
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
                    <Link to="/new-service" onClick={() => setMobileMenuOpen(false)}>
                      <PenLine className="h-4 w-4 mr-1" />
                      Start a Post
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

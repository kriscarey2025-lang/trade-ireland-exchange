import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu, X, Search, User, PenLine, Sparkles, LogOut, MessageCircle, ChevronDown, Shield, Flag, CheckCircle, Megaphone, Lightbulb, RefreshCw, BookOpen, Compass, Facebook, Linkedin, Clover, FileText, Activity, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import FeatureRequestDialog from "@/components/sidebar/FeatureRequestDialog";
import FeedbackDialog from "@/components/sidebar/FeedbackDialog";
import LeprechaunWizard from "@/components/sidebar/LeprechaunWizard";
import swapSkillsLogo from "@/assets/swapskills-logo.png";

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuTop, setMobileMenuTop] = useState(56);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
  const [browseMenuOpen, setBrowseMenuOpen] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const discoverMenuRef = useRef<HTMLDivElement>(null);
  const browseMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  
  const isLoggedIn = !loading && !!user;

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

  // Ensure the mobile menu opens below the header (even with promo banner above)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const updateTop = () => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMobileMenuTop(Math.round(rect.bottom));
    };

    updateTop();
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, { passive: true });

    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop);
    };
  }, [mobileMenuOpen]);

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
    { href: "/how-it-works", label: "How It Works", icon: Compass },
    { href: "#brainstorm", label: "Brainstorm Ideas", icon: Lightbulb, action: () => setBrainstormOpen(true) },
  ];

  const mainNavLinks = [
    { href: "/stories", label: "Swap-Skill Stories", icon: BookOpen },
    { href: "/press", label: "Press", icon: FileText },
    ...(isAdvertiser ? [{ href: "/advertiser", label: "My Ads", icon: Megaphone }] : []),
  ];

  const adminLinks = [
    { href: "/admin/health", label: "Platform Health", icon: Activity },
    { href: "/admin/advertisers", label: "Advertisers", icon: Megaphone },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/verification", label: "Verification", icon: CheckCircle },
    { href: "/admin/feedback", label: "Messages & Feedback", icon: MessageCircle },
  ];

  const isBrowseActive = browseLinks.some(l => location.pathname === l.href);
  const isDiscoverActive = discoverLinks.some(l => location.pathname === l.href);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo - explicit dimensions prevent CLS */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg group shrink-0" aria-label="SwapSkills Home">
          <img 
            src={swapSkillsLogo} 
            alt="SwapSkills Logo" 
            width={32}
            height={32}
            className="w-8 h-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
            style={{ aspectRatio: '1/1' }}
          />
          <span className="hidden sm:inline text-foreground">
            Swap<span className="text-primary">Skills</span>
          </span>
        </Link>

        {/* Mobile inline menu - Stories, How It Works & FAQ */}
        <nav className="flex md:hidden items-center gap-1">
          <Link
            to="/stories"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location.pathname === "/stories"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Stories
          </Link>
          <Link
            to="/how-it-works"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location.pathname === "/how-it-works"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            )}
          >
            <Compass className="h-3.5 w-3.5" />
            How It Works
          </Link>
          <Link
            to="/faq"
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location.pathname === "/faq"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Link>
        </nav>

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
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
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
          {loading ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-10 w-10 rounded-xl bg-muted/40 animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-muted/40 animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-muted/40 animate-pulse" />
            </div>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl" asChild aria-label="Follow us on Facebook">
                    <a href="https://www.facebook.com/people/Swap-Skills/61584889451637/?sk=followers" target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Follow us on Facebook</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Follow us on Facebook</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl" asChild aria-label="Follow us on LinkedIn">
                    <a href="https://www.linkedin.com/company/swap-skills-ireland/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Follow us on LinkedIn</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Follow us on LinkedIn</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" className="rounded-xl" asChild aria-label="Search services">
                <Link to="/browse">
                  <Search className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Search services</span>
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
            </>
          )}
        </div>

        {/* Mobile Actions - simplified since MobileBottomNav handles main nav */}
        <div className="flex md:hidden items-center gap-1">
          {loading ? (
            <div className="h-11 w-11 rounded-xl bg-muted/40 animate-pulse" aria-hidden="true" />
          ) : isLoggedIn ? (
            <NotificationBell />
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu (portal) */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={cn(
              "md:hidden fixed inset-0 z-[70] transition-opacity duration-200",
              mobileMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            )}
            aria-hidden={!mobileMenuOpen}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div
              className="absolute inset-x-0 bottom-0 bg-background border-b border-border shadow-xl overflow-y-auto"
              style={{ top: mobileMenuTop }}
              role="dialog"
              aria-modal="true"
            >
              <nav className="container py-4 space-y-1 pb-24">
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

                {/* Feedback buttons - mobile only */}
                <button
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted w-full text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFeatureDialogOpen(true);
                  }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Request a Feature
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted w-full text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFeedbackDialogOpen(true);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Feedback
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted w-full text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setWizardOpen(true);
                  }}
                >
                  <span className="text-lg">🍀</span>
                  Ask Lucky the Leprechaun
                </button>

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

                {/* Quick Actions - only show items NOT in bottom nav */}
                <div className="pt-4 border-t border-border space-y-2">
                  {isLoggedIn ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setBrainstormOpen(true);
                        }}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Brainstorm Ideas
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl text-foreground font-medium"
                        asChild
                      >
                        <Link
                          to="/getting-started"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="mr-2">🧙‍♂️</span>
                          Create Post Wizard
                        </Link>
                      </Button>
                      <div className="border-t border-border my-2" />
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full rounded-xl" asChild>
                        <Link
                          to="/auth"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                      </Button>
                      <Button variant="hero" className="w-full rounded-xl" asChild>
                        <Link
                          to="/auth?mode=signup"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Sparkles className="h-4 w-4 mr-1.5" />
                          Join Free
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}

      
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
      <FeatureRequestDialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen} />
      <FeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
      <LeprechaunWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </header>
  );
}

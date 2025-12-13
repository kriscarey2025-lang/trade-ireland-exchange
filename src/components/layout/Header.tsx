import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Search, User, Plus, Coins, Sparkles, LogOut, MessageCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isLoggedIn = !!user;
  const userCredits = 45;

  // Close post menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setPostMenuOpen(false);
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

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/matches", label: "AI Matches", icon: Sparkles },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl group">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-hero text-white shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-lg">🤝</span>
          </div>
          <span className="hidden sm:inline text-foreground">
            Swap<span className="text-primary">Skills</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
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
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 rounded-xl">
                <Coins className="h-3.5 w-3.5 text-warning" />
                {userCredits} credits
              </Badge>
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
                  <div className="absolute right-0 mt-2 w-48 bg-background rounded-xl border border-border shadow-lg py-1 z-50">
                    <Link
                      to="/services/new"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      onClick={() => setPostMenuOpen(false)}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      Offer a Service
                    </Link>
                    <Link
                      to="/services/new?type=request"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      onClick={() => setPostMenuOpen(false)}
                    >
                      <Search className="h-4 w-4 text-accent-foreground" />
                      Request a Service
                    </Link>
                  </div>
                )}
              </div>
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
          <nav className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {isLoggedIn ? (
                <>
                  <Button variant="accent" className="w-full rounded-xl" asChild>
                    <Link to="/services/new" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="h-4 w-4 mr-1" />
                      Offer a Service
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/services/new?type=request" onClick={() => setMobileMenuOpen(false)}>
                      <Search className="h-4 w-4 mr-1" />
                      Request a Service
                    </Link>
                  </Button>
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
    </header>
  );
}

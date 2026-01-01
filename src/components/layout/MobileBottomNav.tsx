import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide the bottom nav on pages with their own sticky action buttons
  const hiddenPaths = ["/new-service", "/services/new"];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path)) || 
                     location.pathname.match(/^\/services\/[^/]+\/edit$/);
  
  if (shouldHide) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/browse", icon: Search, label: "Browse" },
    { href: user ? "/new-service" : "/auth", icon: PlusCircle, label: "Post", isAction: true },
    { href: user ? "/messages" : "/auth", icon: MessageCircle, label: "Messages" },
    { href: user ? "/profile" : "/auth", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-between h-[72px] px-1">
        {navItems.map((item) => {
          const isActive =
            item.href !== "/auth" &&
            (item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.href}
              aria-label={item.label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-3 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                item.isAction && "relative flex-[1.15]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.isAction ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-40 animate-pulse-soft" />
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3 rounded-full shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-transform duration-200",
                        isActive && "scale-110"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
                      isActive ? "opacity-100" : "opacity-70"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link, useLocation } from "react-router-dom";
import { BookOpen, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileTopMenu() {
  const location = useLocation();

  const menuItems = [
    { href: "/stories", label: "Swap-Skill Stories", icon: BookOpen },
    { href: "/how-it-works", label: "How It Works", icon: Compass },
  ];

  return (
    <nav className="md:hidden sticky top-14 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="container flex items-center justify-center gap-6 h-10">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

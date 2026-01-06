import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, ArrowUpRight, Zap, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoCardProps {
  title: string;
  category: string;
  categoryIcon: string;
  location: string;
  userName: string;
  isTimeSensitive: boolean;
  neededByLabel?: string;
  acceptedCategories?: string[];
}

const DemoCard = ({ 
  title, 
  category, 
  categoryIcon, 
  location, 
  userName, 
  isTimeSensitive, 
  neededByLabel,
  acceptedCategories 
}: DemoCardProps) => (
  <Card className={cn(
    "group overflow-hidden border-[3px] bg-card transition-all duration-300 shadow-md",
    isTimeSensitive 
      ? "border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900/50" 
      : "border-primary/40"
  )}>
    {/* Time Sensitive Banner */}
    {isTimeSensitive && (
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2">
        <Zap className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-semibold">
          {neededByLabel === "ASAP" ? "Needed ASAP!" : `Needed by ${neededByLabel}`}
        </span>
      </div>
    )}
    
    <CardContent className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <Badge variant="default" className="">
          🔄 Skill Swap
        </Badge>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground font-medium">
          <span>{categoryIcon}</span>
          <span className="hidden sm:inline">{category}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2">
        {title}
        <ArrowUpRight className="inline-block ml-1 h-4 w-4 opacity-50" />
      </h3>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
      </div>

      {/* Accepted Categories */}
      {acceptedCategories && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Wants:
            </span>
            {acceptedCategories.map(cat => (
              <span key={cat} className="text-base">{cat}</span>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Avatar className="h-14 w-14 ring-2 ring-background shadow-md shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm truncate">{userName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="font-medium text-warning">4.8</span>
            <span>·</span>
            <span className="font-medium text-primary">3 swaps ✓</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface TimeSensitiveDemoProps {
  onClose: () => void;
}

export function TimeSensitiveDemo({ onClose }: TimeSensitiveDemoProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-2xl font-bold">Time-Sensitive Feature Demo</h2>
            <p className="text-muted-foreground text-sm mt-1">See how urgent requests stand out from regular posts</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Time Sensitive Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Time-Sensitive Requests (Highlighted)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DemoCard
                title="Need Plumber URGENTLY - Burst Pipe!"
                category="Home Repairs"
                categoryIcon="🔧"
                location="Dublin"
                userName="Sarah M."
                isTimeSensitive={true}
                neededByLabel="ASAP"
                acceptedCategories={["🍳", "🧹", "🌱"]}
              />
              <DemoCard
                title="Babysitter needed for Saturday evening"
                category="Childcare"
                categoryIcon="👶"
                location="Cork"
                userName="Michael O."
                isTimeSensitive={true}
                neededByLabel="Jan 11"
                acceptedCategories={["🎸", "📚"]}
              />
            </div>
          </div>
          
          {/* Regular Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Regular Posts (No Urgency)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DemoCard
                title="Offering Guitar Lessons for Beginners"
                category="Music"
                categoryIcon="🎸"
                location="Galway"
                userName="Emma K."
                isTimeSensitive={false}
                acceptedCategories={["🌱", "🍳"]}
              />
              <DemoCard
                title="Garden Design & Landscaping Help"
                category="Gardening"
                categoryIcon="🌱"
                location="Limerick"
                userName="Patrick D."
                isTimeSensitive={false}
                acceptedCategories={["🔧", "🎨"]}
              />
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">How it works:</h4>
            <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
              <li>• Toggle "Time Sensitive" when creating or editing a post</li>
              <li>• Choose "ASAP" or select a specific date you need help by</li>
              <li>• Your post gets an orange highlight and urgent banner</li>
              <li>• Helps community members prioritize who needs help soonest!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

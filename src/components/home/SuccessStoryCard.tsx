import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Quote, Sparkles } from "lucide-react";

export function SuccessStoryCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          {/* Avatar & Identity */}
          <div className="flex sm:flex-col items-center gap-3 sm:gap-2 shrink-0">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                J
              </AvatarFallback>
            </Avatar>
            <div className="sm:text-center">
              <p className="font-semibold text-sm">Jenny</p>
              <p className="text-xs text-muted-foreground">Carlow</p>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                Real Story
              </Badge>
              <span className="text-xs text-muted-foreground">Reiki Practitioner</span>
            </div>

            <p className="text-sm sm:text-base font-medium text-foreground leading-snug">
              3 swaps in 1 month — a website, balayage, and a facial. All through skill swapping.
            </p>

            <div className="flex items-start gap-2 text-muted-foreground">
              <Quote className="h-4 w-4 shrink-0 mt-0.5 text-primary/40" />
              <p className="text-xs sm:text-sm italic leading-relaxed">
                These aren't just transactions — they're relationships.
              </p>
            </div>

            <Link
              to="/stories#jenny-3-swaps"
              onClick={() => {
                setTimeout(() => {
                  const el = document.getElementById('jenny-3-swaps');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
            >
              Read Jenny's story
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

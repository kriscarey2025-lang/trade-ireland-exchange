import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ArrowRight, MapPin } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { serviceUrl as buildServiceUrl } from "@/lib/slugify";
import { ServiceCategory } from "@/types";

export function DemandSection() {
  const { data: services = [], isLoading } = useServices({});

  // Filter to help_request type posts
  const demandPosts = services
    .filter((s) => s.type === "help_request")
    .slice(0, 6);

  if (isLoading || demandPosts.length === 0) return null;

  return (
    <section className="bg-accent/30 border-y border-accent/50 py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              What People Are Looking For
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Someone near you might need your help right now
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to="/?type=help_request">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {demandPosts.map((post) => (
            <Link
              key={post.id}
              to={`/services/${post.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${post.id}`}
              className="group flex items-start gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-soft transition-all"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                {categoryIcons[post.category as ServiceCategory] || "🔍"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {categoryLabels[post.category as ServiceCategory] || post.category}
                  </Badge>
                  {post.location && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {post.location}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link to="/?type=help_request">
              View All Requests <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

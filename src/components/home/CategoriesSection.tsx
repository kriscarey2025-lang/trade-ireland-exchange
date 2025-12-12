import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoriesSection() {
  // Show most popular categories
  const popularCategories = allCategories.slice(0, 8);

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From home improvement to education, find or offer services across dozens of categories.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularCategories.map((category, index) => (
            <Link 
              key={category} 
              to={`/browse?category=${category}`}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Card className={cn(
                "group cursor-pointer hover-lift border-border/50 bg-gradient-card",
                "transition-all duration-300"
              )}>
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                    {categoryIcons[category]}
                  </span>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {categoryLabels[category]}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/browse"
            className="text-primary font-medium hover:underline"
          >
            View all categories →
          </Link>
        </div>
      </div>
    </section>
  );
}

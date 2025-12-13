import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { mockServices } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";

export function FeaturedServicesSection() {
  // Show first 3 services
  const featuredServices = mockServices.slice(0, 3);

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Examples of Potential Services
            </h2>
            <p className="text-muted-foreground">
              These are sample listings for display purposes only — real community offerings coming soon!
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/browse">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service, index) => (
            <div 
              key={service.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

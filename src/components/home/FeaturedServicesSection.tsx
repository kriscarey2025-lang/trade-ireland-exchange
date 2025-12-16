import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { mockServices } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";
export function FeaturedServicesSection() {
  // Show first 3 services
  const featuredServices = mockServices.slice(0, 3);
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured Skill Swaps</h2>
            <p className="text-muted-foreground mt-2">Discover what your community has to offer</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link to="/browse">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link to="/browse">
              View all skill swaps <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
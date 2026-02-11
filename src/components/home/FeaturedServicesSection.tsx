import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { mockServices } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";
export function FeaturedServicesSection() {
  // Show first 3 services
  const featuredServices = mockServices.slice(0, 3);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold font-display mb-2">Featured Skills</h2>
            <p className="text-muted-foreground">
              Check out some of the skills being shared in our community
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
            <a href="https://www.buymeacoffee.com/swapskills" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://img.buymeacoffee.com/button-api/?text=Support Swap Skills&emoji=🤝&slug=swapskills&button_colour=f0740f&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=FFDD00" 
                alt="Support Swap Skills on Buy Me a Coffee"
                height="40"
                width="217"
                className="h-10"
                loading="lazy"
              />
            </a>
            <Link to="/browse">
              <Button variant="outline" className="group">
                Browse All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
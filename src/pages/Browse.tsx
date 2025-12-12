import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { mockServices } from "@/lib/mockData";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";

const locations = ["All Ireland", "Dublin", "Cork", "Galway", "Limerick", "Waterford"];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">(
    (searchParams.get("category") as ServiceCategory) || "all"
  );
  const [selectedLocation, setSelectedLocation] = useState("All Ireland");
  const [selectedType, setSelectedType] = useState<"all" | "offer" | "need">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredServices = useMemo(() => {
    return mockServices.filter((service) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category
      if (selectedCategory !== "all" && service.category !== selectedCategory) {
        return false;
      }

      // Location
      if (selectedLocation !== "All Ireland" && service.location !== selectedLocation) {
        return false;
      }

      // Type
      if (selectedType !== "all" && service.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedType]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("All Ireland");
    setSelectedType("all");
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedLocation !== "All Ireland" || selectedType !== "all";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Services</h1>
            <p className="text-muted-foreground">
              Find services you need or see what others are looking for
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-8 shadow-soft">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-3">
                <Select
                  value={selectedType}
                  onValueChange={(value: "all" | "offer" | "need") => setSelectedType(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="offer">Offerings</SelectItem>
                    <SelectItem value="need">Looking For</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Categories
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Categories
                  </Badge>
                  {allCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {categoryIcons[category]} {categoryLabels[category]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
                <div
                  key={service.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl font-medium mb-2">No services found</p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

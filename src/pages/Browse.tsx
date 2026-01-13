import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCardMobile } from "@/components/services/ServiceCardMobile";
import { ServiceCardCompact } from "@/components/services/ServiceCardCompact";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, SlidersHorizontal, X, Loader2, PackageOpen, UserCheck, LogIn, Gift, HelpCircle, RefreshCw, Sparkles, ArrowRight, LayoutGrid, List, MapPin, ChevronDown, Tag } from "lucide-react";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory, PostCategory } from "@/types";
import { useServices } from "@/hooks/useServices";
import { useDebounce } from "@/hooks/useDebounce";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { postCategoryLabels } from "@/lib/postCategories";
import { MatchesDialog } from "@/components/matching/MatchesDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeroSection } from "@/components/home/HeroSection";

const locations = [
  "All Ireland",
  "Antrim",
  "Armagh",
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Derry",
  "Donegal",
  "Down",
  "Dublin",
  "Fermanagh",
  "Galway",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "Laois",
  "Leitrim",
  "Limerick",
  "Longford",
  "Louth",
  "Mayo",
  "Meath",
  "Monaghan",
  "Offaly",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Tyrone",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
];

export default function Browse() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(() => {
    const categoryParam = searchParams.get("category") as ServiceCategory;
    return categoryParam ? [categoryParam] : [];
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPostType, setSelectedPostType] = useState<PostCategory | "all">("all");
  const [matchesDialogOpen, setMatchesDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Set default to grid view on mobile (Vinted-style 2 columns)
  useEffect(() => {
    if (isMobile) {
      setViewMode("grid");
    }
  }, [isMobile]);

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch services from database (pass first selected category/location or undefined for API)
  const { data: services = [], isLoading, error } = useServices({
    category: selectedCategories.length === 1 ? selectedCategories[0] : "all",
    location: selectedLocations.length === 1 ? selectedLocations[0] : undefined,
    search: debouncedSearch || undefined,
  });

  // Filter by multiple categories on client side when more than one is selected
  const categoryFilteredServices = useMemo(() => {
    if (selectedCategories.length === 0) return services;
    return services.filter((service) => 
      selectedCategories.includes(service.category as ServiceCategory)
    );
  }, [services, selectedCategories]);

  // Filter by multiple locations on client side when more than one is selected
  const locationFilteredServices = useMemo(() => {
    if (selectedLocations.length === 0) return categoryFilteredServices;
    return categoryFilteredServices.filter((service) => 
      selectedLocations.some(loc => 
        service.location?.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }, [categoryFilteredServices, selectedLocations]);

  const toggleCategory = (category: ServiceCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearLocations = () => {
    setSelectedLocations([]);
  };

  // Filter services by post type on the client side
  const filteredServices = useMemo(() => {
    if (selectedPostType === "all") return locationFilteredServices;
    return locationFilteredServices.filter((service) => service.type === selectedPostType);
  }, [locationFilteredServices, selectedPostType]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedPostType("all");
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || selectedLocations.length > 0 || selectedPostType !== "all";

  return (
    <>
      <SEO 
        title="Browse Services"
        description="Find skills and services you need in Ireland. Browse tiling, tutoring, gardening, childcare and more from verified community members."
        keywords="find services Ireland, skill swap Dublin, service exchange Cork, community help Galway"
        url="https://swap-skills.com/browse"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <HeroSection />
        <main className="flex-1 bg-secondary/20">
        <div id="services-section" className="container py-8">

          {/* Matches Dialog */}
          <MatchesDialog 
            open={matchesDialogOpen} 
            onOpenChange={setMatchesDialogOpen} 
            userId={user?.id} 
          />

          {/* Auth Prompt Banner for Non-Logged-In Users */}
          {!user && (
            <>
              {/* Mobile: Floating text banner */}
              <div className="md:hidden mb-4">
                <Link 
                  to="/auth?mode=signup"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full text-xs font-medium text-foreground hover:bg-primary/15 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Sign up to see verified profiles & badges</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                </Link>
              </div>
              
              {/* Desktop: Full banner */}
              <div className="hidden md:flex mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">See full profiles & verification status</p>
                    <p className="text-sm text-muted-foreground">Sign in to view verified badges and complete service information.</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/auth">
                      <LogIn className="h-4 w-4 mr-1" />
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/auth">Join Free</Link>
                  </Button>
                </div>
              </div>
            </>
          )}


          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse All Services</h1>
            <p className="text-muted-foreground">
              Find services you need or see what others are looking for
            </p>
          </div>

          {/* Post Type Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedPostType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPostType("all")}
              className="gap-2"
            >
              All Types
            </Button>
            <Button
              variant={selectedPostType === "free_offer" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPostType("free_offer")}
              className="gap-2"
            >
              <Gift className="h-4 w-4" />
              {postCategoryLabels.free_offer}
            </Button>
            <Button
              variant={selectedPostType === "help_request" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPostType("help_request")}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {postCategoryLabels.help_request}
            </Button>
            <Button
              variant={selectedPostType === "skill_swap" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPostType("skill_swap")}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {postCategoryLabels.skill_swap}
            </Button>
          </div>

          {/* AI Matches CTA - Above search bar */}
          {user && (
            <div className="mb-4 flex justify-start">
              <button 
                onClick={() => setMatchesDialogOpen(true)}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-white px-5 py-2.5 rounded-full font-medium shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Find Your Matches</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-8 shadow-soft">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {selectedLocations.length === 0
                            ? "All Ireland"
                            : selectedLocations.length === 1
                            ? selectedLocations[0]
                            : `${selectedLocations.length} counties`}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0 bg-popover z-50" align="start">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Select Counties</span>
                        {selectedLocations.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={clearLocations}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 space-y-1">
                        {locations.slice(1).map((loc) => (
                          <label
                            key={loc}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedLocations.includes(loc)}
                              onCheckedChange={() => toggleLocation(loc)}
                            />
                            <span className="text-sm">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Tag className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {selectedCategories.length === 0
                            ? "All Categories"
                            : selectedCategories.length === 1
                            ? categoryLabels[selectedCategories[0]]
                            : `${selectedCategories.length} categories`}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[260px] p-0 bg-popover z-50" align="start">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Select Categories</span>
                        {selectedCategories.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={clearCategories}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 space-y-1">
                        {allCategories.map((category) => (
                          <label
                            key={category}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <span className="text-sm flex items-center gap-1.5">
                              {categoryIcons[category]} {categoryLabels[category]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Header with View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} found`}
            </p>
            {/* View toggle - show on mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <>
              {/* Mobile skeleton - 2 column grid */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
              {/* Desktop skeleton */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-xl font-medium mb-2 text-destructive">Error loading services</p>
              <p className="text-muted-foreground mb-4">
                Please try again later
              </p>
            </div>
          ) : filteredServices.length > 0 ? (
            <>
              {/* Mobile View - Vinted style 2-column grid or list */}
              <div className="md:hidden">
                {viewMode === "list" ? (
                  <div className="flex flex-col gap-2">
                    {filteredServices.map((service) => (
                      <ServiceCardCompact key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredServices.map((service) => (
                      <ServiceCardMobile key={service.id} service={service} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Desktop View - Full cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium mb-2">No services found</p>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search query"
                  : "Be the first to post a service!"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

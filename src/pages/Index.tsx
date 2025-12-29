import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdsLayout } from "@/components/layout/AdsLayout";
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
import { Search, SlidersHorizontal, X, Loader2, PackageOpen, UserCheck, LogIn, Gift, HelpCircle, RefreshCw, ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory, PostCategory } from "@/types";
import { useServices } from "@/hooks/useServices";
import { useDebounce } from "@/hooks/useDebounce";
import { SEO } from "@/components/SEO";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { useAuth } from "@/hooks/useAuth";
import { postCategoryLabels } from "@/lib/postCategories";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import { InlineAd } from "@/components/ads/InlineAd";

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

const Index = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">(
    (searchParams.get("category") as ServiceCategory) || "all"
  );
  const [selectedLocation, setSelectedLocation] = useState("All Ireland");
  const [selectedPostType, setSelectedPostType] = useState<PostCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch services from database
  const { data: services = [], isLoading, error } = useServices({
    category: selectedCategory,
    location: selectedLocation,
    search: debouncedSearch || undefined,
  });

  // Filter services by post type on the client side
  const filteredServices = useMemo(() => {
    if (selectedPostType === "all") return services;
    return services.filter((service) => service.type === selectedPostType);
  }, [services, selectedPostType]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("All Ireland");
    setSelectedPostType("all");
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedLocation !== "All Ireland" || selectedPostType !== "all";

  return (
    <>
      <SEO 
        description="Join Ireland's trusted community for trading skills and services without money. Exchange tiling, tutoring, gardening, childcare and more with verified neighbours."
        keywords="skill swap Ireland, service exchange, barter services, trade skills Dublin, skill trading Cork, time bank Galway"
        url="https://swap-skills.com/"
      />
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-secondary/20">
          <AdsLayout>
            {/* Hero Tagline Section */}
            <section className="py-8 md:py-12 bg-gradient-to-b from-background to-secondary/30">
              <div className="container text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4">
                  <span className="gradient-text">Swap skills.</span>{" "}
                  <span className="gradient-text">Make friends.</span>{" "}
                  <span className="text-foreground">Save money.</span>
                </h1>
                <p className="text-sm md:text-lg font-medium text-muted-foreground mb-2">
                  A free, local platform for exchanging skills — no money involved.
                </p>
                <p className="text-xs md:text-sm font-medium tracking-wide mb-4">
                  <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
                    Ireland's first digital & free Barter System
                  </span>
                </p>
                
                {/* Quick CTA for non-logged in users */}
                {!user && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                    <Button size="lg" className="group shadow-lg hover:shadow-xl rounded-full px-6 md:px-8" asChild>
                      <Link to="/auth?mode=signup">
                        Join the Community
                        <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full px-6"
                      onClick={() => setBrainstormOpen(true)}
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Not sure where to start?
                    </Button>
                  </div>
                )}
                
                {/* Quick social proof */}
                <div className="mt-4 md:mt-6 flex items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg md:text-xl">🇮🇪</span>
                    <span>100% Irish</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg md:text-xl">🤝</span>
                    <span>Free Forever</span>
                  </div>
                  <div className="w-px h-4 bg-border hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-lg md:text-xl">✨</span>
                    <span>No Money Needed</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <div className="container py-6 md:py-8">
              {/* Auth Prompt Banner for Non-Logged-In Users */}
              {!user && (
                <div className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                      <Link to="/auth?mode=signup">Join Free</Link>
                    </Button>
                  </div>
                </div>
              )}

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

              {/* Search & Filters */}
              <div className="bg-card rounded-xl border border-border p-4 mb-6 shadow-soft sticky top-14 sm:top-16 z-40">
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

              {/* Results count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} available`}
                </p>
                {user && (
                  <Button size="sm" asChild>
                    <Link to="/new-service">
                      Post a Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Services Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-xl font-medium mb-2 text-destructive">Error loading services</p>
                  <p className="text-muted-foreground mb-4">
                    Please try again later
                  </p>
                </div>
              ) : filteredServices.length > 0 ? (
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
                  <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-xl font-medium mb-2">No services found</p>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your filters or search query"
                      : "Be the first to post a service!"}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                        {user ? "Post a Service" : "Join to Post"}
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Inline Ad - Below Services */}
              <InlineAd className="mt-8" />

              {/* Brainstorm CTA at bottom */}
              {!user && filteredServices.length > 0 && (
                <div className="mt-12 text-center">
                  <button onClick={() => setBrainstormOpen(true)} className="group inline-block">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 p-[2px] hover:from-primary/20 hover:via-accent/20 hover:to-highlight/20 transition-all duration-300">
                      <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-sm group-hover:bg-card/90 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent">
                          <Lightbulb className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            Not sure what to offer or request?
                          </p>
                          <p className="text-sm text-muted-foreground">Let's brainstorm skill swap ideas together!</p>
                        </div>
                        <Sparkles className="h-5 w-5 text-accent group-hover:animate-spin transition-all" />
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </AdsLayout>
        </main>
        <Footer />
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </>
  );
};

export default Index;

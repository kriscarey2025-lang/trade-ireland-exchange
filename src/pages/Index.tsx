import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdsLayout } from "@/components/layout/AdsLayout";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCardMobile } from "@/components/services/ServiceCardMobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Loader2, PackageOpen, UserCheck, LogIn, Gift, HelpCircle, RefreshCw, ArrowRight, Lightbulb, Sparkles, Heart } from "lucide-react";
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
import { ActionRequiredBanner } from "@/components/home/ActionRequiredBanner";
import { ReviewsBanner } from "@/components/home/ReviewsBanner";
import { TopSwappersSection } from "@/components/home/TopSwappersSection";

const locations = ["All Ireland", "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal", "Down", "Dublin", "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Tyrone", "Waterford", "Westmeath", "Wexford", "Wicklow"];
const Index = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">(searchParams.get("category") as ServiceCategory || "all");
  const [selectedLocation, setSelectedLocation] = useState("All Ireland");
  const [selectedPostType, setSelectedPostType] = useState<PostCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch services from database
  const {
    data: services = [],
    isLoading,
    error
  } = useServices({
    category: selectedCategory,
    location: selectedLocation,
    search: debouncedSearch || undefined
  });

  // Filter services by post type on the client side and sort "Website Creation" to the bottom
  const filteredServices = useMemo(() => {
    let result = selectedPostType === "all" ? services : services.filter(service => service.type === selectedPostType);

    // Move "Website Creation" service to the bottom
    return [...result].sort((a, b) => {
      const aIsWebsite = a.title.toLowerCase().includes("website creation");
      const bIsWebsite = b.title.toLowerCase().includes("website creation");
      if (aIsWebsite && !bIsWebsite) return 1;
      if (!aIsWebsite && bIsWebsite) return -1;
      return 0;
    });
  }, [services, selectedPostType]);

  // Get first 3 services for Variant B hero preview
  const heroPreviewServices = useMemo(() => {
    return filteredServices.slice(0, 3);
  }, [filteredServices]);
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("All Ireland");
    setSelectedPostType("all");
    setSearchParams({});
  };
  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedLocation !== "All Ireland" || selectedPostType !== "all";
  const searchFiltersContent = <>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Categories
          </Button>

          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>}
        </div>
      </div>

      {/* Category Filters */}
      {showFilters && <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
              All Categories
            </Badge>
            {allCategories.map(category => <Badge key={category} variant={selectedCategory === category ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(category)}>
                {categoryIcons[category]} {categoryLabels[category]}
              </Badge>)}
          </div>
        </div>}
    </>;
  return <>
      <SEO description="Join Ireland's trusted community for trading skills and services without money. Exchange tiling, tutoring, gardening, childcare and more with verified neighbours." keywords="skill swap Ireland, service exchange, barter services, trade skills Dublin, skill trading Cork, time bank Galway" url="https://swap-skills.com/" />
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <div className="min-h-screen flex flex-col">
        <Header />
        <ActionRequiredBanner />
        <main className="flex-1 bg-secondary/20">
          <AdsLayout>
            {/* Hero Section - COMPACT for mobile, service cards visible on first scroll */}
            <section className="py-4 md:py-10 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
              {/* Subtle animated background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{
                animationDelay: "1s"
              }} />
              </div>
              
              <div className="container text-center relative">
                {/* Mobile-only compact hero */}
                <div className="md:hidden">
                  {/* Trust badge */}
                  {!user && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold mb-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                      </span>
                      25+ neighbours already swapping
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold tracking-tight mb-1.5">
                    <span className="gradient-text">Swap skills.</span>{" "}
                    <span className="text-foreground">Save money.</span>
                  </h1>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    Trade talents with neighbours — <span className="font-semibold text-foreground">100% free</span>
                  </p>
                  
                  {/* Compact social proof strip */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">🇮🇪 Irish Made</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1">🤝 Free Forever</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1">✓ Verified Users</span>
                  </div>
                  
                  {/* Mobile CTA - only for non-logged-in users */}
                  {!user && (
                    <div className="flex gap-2 mb-2">
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-full h-9 text-xs font-semibold shadow-md" 
                        asChild
                      >
                        <Link to="/auth?mode=signup">
                          <Heart className="mr-1.5 h-3.5 w-3.5" />
                          Join Free
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-full h-9 text-xs" 
                        onClick={() => setBrainstormOpen(true)}
                      >
                        <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
                        Get Ideas
                      </Button>
                    </div>
                  )}
                </div>

                {/* Desktop hero - unchanged */}
                <div className="hidden md:block">
                  {!user && <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4 animate-fade-up">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                      Join 25+ neighbours already swapping!
                    </div>}
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4">
                    <span className="gradient-text">Swap skills.</span>{" "}
                    <span className="gradient-text">Make friends.</span>{" "}
                    <span className="text-foreground">Save money.</span>
                  </h1>
                  
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Trade your talents with neighbours — <span className="text-foreground font-semibold">100% free.</span>
                  </p>
                  <p className="text-sm font-medium tracking-wide mb-5">
                    <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
                      Ireland's first digital & free Barter System
                    </span>
                  </p>
                  
                  {/* CTA for non-logged in users */}
                  {!user && (
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button 
                        size="lg" 
                        className="group shadow-xl hover:shadow-2xl rounded-full px-8 w-full sm:w-auto text-base h-14 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary animate-fade-up" 
                        asChild
                      >
                        <Link to="/auth?mode=signup">
                          <Heart className="mr-2 h-5 w-5 animate-pulse" />
                          Get Started — It's Free!
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="rounded-full px-6 w-full sm:w-auto" 
                          asChild
                        >
                          <Link to="/browse">
                            Browse {filteredServices.length}+ active offers
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <button onClick={() => setBrainstormOpen(true)} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 py-2">
                          <Lightbulb className="h-4 w-4" />
                          Need ideas? Let's brainstorm
                        </button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        ✓ No payment required · ✓ No spam · ✓ Cancel anytime
                      </p>
                    </div>
                  )}
                  
                  {/* Social proof badges */}
                  <div className="mt-5 md:mt-6 flex items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg md:text-xl">🇮🇪</span>
                      <span>100% Irish</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg md:text-xl">🤝</span>
                      <span>100% Free</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg md:text-xl">✨</span>
                      <span>No Money Needed</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Social Proof Reviews Banner */}
            <ReviewsBanner />

            {/* Top Swappers Leaderboard */}
            <TopSwappersSection />


              <div id="services-section" className="container py-4 md:py-8">
               {/* Mobile: Condensed search - just essential controls */}
               <div className="md:hidden mb-4">
                 <div className="flex gap-2 mb-3">
                   <div className="flex-1 relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
                   </div>
                   <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                     <SelectTrigger className="w-[100px] h-9 text-xs">
                       <SelectValue placeholder="Location" />
                     </SelectTrigger>
                     <SelectContent>
                       {locations.map(loc => <SelectItem key={loc} value={loc}>
                           {loc}
                         </SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 
                 {/* Mobile inline results + post button */}
                 <div className="flex items-center justify-between mb-2">
                   <p className="text-xs text-muted-foreground">
                     {isLoading ? "Loading..." : `${filteredServices.length} available`}
                   </p>
                   {user && <Button size="sm" className="h-7 text-xs px-3" asChild>
                       <Link to="/new-service">
                         Post Service
                       </Link>
                     </Button>}
                 </div>
               </div>

               {/* Tablet search */}
               <div className="hidden md:block xl:hidden bg-card rounded-xl border border-border p-4 mb-6 shadow-soft">
                 {searchFiltersContent}
               </div>

               {/* Auth Prompt Banner for Non-Logged-In Users - Desktop only */}
               {!user && <div className="hidden md:flex mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                 </div>}

               {/* Post Type Filters - horizontal scroll on mobile */}
               <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                 <Button variant={selectedPostType === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedPostType("all")} className="gap-1.5 shrink-0 text-xs md:text-sm h-8 md:h-9">
                   All
                 </Button>
                 <Button variant={selectedPostType === "free_offer" ? "default" : "outline"} size="sm" onClick={() => setSelectedPostType("free_offer")} className="gap-1.5 shrink-0 text-xs md:text-sm h-8 md:h-9">
                   <Gift className="h-3.5 w-3.5" />
                   Free
                 </Button>
                 <Button variant={selectedPostType === "help_request" ? "default" : "outline"} size="sm" onClick={() => setSelectedPostType("help_request")} className="gap-1.5 shrink-0 text-xs md:text-sm h-8 md:h-9">
                   <HelpCircle className="h-3.5 w-3.5" />
                   Help
                 </Button>
                 <Button variant={selectedPostType === "skill_swap" ? "default" : "outline"} size="sm" onClick={() => setSelectedPostType("skill_swap")} className="gap-1.5 shrink-0 text-xs md:text-sm h-8 md:h-9">
                   <RefreshCw className="h-3.5 w-3.5" />
                   Swap
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5 shrink-0 text-xs md:text-sm h-8 md:h-9">
                   <SlidersHorizontal className="h-3.5 w-3.5" />
                   More
                 </Button>
               </div>

               {/* Category Filters - Expandable */}
               {showFilters && <div className="mb-4 pt-3 border-t border-border">
                   <div className="flex flex-wrap gap-1.5">
                     <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setSelectedCategory("all")}>
                       All
                     </Badge>
                     {allCategories.map(category => <Badge key={category} variant={selectedCategory === category ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setSelectedCategory(category)}>
                         {categoryIcons[category]} {categoryLabels[category]}
                       </Badge>)}
                   </div>
                 </div>}

              {/* Results count - desktop only, mobile has it above */}
              <div className="hidden md:flex mb-4 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} available`}
                </p>
                {user && <Button size="sm" asChild>
                    <Link to="/new-service">
                      Post a Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>}
              </div>

              {/* Services Grid */}
              {isLoading ? <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div> : error ? <div className="text-center py-16">
                  <p className="text-xl font-medium mb-2 text-destructive">Error loading services</p>
                  <p className="text-muted-foreground mb-4">
                    Please try again later
                  </p>
                </div> : filteredServices.length > 0 ? <>
                  <div className="grid grid-cols-2 gap-3 md:hidden">
                    {filteredServices.map((service) => (
                      <ServiceCardMobile key={service.id} service={service} />
                    ))}
                  </div>

                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </> : <div className="text-center py-16">
                  <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-xl font-medium mb-2">No services found</p>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters ? "Try adjusting your filters or search query" : "Be the first to post a service!"}
                  </p>
                  {hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button> : <Button asChild>
                      <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                        {user ? "Post a Service" : "Join to Post"}
                      </Link>
                    </Button>}
                </div>}

              {/* Inline Ad - Below Services */}
              <InlineAd className="mt-8" />

              {/* Brainstorm CTA at bottom */}
              {!user && filteredServices.length > 0 && <div className="mt-12 text-center">
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
                </div>}
            </div>
          </AdsLayout>
        </main>
        <Footer />
        
        {/* Sticky Mobile CTA - Shows for non-logged users */}
        {!user && <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border p-3 shadow-2xl safe-bottom">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Ready to swap skills?</p>
                <p className="text-xs text-muted-foreground">Join free — no card needed</p>
              </div>
              <Button size="sm" className="shrink-0 rounded-full px-4 shadow-lg" asChild>
                <Link to="/auth?mode=signup">
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>}
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </>;
};
export default Index;
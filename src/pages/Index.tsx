import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedServicesSection } from "@/components/home/FeaturedServicesSection";
import { TrustSection } from "@/components/home/TrustSection";
import { FounderStorySection } from "@/components/home/FounderStorySection";
import { CTASection } from "@/components/home/CTASection";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO 
        description="Join Ireland's trusted community for trading skills and services without money. Exchange tiling, tutoring, gardening, childcare and more with verified neighbours."
        keywords="skill swap Ireland, service exchange, barter services, trade skills Dublin, skill trading Cork, time bank Galway"
        url="https://swap-skills.com/"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <HowItWorksSection />
          <CategoriesSection />
          <FeaturedServicesSection />
          <TrustSection />
          <FounderStorySection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;

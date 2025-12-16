import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdsLayout } from "@/components/layout/AdsLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { AppAnnouncementBanner } from "@/components/home/AppAnnouncementBanner";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedServicesSection } from "@/components/home/FeaturedServicesSection";
import { TrustSection } from "@/components/home/TrustSection";
import { FounderStorySection } from "@/components/home/FounderStorySection";
import { CTASection } from "@/components/home/CTASection";
import { InlineAd } from "@/components/ads/InlineAd";
import { SEO } from "@/components/SEO";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";

const Index = () => {
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
        <main className="flex-1">
          <AdsLayout>
            <HeroSection />
            <AppAnnouncementBanner />
            <InlineAd />
            <HowItWorksSection />
            <CategoriesSection />
            <InlineAd />
            <FeaturedServicesSection />
            <TrustSection />
            <InlineAd />
            <FounderStorySection />
            <CTASection />
          </AdsLayout>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;

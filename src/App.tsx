import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/BackToTop";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { EngagementTracker } from "@/components/tracking/EngagementTracker";
import FeedbackSidebar from "@/components/sidebar/FeedbackSidebar";
import { PageLoader } from "@/components/ui/page-loader";
import { CookieConsent } from "@/components/privacy/CookieConsent";

// Eagerly load Browse for fastest initial paint (main landing page)
import Browse from "./pages/Browse";

// Lazy load all other pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const NewService = lazy(() => import("./pages/NewService"));
const EditService = lazy(() => import("./pages/EditService"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversation = lazy(() => import("./pages/Conversation"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Safety = lazy(() => import("./pages/Safety"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const AdminVerification = lazy(() => import("./pages/AdminVerification"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminAdvertisers = lazy(() => import("./pages/AdminAdvertisers"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const AdminPlatformHealth = lazy(() => import("./pages/AdminPlatformHealth"));
const AdvertiserDashboard = lazy(() => import("./pages/AdvertiserDashboard"));
const AIMatches = lazy(() => import("./pages/AIMatches"));
const Advertise = lazy(() => import("./pages/Advertise"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const Stories = lazy(() => import("./pages/Stories"));
const SkillGuide = lazy(() => import("./pages/SkillGuide"));
const SkillGuidesIndex = lazy(() => import("./pages/SkillGuidesIndex"));
const CountySpotlight = lazy(() => import("./pages/CountySpotlight"));
const CountySpotlightsIndex = lazy(() => import("./pages/CountySpotlightsIndex"));
const PressKit = lazy(() => import("./pages/PressKit"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const SeedImages = lazy(() => import("./pages/SeedImages"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Flyer = lazy(() => import("./pages/Flyer"));
const SponsorSuccess = lazy(() => import("./pages/SponsorSuccess"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const CommunityHero = lazy(() => import("./pages/CommunityHero"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EventRSVP = lazy(() => import("./pages/EventRSVP"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Redirect component for singular /service/:id → /services/:id
function ServiceRedirect() {
  const { id } = useParams();
  return <Navigate to={`/services/${id}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <BackToTop />
          <EngagementTracker />
          <FeedbackSidebar />
              <CookieConsent />
          <MobileBottomNav />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Browse />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/home" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/new-service" element={<NewService />} />
              <Route path="/services/new" element={<NewService />} />
              <Route path="/services/:id/edit" element={<EditService />} />
               <Route path="/services/:id" element={<ServiceDetail />} />
               {/* Redirect singular /service/:id to plural /services/:id (fixes Google soft 404s) */}
               <Route path="/service/:id" element={<ServiceRedirect />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:id" element={<Conversation />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/admin/verification" element={<AdminVerification />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/advertisers" element={<AdminAdvertisers />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/admin/health" element={<AdminPlatformHealth />} />
              <Route path="/matches" element={<AIMatches />} />
              <Route path="/ai-matches" element={<AIMatches />} />
              <Route path="/advertiser" element={<AdvertiserDashboard />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/skills" element={<SkillGuidesIndex />} />
              <Route path="/skills/:slug" element={<SkillGuide />} />
              <Route path="/county" element={<CountySpotlightsIndex />} />
              <Route path="/county/:slug" element={<CountySpotlight />} />
              <Route path="/press" element={<PressKit />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/seed-images" element={<SeedImages />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/sponsor-success" element={<SponsorSuccess />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/flyer" element={<Flyer />} />
              <Route path="/community-hero" element={<CommunityHero />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/event/carlow" element={<EventRSVP />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

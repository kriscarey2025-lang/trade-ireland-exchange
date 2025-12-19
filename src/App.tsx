import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/BackToTop";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { EngagementTracker } from "@/components/tracking/EngagementTracker";
import { PromoBanner } from "@/components/layout/PromoBanner";
import FeedbackSidebar from "@/components/sidebar/FeedbackSidebar";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import NewService from "./pages/NewService";
import EditService from "./pages/EditService";
import ServiceDetail from "./pages/ServiceDetail";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import FAQ from "./pages/FAQ";
import Safety from "./pages/Safety";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import AdminVerification from "./pages/AdminVerification";
import AdminReports from "./pages/AdminReports";
import AdminAdvertisers from "./pages/AdminAdvertisers";
import AdminModeration from "./pages/AdminModeration";
import AdminFeedback from "./pages/AdminFeedback";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";
import AIMatches from "./pages/AIMatches";
import Advertise from "./pages/Advertise";
import GettingStarted from "./pages/GettingStarted";
import CommunityBoard from "./pages/CommunityBoard";
import Stories from "./pages/Stories";
import Unsubscribe from "./pages/Unsubscribe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <PromoBanner />
          <ScrollToTop />
          <BackToTop />
          <EngagementTracker />
          <FeedbackSidebar />
          <MobileBottomNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/new-service" element={<NewService />} />
            <Route path="/services/new" element={<NewService />} />
            <Route path="/services/:id/edit" element={<EditService />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
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
            <Route path="/matches" element={<AIMatches />} />
            <Route path="/advertiser" element={<AdvertiserDashboard />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/community" element={<CommunityBoard />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

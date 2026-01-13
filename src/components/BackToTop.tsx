import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackToTop = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hide on business plan page or if not visible
  if (!isVisible || location.pathname === "/business-plan") return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 rounded-full shadow-lg animate-fade-in touch-feedback"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

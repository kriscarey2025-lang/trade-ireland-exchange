import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import swapSkillsLogo from "@/assets/swapskills-logo.png";

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer ref={ref} className="border-t border-border bg-secondary/30 pb-20 md:pb-0">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <img 
                src={swapSkillsLogo} 
                alt="SwapSkills Logo" 
                className="w-10 h-10 rounded-xl"
              />
              <span>
                Swap<span className="text-primary">Skills</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Ireland's community for trading skills and services without money.
            </p>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" asChild>
              <a href="https://www.facebook.com/people/Swap-Skills/61584889451637/?sk=followers" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" />
                Follow Us
              </a>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/browse" className="hover:text-primary transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="hover:text-primary transition-colors">
                  Advertise With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-primary transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-start gap-2 max-w-2xl mx-auto text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              <strong>Disclaimer:</strong> SwapSkills facilitates connections between community members but cannot guarantee 
              the outcome of any exchange. While we provide safety features like ID verification and reviews, 
              users are responsible for their own safety and due diligence. 
              <Link to="/safety" className="text-primary hover:underline ml-1">Learn more</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SwapSkills Ireland. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ for Irish communities</p>
        </div>
      </div>
    </footer>
  );
});

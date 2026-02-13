import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEO 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist on Swap Skills." 
        noindex={true}
        url={`https://swap-skills.ie${location.pathname}`}
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Sorry, this page doesn't exist or may have been moved.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Looking for a service? Try <a href="/browse" className="text-primary underline hover:text-primary/90">browsing all services</a>.
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

const CANONICAL_ORIGIN = "https://swap-skills.ie";

const defaultMeta = {
  title: "Swap Skills | Trade Skills, Not Money",
  description: "Ireland's community for trading skills and services without money. Exchange tiling, tutoring, gardening, childcare and more with verified neighbours.",
  image: `${CANONICAL_ORIGIN}/og-image-social.png?v=3`,
};

export function SEO({
  title,
  description = defaultMeta.description,
  keywords,
  image = defaultMeta.image,
  url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const location = useLocation();
  const fullTitle = title 
    ? `${title} | Swap Skills` 
    : defaultMeta.title;

  // Always build canonical from pathname only (strips query params & fragments)
  const canonicalUrl = url || `${CANONICAL_ORIGIN}${location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="SwapSkills" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@swapskills" />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}

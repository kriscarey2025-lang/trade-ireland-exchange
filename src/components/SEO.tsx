import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

const defaultMeta = {
  title: "Swap Skills | Trade Skills, Not Money",
  description: "Ireland's community for trading skills and services without money. Exchange tiling, tutoring, gardening, childcare and more with verified neighbours.",
  image: "https://swap-skills.com/og-image.png",
  url: "https://swap-skills.com",
};

export function SEO({
  title,
  description = defaultMeta.description,
  keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Swap Skills` 
    : defaultMeta.title;

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
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}

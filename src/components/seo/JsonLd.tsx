interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

interface LocalBusinessJsonLdProps {
  name: string;
  description?: string;
  location?: string;
  url: string;
  image?: string;
}

export function LocalBusinessJsonLd({
  name,
  description,
  location,
  url,
  image,
}: LocalBusinessJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
    description: description || `Verified service provider on Swap Skills`,
    address: {
      "@type": "PostalAddress",
      addressLocality: location || "Ireland",
      addressCountry: "IE",
    },
    areaServed: {
      "@type": "Country",
      name: "Ireland",
    },
  };

  if (image) {
    data.image = image;
  }

  return <JsonLd data={data} />;
}

interface ServiceJsonLdProps {
  name: string;
  description: string;
  provider?: string;
  location?: string;
  price?: number;
  priceType?: string;
  category: string;
  url: string;
  image?: string;
  datePosted: string;
}

export function ServiceJsonLd({
  name,
  description,
  provider,
  location,
  price,
  priceType,
  category,
  url,
  image,
  datePosted,
}: ServiceJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    datePosted,
    category,
    areaServed: {
      "@type": "Country",
      name: "Ireland",
    },
  };

  if (provider) {
    data.provider = {
      "@type": "Person",
      name: provider,
    };
  }

  if (location) {
    data.serviceArea = {
      "@type": "Place",
      name: location,
    };
  }

  if (price && price > 0) {
    data.offers = {
      "@type": "Offer",
      price: price,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: price,
        priceCurrency: "EUR",
        unitCode: priceType === "hourly" ? "HUR" : undefined,
      },
    };
  }

  if (image) {
    data.image = image;
  }

  return <JsonLd data={data} />;
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SwapSkills Ireland",
    alternateName: "Swap Skills",
    url: "https://swap-skills.ie",
    logo: "https://swap-skills.ie/og-image.png",
    description: "Ireland's community for trading skills and services without money. Connect with neighbours to exchange tiling, tutoring, gardening, childcare and more.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Kristina Carey",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IE",
      addressLocality: "Carlow",
    },
    areaServed: {
      "@type": "Country",
      name: "Ireland",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://swap-skills.ie/contact",
    },
    sameAs: [],
  };

  return <JsonLd data={data} />;
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SwapSkills Ireland",
    alternateName: "Swap Skills",
    url: "https://swap-skills.ie",
    description: "Trade skills, not money. Ireland's community for skill swapping and service exchange.",
    inLanguage: "en-IE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://swap-skills.ie/browse?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={data} />;
}

export function PersonJsonLd({ 
  name, 
  description, 
  image, 
  jobTitle,
  url 
}: { 
  name: string; 
  description?: string; 
  image?: string;
  jobTitle?: string;
  url?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
  };

  if (description) data.description = description;
  if (image) data.image = image;
  if (jobTitle) data.jobTitle = jobTitle;
  if (url) data.url = url;

  return <JsonLd data={data} />;
}

export function HowToJsonLd({ 
  name, 
  description, 
  steps 
}: { 
  name: string; 
  description: string; 
  steps: { name: string; text: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return <JsonLd data={data} />;
}

export function ItemListJsonLd({ 
  name, 
  description, 
  items 
}: { 
  name: string; 
  description?: string; 
  items: { name: string; url: string; position: number }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

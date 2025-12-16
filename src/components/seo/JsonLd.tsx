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
    name: "Swap Skills",
    url: "https://swap-skills.com",
    logo: "https://swap-skills.com/og-image.png",
    description: "Ireland's community for trading skills and services without money.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IE",
    },
    sameAs: [],
  };

  return <JsonLd data={data} />;
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Swap Skills",
    url: "https://swap-skills.com",
    description: "Trade skills, not money. Ireland's community for skill swapping.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://swap-skills.com/browse?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={data} />;
}

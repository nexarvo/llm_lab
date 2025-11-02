export default function StructuredData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://llm-lab-three.vercel.app";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LLM Lab",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    url: baseUrl,
    description:
      "LLM Lab is a powerful testing and comparison platform for language models. Run experiments with multiple LLMs, compare outputs, analyze performance metrics, and optimize parameters.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Test multiple language models side-by-side",
      "Compare GPT-4, Claude, Gemini, and more",
      "Run parameter experiments (temperature, top_p, max_tokens)",
      "Analyze performance metrics",
      "Export experiment results",
      "Quality metrics and benchmarking",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LLM Lab",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description:
      "A platform for testing and comparing language models. Compare outputs from multiple LLMs and analyze performance metrics.",
    sameAs: [],
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LLM Lab",
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Test and compare multiple language models side-by-side. Run experiments with GPT-4, Claude, Gemini, and more.",
    featureList: [
      "Multi-model comparison",
      "Parameter optimization",
      "Performance metrics",
      "Quality analysis",
      "PDF export",
    ],
  };

  return (
    <>
      <script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
    </>
  );
}

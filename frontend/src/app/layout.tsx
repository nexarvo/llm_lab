import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import StructuredData from "./components/StructuredData";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://llm-lab-three.vercel.app"
  ),
  title: {
    default:
      "LLM Lab - Test & Compare Language Models | LLM Parameter Experiments",
    template: "%s | LLM Lab",
  },
  description:
    "LLM Lab is a powerful testing and comparison platform for language models. Run experiments with multiple LLMs, compare outputs, analyze performance metrics, and optimize parameters like temperature, top_p, and max_tokens. Compare GPT-4, Claude, Gemini, and more.",
  keywords: [
    "LLM testing",
    "language model comparison",
    "LLM experiments",
    "GPT-4 comparison",
    "Claude testing",
    "Gemini comparison",
    "LLM parameter optimization",
    "language model evaluation",
    "AI model testing",
    "LLM performance metrics",
    "OpenAI testing",
    "Anthropic Claude",
    "Google Gemini",
    "LLM quality metrics",
    "parameter sweeps",
    "LLM benchmarking",
  ],
  authors: [{ name: "LLM Lab" }],
  creator: "LLM Lab",
  publisher: "LLM Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "LLM Lab",
    title: "LLM Lab - Test & Compare Language Models",
    description:
      "Compare and test multiple language models side-by-side. Run experiments with GPT-4, Claude, Gemini, and more. Analyze performance metrics and optimize LLM parameters.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LLM Lab - Language Model Testing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM Lab - Test & Compare Language Models",
    description:
      "Compare and test multiple language models side-by-side. Run experiments with GPT-4, Claude, Gemini, and more.",
    images: ["/og-image.png"],
    creator: "@llmlab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#faf8f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans">
        <StructuredData />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

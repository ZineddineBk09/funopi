import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Spectral } from "next/font/google";
import { sites } from "@/data/sites";
import { routing } from "../../i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  weight: ["400", "500"],
});

const funopiKeywords = Array.from(
  new Set([
    "Funopi",
    "funopi.com",
    "random game generator",
    "press play boredom cure",
    "retro web toys",
    "iframe friendly games",
    "classroom safe boredom button",
    "micro web experiments",
    "random website button",
    "top rated fun sites",
    "funopi leaderboard",
    ...sites.map((site) => site.title),
  ])
);

const description =
  "Funopi is your retro-styled boredom antidote. Smash the glowing play button to launch curated web toys like " +
  sites
    .map((site) => site.title)
    .slice(0, 6)
    .join(", ") +
  " and dozens more, all wrapped in a nostalgic arcade vibe.";

const baseUrl = new URL("https://www.funopi.com");

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "Funopi • Press Play on Random Fun",
    template: "%s • Funopi",
  },
  description,
  keywords: funopiKeywords,
  category: "entertainment",
  creator: "Zineddine Benkhaled",
  authors: [{ name: "Zineddine Benkhaled" }],
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
    },
  },
  openGraph: {
    type: "website",
    url: baseUrl.toString(),
    siteName: "Funopi",
    title: "Funopi • Press Play on Random Fun",
    description,
    images: [
      {
        url: "/funopi-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Funopi glowing play button",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@funopi",
    title: "Funopi • Press Play on Random Fun",
    description,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${playfair.variable} ${spectral.variable} antialiased`}>
        <NextIntlClientProvider
          locale={locale}
          timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        >
          {/* <LanguageSwitcher hideOnAdmin={false} /> */}
          <StructuredData locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function StructuredData({ locale }: { locale: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Funopi",
    url: baseUrl.toString(),
    description,
    inLanguage: locale,
    logo: `${baseUrl}/funopi-preview.png`,
    sameAs: ["https://www.funopi.com"],
    potentialAction: [
      {
        "@type": "SearchAction",
        target: `${baseUrl}/play?tag={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      {
        "@type": "ViewAction",
        name: "Press play",
        target: `${baseUrl}/play`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "../components/I18nProvider";
import "../globals.css";
import { isLocale, locales, type Locale } from "../../i18n/config";
import { getMessages } from "../../i18n/messages";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://anatomy-atelier.openai.site");

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const messages = getMessages(locale);
  const ogImage = {
    url: "/og.jpg",
    width: 1200,
    height: 675,
    alt: messages.metadata.ogImageAlt,
  };

  return {
    metadataBase: new URL(siteUrl),
    title: messages.metadata.title,
    description: messages.metadata.description,
    applicationName: messages.brand.name,
    keywords: messages.metadata.keywords,
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.svg",
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((item) => [item, `/${item}`])),
    },
    openGraph: {
      type: "website",
      siteName: messages.brand.name,
      title: messages.metadata.title,
      description: messages.metadata.ogDescription,
      locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata.title,
      description: messages.metadata.ogDescription,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f0e7",
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const locale = await readLocale(params);
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${sans.variable} ${serif.variable}`}>
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

async function readLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

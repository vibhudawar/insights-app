import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {NextIntlClientProvider, hasLocale} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {SessionProvider} from "./components/providers/SessionProvider";
import "../globals.css";

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Insights - Feature Request Board",
 description:
  "Collect feedback that matters. Build features your users actually want.",
};

export default async function LocaleLayout({
 children,
 params,
}: {
 children: React.ReactNode;
 params: Promise<{locale: string}>;
}) {
 // Ensure that the incoming `locale` is valid
 const {locale} = await params;
 if (!hasLocale(routing.locales, locale)) {
  notFound();
 }

 return (
  <html lang={locale} data-theme="light">
   <body className={`${inter.variable} font-sans antialiased`}>
    <SessionProvider>
     <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </SessionProvider>
   </body>
  </html>
 );
}

export function generateStaticParams() {
 return routing.locales.map((locale: string) => ({locale}));
}

import type { Metadata, Viewport } from "next";
import { Tajawal, Manrope, Cairo, Almarai } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cairo",
});

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: "مجموعة روائس - Rawaes Group",
  description:
    "كيان استثماري مكون من عدة شركات في مجالات وقطاعات مختلفة. الاستثمار، تأجير السيارات، الضيافة، الاستقدام.",
};

/** iOS: viewport-fit=cover يفعّل env(safe-area-inset-*) ويقلل قفزات العرض مع النوتش/الحواف */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} ${manrope.variable} ${cairo.variable} ${almarai.variable} min-h-screen antialiased bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-body`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مجموعة روائس - Rawaes Group",
  description:
    "كيان استثماري مكون من عدة شركات في مجالات وقطاعات مختلفة. الاستثمار، تأجير السيارات، الضيافة، الاستقدام.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}

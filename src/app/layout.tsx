import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import DemoDataInitializer from "@/components/DemoDataInitializer";
import ConvexClientProvider from "./ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hope Music Community",
    template: "%s | Hope Music Community",
  },
  description:
    "Hope Music Community — because you love music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans text-hmc-text">
        <ConvexClientProvider>
          <DemoDataInitializer />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

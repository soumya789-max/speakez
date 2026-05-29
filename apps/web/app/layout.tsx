import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutWrapper from "@/components/layout-wrapper";
export const metadata: Metadata = {
  title: "SpeakEZ – Communication Coach",
  description:
    "AI-powered speech coaching for interviews, pitches, and meetings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="bg-background">
        <body className="font-sans antialiased bg-background">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutWrapper>{children}</LayoutWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

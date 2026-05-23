import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar, MobileHeader, MobileNav } from "@/components/sidebar";

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
            <div className="flex min-h-screen">
              <Sidebar />

              <div className="flex-1 flex flex-col min-w-0">
                <MobileHeader />

                <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
                  {children}
                </main>

                <MobileNav />
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

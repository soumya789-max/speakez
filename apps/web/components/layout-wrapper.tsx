"use client";

import { usePathname } from "next/navigation";
import { Sidebar, MobileHeader, MobileNav } from "@/components/sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLandingPage =
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
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
  );
}
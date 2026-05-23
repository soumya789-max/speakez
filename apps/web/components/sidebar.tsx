"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  History,
  Map,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileSection } from "@/components/UserProfileSection";
import { MobileHeaderAuth } from "@/components/MobileHeaderAuth";

interface NavItemData {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const navItems: NavItemData[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/session", label: "Live Session", icon: Mic },
  { href: "/history", label: "History", icon: History },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/speech", label: "Speech Support", icon: MessageSquare },
];

function NavItem({ href, label, icon: Icon, exact = false }: NavItemData) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href) && (href === "/" ? pathname === "/" : true);

  return (
    <Link href={href} className={cn("nav-link", isActive && "active")}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            SpeakEZ
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <UserProfileSection />
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Mic className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">SpeakEZ</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <MobileHeaderAuth />
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href) &&
            (item.href === "/" ? pathname === "/" : true);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors no-underline",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {item.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

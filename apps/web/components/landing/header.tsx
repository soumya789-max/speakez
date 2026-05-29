"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, Mic } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { userId } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Mic className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            SpeakEZ
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>

          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>

          <Link
            href="#testimonials"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {userId ? (
            <>
              

              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Continue
                </Button>
              </Link>
            </>
          ) : (
            <>

              <Link href="/sign-in">
                <Button className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  )
}
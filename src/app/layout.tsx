import "./globals.css"
import type { Metadata } from "next"
import { Bangers, Inter } from "next/font/google"
import { cn } from "@/lib/utils"

const display = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "AITA: The Game",
  description: "Swipe-style quiz deck backed by MDX files",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(display.variable, body.variable, "antialiased")}>
        {children}
      </body>
    </html>
  )
}

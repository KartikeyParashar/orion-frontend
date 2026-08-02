import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORION | Inventory Optimization",
  description: "Ordering, Replenishment and inventory optimization network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground flex overflow-hidden`}>
        <ThemeProvider defaultTheme="system">
          <div className="flex w-full h-screen overflow-hidden">
            <Sidebar />
            
            <main className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] relative">
              {/* Header */}
              <header className="h-16 border-b border-border bg-white/50 dark:bg-black/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
                <div>
                  {/* Empty space where title used to be */}
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                  </Button>
                  <ModeToggle />
                  <div className="h-8 w-[1px] bg-border mx-1" />
                  <div className="flex items-center gap-3 pl-2 group cursor-pointer transition-opacity hover:opacity-80">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium leading-none">Admin</span>
                      <span className="text-[10px] text-muted-foreground">Operational Manager</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground border-2 border-border/50">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}


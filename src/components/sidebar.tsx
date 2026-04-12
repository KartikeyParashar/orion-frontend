"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BarChart3, 
  Box, 
  Tags, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "DFE",
    description: "Demand Forecasting",
    href: "/dfe",
    icon: BarChart3,
  },
  {
    name: "Inventory Tool",
    description: "Inventory Management",
    href: "/inventory",
    icon: Box,
  },
  {
    name: "Pricing & Promo",
    href: "/pricing",
    icon: Tags,
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside className={cn(
      "relative h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight">ORION</span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.description && (
                    <span className="text-[10px] opacity-70 leading-none mt-0.5">{item.description}</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full transition-all duration-200 flex items-center hover:bg-primary/10 hover:text-primary h-12 rounded-xl",
            collapsed ? "justify-center px-0" : "justify-start px-4 gap-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

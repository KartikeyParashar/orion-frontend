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
  Zap,
  Store,
  ArrowLeftRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    name: "Intelligence Hub",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Store DNA",
    description: "Store Insights",
    href: "/store-dna",
    icon: Store,
  },
  {
    name: "Replenishment Engine",
    description: "Inventory Management",
    href: "/inventory",
    icon: Box,
  },
  {
    name: "Node Rebalancing",
    description: "Inter-Store Replenishment",
    href: "/store-transfer",
    icon: ArrowLeftRight,
  },
  {
    name: "Pricing & Promo",
    href: "/pricing",
    icon: Tags,
  },
  {
    name: "DFE",
    description: "Demand Forecasting",
    href: "/dfe",
    icon: BarChart3,
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
      <div className="p-4 flex items-center justify-center min-h-[96px]">
        {!collapsed ? (
          <div className="w-56 h-28 flex items-center justify-center">
            <img src="/logo.png?v=3" alt="ORION Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
        ) : (
          <div className="w-16 h-16 flex items-center justify-center">
            <img src="/logo.png?v=3" alt="ORION Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
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

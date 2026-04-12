"use client"

import * as React from "react"
import { Box, Search, Package, AlertTriangle } from "lucide-react"
import { salesService, Sale } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function InventoryPage() {
  const [items, setItems] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      setLoading(true)
      const data = await salesService.getSales()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockItems = items.filter(item => item.ending_stock < 50)

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Stock Monitoring</h1>
            <p className="text-sm text-muted-foreground font-medium">Real-time inventory levels across all items</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <Card className="border-rose-500/20 bg-rose-500/5">
             <CardContent className="p-4 flex items-center gap-3">
               <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                 <AlertTriangle className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-rose-500/70">Critical Stock</p>
                 <p className="text-xl font-black">{lowStockItems.length} <span className="text-xs font-bold opacity-60">SKUs</span></p>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-3xl" />)
        ) : (
          items.map((item, idx) => (
            <Card key={idx} className="group overflow-hidden border-border/40 hover:border-primary/20 hover:shadow-xl transition-all duration-300 rounded-3xl">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit text-[10px] font-black tracking-wider uppercase bg-primary/5 text-primary border-primary/20">
                      {item.category}
                    </Badge>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{item.item}</h3>
                    <p className="text-xs text-muted-foreground font-bold opacity-70 flex items-center gap-1">
                      <Box className="w-3 h-3" /> {item.store} • {item.season}
                    </p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl font-black text-xl flex flex-col items-center",
                    item.ending_stock < 50 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {item.ending_stock}
                    <span className="text-[8px] uppercase tracking-tighter opacity-70">Stock</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between text-[10px] font-bold opacity-60">
                    <span>CAPACITY UTILIZATION</span>
                    <span>{Math.min(100, Math.round((item.ending_stock / 1000) * 100))}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", item.ending_stock < 50 ? "bg-rose-500" : "bg-primary")} 
                      style={{ width: `${Math.min(100, (item.ending_stock / 1000) * 100)}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

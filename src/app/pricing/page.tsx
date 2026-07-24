"use client"

import * as React from "react"
import { Tags, TrendingDown, Percent, Info } from "lucide-react"
import { salesService, Sale } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
  const [sales, setSales] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchPricingData()
  }, [])

  const fetchPricingData = async () => {
    try {
      setLoading(true)
      const data = await salesService.getSales()
      setSales(data)
    } catch (error) {
      console.error("Failed to fetch pricing data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter items with significant markdown (> 10%)
  const promos = sales.filter(s => parseFloat(s.markdown_percentage) > 10)

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
          <Tags className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pricing & Promotions</h1>
          <p className="text-sm text-muted-foreground font-medium">Strategic markdown analysis and price optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 rounded-3xl overflow-hidden shadow-lg">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Active Markdown Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="p-6 h-24 bg-muted/10 animate-pulse" />)
              ) : (
                promos.map((promo, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-lg">{promo.item}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-muted-foreground uppercase opacity-70 tracking-widest">{promo.category}</span>
                         <div className="w-1 h-1 rounded-full bg-border" />
                         <span className="text-xs font-bold text-muted-foreground">{promo.store}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black opacity-50 uppercase">Net Price</p>
                        <p className="font-black text-xl text-emerald-500">₹{promo.net_sales_price}</p>
                      </div>
                      <div className="h-10 w-[1px] bg-border" />
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-lg">
                        -{promo.markdown_percentage}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-primary/20 bg-primary/5 rounded-3xl shadow-xl border-2">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-primary">
                <Info className="w-6 h-6" />
                <h3 className="font-black tracking-tight">System Recommendation</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                Based on current inventory levels and sales velocity, we recommend increasing markdowns by <span className="text-primary font-bold">5%</span> for the Autumn collection to clear stock before the next season.
              </p>
              <button className="mt-2 w-full bg-primary text-primary-foreground h-12 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                Generate Simulation
              </button>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 rounded-3xl shadow-md">
            <CardContent className="p-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Pricing Health</h4>
               <div className="flex items-center gap-4">
                 <div className="text-4xl font-black text-primary">94%</div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold">Margin Accuracy</span>
                   <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                     <TrendingDown className="w-3 h-3 rotate-180" /> +2.1% from last week
                   </span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

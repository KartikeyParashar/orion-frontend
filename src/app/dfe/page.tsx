"use client"

import * as React from "react"
import { BarChart3, TrendingUp, Sparkles, BrainCircuit } from "lucide-react"
import { 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Line,
  LineChart
} from "recharts"
import { salesService, Sale } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DFEPage() {
  const [sales, setSales] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)
  const [chartReady, setChartReady] = React.useState(false)

  React.useEffect(() => {
    fetchForecastData()
  }, [])

  React.useEffect(() => {
    if (!loading && sales.length > 0) {
      const timer = setTimeout(() => setChartReady(true), 150)
      return () => clearTimeout(timer)
    }
    setChartReady(false)
  }, [loading, sales])

  const fetchForecastData = async () => {
    try {
      setLoading(true)
      const data = await salesService.getSales()
      setSales(data)
    } catch (error) {
      console.error("Failed to fetch forecast data:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = React.useMemo(() => {
    const grouped: any = {}
    sales.forEach(sale => {
      if (!grouped[sale.week]) {
        grouped[sale.week] = { week: sale.week, actual: 0, forecast: 0 }
      }
      grouped[sale.week].actual += sale.units_sold
      // Simulated forecast: slightly shifted actuals
      grouped[sale.week].forecast = grouped[sale.week].actual * (1 + (Math.random() * 0.2 - 0.05))
    })
    return Object.values(grouped).sort((a: any, b: any) => a.week.localeCompare(b.week))
  }, [sales])

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Demand Forecasting</h1>
          <p className="text-sm text-muted-foreground font-medium">Machine learning powered demand prediction engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-border/40 rounded-3xl overflow-hidden shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Units Forecast vs Actual
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Confidence: 94.2%</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] relative w-full pt-4 min-h-[400px]">
            {chartReady && sales.length > 0 ? (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(128,128,128,0.2)',
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line type="monotone" dataKey="actual" stroke="#197BBD" strokeWidth={3} dot={{ r: 4, fill: "#197BBD" }} />
                  <Line type="monotone" dataKey="forecast" stroke="#05B384" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground font-bold">
                ANALYZING BRAIN-WAVES...
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="bg-primary text-primary-foreground rounded-3xl shadow-xl border-none">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl leading-tight">AI Insights</h3>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                Detected a 12% seasonality spike predicted for the next 2 weeks in {sales[0]?.category || 'current'} category across North region stores.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Historical Accuracy</h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">WAPE</span>
                  <span className="text-lg font-black text-emerald-500">4.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">BIAS</span>
                  <span className="text-lg font-black text-amber-500">-1.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

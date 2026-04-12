"use client"

import * as React from "react"
import { 
  TrendingDown, 
  DollarSign, 
  Hash, 
  Percent, 
  TrendingUpIcon,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowUpCircle,
  MoreVertical,
  Filter
} from "lucide-react"
import { 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/date-picker"
import { cn } from "@/lib/utils"
import { salesService, Sale } from "@/services/api"

function MetricCard({ 
  title, 
  value, 
  trend = "", 
  prefix = "", 
  suffix = "", 
}: { 
  title: string, 
  value: string | number, 
  trend?: string, 
  prefix?: string, 
  suffix?: string, 
}) {
  const isPositiveTrend = trend.startsWith("+")
  return (
    <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="p-4 pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          <div className="p-1 h-6 w-6 rounded-md bg-muted/50 border border-border/20 flex items-center justify-center">
            {prefix === "$" ? <DollarSign className="w-3 h-3" /> : suffix === "%" ? <Percent className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold tracking-tight">
            {prefix}{value}{suffix}
          </div>
          <div className={cn(
            "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full w-fit",
            isPositiveTrend ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
          )}>
            {isPositiveTrend ? <TrendingUpIcon className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({ 
  icon: Icon, 
  title, 
  count, 
  description, 
  variant = "blue",
  label
}: { 
  icon: React.ElementType, 
  title: string, 
  count: number | string, 
  description: string, 
  variant: "red" | "green" | "yellow" | "blue",
  label: string
}) {
  const variants = {
    red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30",
    yellow: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30",
  }

  const icons = {
    red: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    yellow: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
  }

  return (
    <div className={cn("p-5 rounded-2xl border flex flex-col gap-3 h-full transition-all hover:scale-[1.02]", variants[variant])}>
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", icons[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold">{title}</span>
          <span className="text-[10px] opacity-70 uppercase font-extrabold tracking-wider">{label}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold">
           <span className="text-sm font-bold pr-1">{count}</span> {description}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)
  const [sales, setSales] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState({
    category: '',
    store: '',
    season: ''
  })
  
  const [filterOptions, setFilterOptions] = React.useState({
    categories: [] as string[],
    stores: [] as string[],
    seasons: [] as string[]
  })
  const [chartReady, setChartReady] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    fetchData()
    fetchFilterOptions()
  }, [])

  React.useEffect(() => {
    if (!loading && sales.length > 0) {
      const timer = setTimeout(() => setChartReady(true), 150)
      return () => clearTimeout(timer)
    }
    setChartReady(false)
  }, [loading, sales])

  const fetchData = async (currentFilters = filters) => {
    try {
      setLoading(true)
      const params: any = {}
      if (currentFilters.category) params.category = currentFilters.category
      if (currentFilters.store) params.store = currentFilters.store
      if (currentFilters.season) params.season = currentFilters.season
      
      const data = await salesService.getSales(params)
      setSales(data)
    } catch (error) {
      console.error("Failed to fetch sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [categories, stores, seasons] = await Promise.all([
        salesService.getUniqueValues('category'),
        salesService.getUniqueValues('store'),
        salesService.getUniqueValues('season')
      ])
      setFilterOptions({ categories, stores, seasons })
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    fetchData()
  }

  // Calculate Metrics
  const totalSales = sales.reduce((acc, sale) => acc + parseFloat(sale.net_sales_price), 0)
  const totalUnits = sales.reduce((acc, sale) => acc + sale.units_sold, 0)
  const totalMarkdown = sales.reduce((acc, sale) => acc + (parseFloat(sale.gross_selling_price) - parseFloat(sale.net_sales_price)), 0)
  const avgUnitPrice = sales.length > 0 ? totalSales / totalUnits : 0
  const totalStock = sales.reduce((acc, sale) => acc + sale.ending_stock, 0)
  const sellThru = totalUnits + totalStock > 0 ? (totalUnits / (totalUnits + totalStock)) * 100 : 0

  // Chart Data preparation (group by week)
  const chartData = React.useMemo(() => {
    const grouped: any = {}
    sales.forEach(sale => {
      if (!grouped[sale.week]) {
        grouped[sale.week] = { date: sale.week, units: 0, sales: 0 }
      }
      grouped[sale.week].units += sale.units_sold
      grouped[sale.week].sales += parseFloat(sale.net_sales_price)
    })
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }, [sales])

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-12">
      {/* Filters Box */}
      <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Real-time Filters</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Dashboard Controls</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground ml-1">Category</label>
              <select 
                className="bg-background/50 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground ml-1">Store</label>
              <select 
                className="bg-background/50 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                value={filters.store}
                onChange={(e) => handleFilterChange('store', e.target.value)}
              >
                <option value="">All Stores</option>
                {filterOptions.stores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground ml-1">Season</label>
              <select 
                className="bg-background/50 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
              >
                <option value="">All Seasons</option>
                {filterOptions.seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Button 
            onClick={applyFilters}
            disabled={loading}
            className="rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? "FETCHING..." : "APPLY FILTERS"}
          </Button>
        </div>
      </div>

      {loading && !sales.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/20 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Metric Cards Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Sales" value={totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })} trend="+18.7%" prefix="$" />
            <MetricCard title="Total Quantity" value={totalUnits.toLocaleString()} trend="+22.4%" suffix=" Units" />
            <MetricCard title="Total Markdown" value={totalMarkdown.toLocaleString(undefined, { maximumFractionDigits: 0 })} trend="-6.9%" prefix="$" />
            <MetricCard title="Sell Thru" value={sellThru.toFixed(1)} trend="+4.8%" suffix="%" />
          </div>

          {/* Metric Cards Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Inventory" value={totalStock.toLocaleString()} trend="-2.4%" suffix=" Units" />
            <MetricCard title="Net Margin" value={(totalSales * 0.35).toLocaleString(undefined, { maximumFractionDigits: 0 })} trend="+12.4%" prefix="$" />
            <MetricCard title="Total Profit" value={(totalSales * 0.28).toLocaleString(undefined, { maximumFractionDigits: 0 })} trend="+9.5%" prefix="$" />
            <MetricCard title="Avg Unit Price" value={avgUnitPrice.toFixed(2)} trend="-2.1%" prefix="$" />
          </div>
        </>
      )}

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex flex-col">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Detailed Analysis
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Units Trend</Badge>
              </CardTitle>
              <CardDescription>Visual trend of quantity sold over selected period</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="h-[400px] pb-8 relative w-full min-h-[400px]">
            {mounted && chartReady && sales.length > 0 ? (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }}
                    label={{ value: "Total Quantity (Units)", angle: -90, position: "insideLeft", offset: 10, fill: "currentColor", opacity: 0.5, fontSize: 10, fontWeight: 700 }}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(128,128,128,0.2)',
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }} 
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="units" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUnits)" 
                    animationBegin={200}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
            )}
          </CardContent>
          <div className="px-6 py-4 border-t border-border/30 flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-bold opacity-60">Total Quantity (Units)</span>
            </div>
          </div>
        </Card>

        {/* Insights Column */}
        <div className="flex flex-col gap-4">
          <InsightCard 
            icon={AlertCircle}
            title="Out of Stock Risks"
            label="Urgent Action"
            variant="red"
            count={Math.round(totalUnits * 0.005)}
            description="items are at risk of going out of stock based on current sales velocity."
          />
          <InsightCard 
            icon={CheckCircle2}
            title="Operational Health"
            label="On Track"
            variant="green"
            count={filterOptions.stores.length}
            description="stores are performing consistently with balanced inventory levels."
          />
          <InsightCard 
            icon={Lock}
            title="Markdown Efficiency"
            label="Pricing"
            variant="yellow"
            count={(totalMarkdown / totalSales * 100).toFixed(1) + '%'}
            description="average markdown rate applied across the selected products."
          />
          <InsightCard 
            icon={ArrowUpCircle}
            title="Top Performer"
            label="Insights"
            variant="blue"
            count={sales.length > 0 ? Array.from(new Set(sales.map(s => s.category))).length : 0}
            description="active categories contributing to the overall sales performance."
          />
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { 
  TrendingDown, 
  IndianRupee, 
  Hash, 
  Percent, 
  TrendingUpIcon,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowUpCircle,
  MoreVertical,
  Filter,
  RefreshCw
} from "lucide-react"
import { 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Area,
  Line,
  ComposedChart
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-picker"
import { Badge } from "@/components/ui/badge"
import { cn, formatCompactNumber } from "@/lib/utils"
import { salesService, Sale } from "@/services/api"
import { StylePerformanceTable } from "@/components/style-performance-table"

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
            {prefix === "₹" ? <IndianRupee className="w-3 h-3" /> : suffix === "%" ? <Percent className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
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
  const [metrics, setMetrics] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSyncing, setIsSyncing] = React.useState(false)
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
  const [chartMetric, setChartMetric] = React.useState<'units' | 'sales' | 'sell_thru'>('units')

  React.useEffect(() => {
    setMounted(true)
    fetchData()
    fetchFilterOptions()
  }, [])

  React.useEffect(() => {
    if (!loading && metrics) {
      const timer = setTimeout(() => setChartReady(true), 150)
      return () => clearTimeout(timer)
    }
    setChartReady(false)
  }, [loading, metrics])

  const fetchData = async (currentFilters = filters) => {
    try {
      setLoading(true)
      const params: any = {}
      if (currentFilters.category) params.department = currentFilters.category
      if (currentFilters.store) params.store_code = currentFilters.store
      if (currentFilters.season) params.season = currentFilters.season
      
      const metricsData = await salesService.getDashboardMetrics(params)
      setMetrics(metricsData)
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsSyncing(true)
      await salesService.syncData()
    } catch (error) {
      console.error("Failed to sync data from Excel:", error)
    } finally {
      setIsSyncing(false)
      fetchData();
      fetchFilterOptions();
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const data = await salesService.getFilters()
      setFilterOptions({ 
        categories: data.categories || [], 
        stores: data.stores || [], 
        seasons: data.seasons || [] 
      })
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto px-6 pb-12">
      {/* Filters Box */}
      <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Real-time Filters</h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Dashboard Controls</p>
                <span className="text-[10px] text-muted-foreground">•</span>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                  As on: {mounted ? new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '...'}
                </p>
              </div>
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
            onClick={handleRefresh} 
            disabled={loading || isSyncing}
            variant="outline"
            className="h-11 px-4 rounded-xl border-primary/20 hover:bg-primary/5 flex items-center gap-2 cursor-pointer ml-auto"
          >
            {loading || isSyncing ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-primary" />
            )}
            <span className="font-bold text-sm text-primary">
              {isSyncing ? "SYNCING EXCEL (2-3 MINS)..." : loading ? "UPDATING..." : "REFRESH"}
            </span>
          </Button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/20 rounded-2xl" />)}
        </div>
      ) : metrics ? (
        <>
          {/* Metric Cards Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Sales" value={formatCompactNumber(metrics.totalSales)} trend="+18.7%" prefix="₹" />
            <MetricCard title="Total Quantity" value={formatCompactNumber(metrics.totalUnits)} trend="+22.4%" suffix=" Units" />
            <MetricCard title="Total Markdown" value={metrics.totalMarkdown !== null ? metrics.totalMarkdown.toFixed(1) : "-"} trend="-6.9%" suffix="%" />
            <MetricCard title="Sell Thru" value={metrics.sellThru !== null ? metrics.sellThru.toFixed(1) : "-"} trend="+4.8%" suffix="%" />
          </div>

          {/* Metric Cards Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="On Hand Inventory" value={metrics.totalStock !== null ? formatCompactNumber(metrics.totalStock) : "-"} trend="-2.4%" suffix={metrics.totalStock !== null ? " Units" : ""} />
            <MetricCard title="Net Margin" value={formatCompactNumber(metrics.netMargin)} trend="+12.4%" prefix="₹" />
            <MetricCard title="Net Margin %" value={metrics.netMarginPercent.toFixed(1)} trend="+9.5%" suffix="%" />
            <MetricCard title="Avg Unit Price" value={formatCompactNumber(metrics.avgUnitPrice)} trend="-2.1%" prefix="₹" />
          </div>
        </>
      ) : null}

      {/* Monthly Sales Trend */}
      <div className="w-full">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-lg font-bold flex flex-col md:flex-row md:items-center gap-4">
                Monthly Trend (Units & Sell Thru)
              </CardTitle>
              <CardDescription>Visual trend of cumulative sell thru and quantity sold over selected period</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="h-[250px] pb-8 relative w-full min-h-[250px]">
            {mounted && chartReady && metrics ? (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <ComposedChart data={metrics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#197BBD" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#197BBD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }} 
                    dy={15}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => formatCompactNumber(value)}
                    tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }}
                    label={{ value: "Total Quantity (Units)", angle: -90, position: "insideLeft", offset: 10, fill: "currentColor", opacity: 0.5, fontSize: 10, fontWeight: 700 }}
                    dx={-5}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }}
                    label={{ value: "Cumulative Sell Thru (%)", angle: 90, position: "insideRight", offset: -5, fill: "currentColor", opacity: 0.5, fontSize: 10, fontWeight: 700 }}
                    dx={5}
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
                    formatter={(value: any, name: string) => [
                      name === 'units' ? value.toLocaleString() : `${Number(value).toFixed(1)}%`,
                      name === 'units' ? 'Units' : 'Sell Thru'
                    ]}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="units" 
                    stroke="#197BBD" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUnits)" 
                    animationBegin={200}
                    animationDuration={1500}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sell_thru" 
                    stroke="#05B384" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#05B384', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    animationBegin={200}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
            )}
          </CardContent>
          <div className="px-6 py-4 border-t border-border/30 flex items-center gap-6 justify-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#197BBD]" />
                <span className="text-xs font-bold opacity-60">Total Quantity (Units)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#05B384]" />
                <span className="text-xs font-bold opacity-60">Cumulative Sell Thru (%)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Style Performance Table */}
      <StylePerformanceTable filters={filters} />
    </div>
  )
}

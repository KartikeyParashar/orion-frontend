"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { salesService } from "@/services/api"
import { formatCompactNumber, cn } from "@/lib/utils"
import { ArrowUpDown, Loader2, PackageSearch } from "lucide-react"

export interface StylePerformanceData {
  style: string
  launch_date: string | null
  total_stores: number
  total_sales: number
  total_buy_qty: number
  sell_thru_pct: number
  sell_thru_per_week: number
  weeks_since_launch: number
  ros_weeks: number
  gross_revenue: number
  net_revenue: number
  markdown_dollar: number
  markdown_pct: number
  asp: number
  weeks_since_last_sale: number
}

interface StylePerformanceTableProps {
  filters: Record<string, string>
}

type SortConfig = {
  key: keyof StylePerformanceData | null
  direction: "asc" | "desc"
}

export function StylePerformanceTable({ filters }: StylePerformanceTableProps) {
  const [data, setData] = useState<StylePerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "total_sales", direction: "desc" })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.category) params.department = filters.category
      if (filters.store) params.store_code = filters.store
      if (filters.season) params.season = filters.season

      const result = await salesService.getStylePerformance(params)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch style performance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: keyof StylePerformanceData) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof StylePerformanceData]
        const bValue = b[sortConfig.key as keyof StylePerformanceData]
        if (aValue === null) return 1
        if (bValue === null) return -1
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [data, sortConfig])

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof StylePerformanceData }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer hover:bg-muted/50 hover:text-foreground transition-colors group whitespace-nowrap"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity", sortConfig.key === sortKey && "opacity-100 text-primary")} />
      </div>
    </th>
  )

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-primary" />
              Style Performance
            </CardTitle>
            <CardDescription>Comprehensive metric breakdown per style based on active filters</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto max-h-[600px] border-t border-border/40">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
            <PackageSearch className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium">No styles found for selected filters</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-max">
            <thead className="bg-muted/30 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                <SortableHeader label="Style" sortKey="style" />
                <SortableHeader label="Launch Date" sortKey="launch_date" />
                <SortableHeader label="Stores" sortKey="total_stores" />
                <SortableHeader label="Sales Qty" sortKey="total_sales" />
                <SortableHeader label="Buy Qty" sortKey="total_buy_qty" />
                <SortableHeader label="Sell Thru %" sortKey="sell_thru_pct" />
                <SortableHeader label="ST % / Wk" sortKey="sell_thru_per_week" />
                <SortableHeader label="Wks Since Launch" sortKey="weeks_since_launch" />
                <SortableHeader label="ROS (Wks)" sortKey="ros_weeks" />
                <SortableHeader label="Net Rev" sortKey="net_revenue" />
                <SortableHeader label="Gross Rev" sortKey="gross_revenue" />
                <SortableHeader label="Markdown ($)" sortKey="markdown_dollar" />
                <SortableHeader label="Markdown (%)" sortKey="markdown_pct" />
                <SortableHeader label="ASP" sortKey="asp" />
                <SortableHeader label="Weeks Since Last Sale" sortKey="weeks_since_last_sale" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {sortedData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{row.style}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.launch_date || "N/A"}</td>
                  <td className="px-4 py-3 font-medium">{row.total_stores}</td>
                  <td className="px-4 py-3 font-medium">{row.total_sales.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.total_buy_qty.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", 
                      row.sell_thru_pct > 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                      row.sell_thru_pct > 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                      "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}>
                      {row.sell_thru_pct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-muted-foreground">{row.sell_thru_per_week.toFixed(2)}%</td>
                  <td className="px-4 py-3 font-medium text-muted-foreground">{row.weeks_since_launch.toFixed(1)}</td>
                  <td className="px-4 py-3 font-medium">{row.ros_weeks.toFixed(1)}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(row.net_revenue)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.gross_revenue)}</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-medium">{formatCurrency(row.markdown_dollar)}</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-medium">{row.markdown_pct.toFixed(1)}%</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(row.asp)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.weeks_since_last_sale.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}

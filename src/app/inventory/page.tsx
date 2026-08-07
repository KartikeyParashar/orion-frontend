"use client"

import * as React from "react"
import { Package, Download, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown, Clock, RefreshCw } from "lucide-react"
import { salesService } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InventoryNeed {
  store_code: string;
  item_code: string;
  group: string;
  department: string;
  current_stock: number;
  weekly_ros: number;
  weekly_ros_8w: number;
  weekly_ros_12w: number;
  demand_2_weeks: number;
  need: number;
  warehouse_stock: number;
  weeks_since_launch: number;
  sell_thru: number;
}

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryNeed[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [sortConfig, setSortConfig] = React.useState<{key: keyof InventoryNeed, direction: 'asc'|'desc'} | null>(null)

  React.useEffect(() => {
    fetchNeeds()
  }, [])

  const fetchNeeds = async () => {
    try {
      setLoading(true)
      const data = await salesService.getInventoryNeeds()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch inventory needs:", error)
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
      fetchNeeds()
    }
  }

  const handleSort = (key: keyof InventoryNeed) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const downloadCSV = () => {
    if (items.length === 0) return;
    
    const headers = [
      "Store Code", 
      "Item Code", 
      "Department", 
      "Current Stock", 
      "Sell Thru %",
      "4-Week ROS", 
      "8-Week ROS", 
      "12-Week ROS", 
      "Weeks Since Launch",
      "2-Week Demand",
      "Need",
      "Warehouse Stock"
    ];

    const rows = sortedItems.map(item => [
      item.store_code,
      item.item_code,
      item.department,
      item.current_stock,
      item.sell_thru,
      item.weekly_ros,
      item.weekly_ros_8w,
      item.weekly_ros_12w,
      item.weeks_since_launch,
      item.demand_2_weeks,
      item.need,
      item.warehouse_stock
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventory_Needs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof InventoryNeed }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1 text-primary" />
      : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
  }

  const totalNeedUnits = items.reduce((sum, i) => sum + i.need, 0);

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Demand Forecasting & Replenishment</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Calculate ROS and 2-week inventory needs across all stores.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Card className="border-rose-500/20 bg-rose-500/5">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                 <AlertTriangle className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-rose-500/70 tracking-wider">Total Needs</p>
                 <p className="text-xl font-black">
                   {Math.round(totalNeedUnits).toLocaleString()} <span className="text-xs font-bold opacity-60">UNITS</span>
                 </p>
               </div>
             </CardContent>
           </Card>

           <Button 
            onClick={handleRefresh} 
            disabled={loading || isSyncing}
            variant="outline"
            className="h-[72px] px-6 rounded-2xl border-primary/20 hover:bg-primary/5 shadow-sm transition-all flex items-center gap-3 cursor-pointer"
           >
             <RefreshCw className={`w-5 h-5 ${isSyncing || loading ? 'animate-spin' : ''}`} />
             <div className="flex flex-col items-start">
               <span className="font-bold text-sm">{isSyncing ? "Syncing..." : "Refresh"}</span>
               <span className="text-[10px] opacity-80 uppercase tracking-widest">{isSyncing ? "2-3 mins wait" : "Latest Data"}</span>
             </div>
           </Button>
           
           <Button 
            onClick={downloadCSV} 
            disabled={items.length === 0 || loading}
            className="h-[72px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/25 transition-all flex items-center gap-3 cursor-pointer"
           >
             <Download className="w-5 h-5" />
             <div className="flex flex-col items-start">
               <span className="font-bold text-sm">Export to Excel</span>
               <span className="text-[10px] opacity-80 uppercase tracking-widest">CSV format</span>
             </div>
           </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-border/40 shadow-xl overflow-hidden bg-background/50 backdrop-blur-xl">
        <div className="overflow-x-auto max-h-[800px]">
          <table className="w-full text-sm text-left relative">
            <thead className="text-[11px] uppercase tracking-wider bg-muted/95 text-muted-foreground font-bold border-b border-border/40 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('store_code')}>
                  <div className="flex items-center">Store Code <SortIcon columnKey="store_code" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('item_code')}>
                  <div className="flex items-center">Item Code <SortIcon columnKey="item_code" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center">Department <SortIcon columnKey="department" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('current_stock')}>
                  <div className="flex items-center justify-end">Current Stock <SortIcon columnKey="current_stock" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('sell_thru')}>
                  <div className="flex items-center justify-end">Sell Thru % <SortIcon columnKey="sell_thru" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('weekly_ros')}>
                  <div className="flex items-center justify-end">4-Wk ROS <SortIcon columnKey="weekly_ros" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('weekly_ros_8w')}>
                  <div className="flex items-center justify-end">8-Wk ROS <SortIcon columnKey="weekly_ros_8w" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('weekly_ros_12w')}>
                  <div className="flex items-center justify-end">12-Wk ROS <SortIcon columnKey="weekly_ros_12w" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('weeks_since_launch')}>
                  <div className="flex items-center justify-end">Wks Since Launch <SortIcon columnKey="weeks_since_launch" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('demand_2_weeks')}>
                  <div className="flex items-center justify-end">2-Wk Demand <SortIcon columnKey="demand_2_weeks" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('need')}>
                  <div className="flex items-center justify-end">Need <SortIcon columnKey="need" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('warehouse_stock')}>
                  <div className="flex items-center justify-end">Warehouse Stock <SortIcon columnKey="warehouse_stock" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No inventory data available.</p>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground/80">{item.store_code}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.item_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-primary/5 text-primary border-primary/20">
                        {item.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {item.current_stock.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-90 text-blue-600">
                      {item.sell_thru.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-70">
                      {item.weekly_ros.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-70">
                      {item.weekly_ros_8w.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-70">
                      {item.weekly_ros_12w.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-70">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{item.weeks_since_launch.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {Math.ceil(item.demand_2_weeks).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.need > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          {Math.ceil(item.need).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-emerald-500 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-block">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-80">
                      {item.warehouse_stock.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

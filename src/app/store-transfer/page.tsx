"use client"

import * as React from "react"
import { ArrowLeftRight, Download, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown, RefreshCw, Warehouse } from "lucide-react"
import { salesService } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Transfer {
  item_code: string;
  department: string;
  from_store: string;
  from_grade: string;
  from_state: string;
  from_address: string;
  from_soh_before: number;
  to_store: string;
  to_grade: string;
  to_state: string;
  to_address: string;
  to_soh_before: number;
  qty: number;
}

interface Unresolved {
  item_code: string;
  department: string;
  store_code: string;
  grade: string;
  state: string;
  still_short: number;
}

const gradeBadgeClass = (grade: string) => {
  switch (grade) {
    case 'A+': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case 'A': return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case 'B': return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    default: return "bg-muted text-muted-foreground border-border"
  }
}

export default function StoreTransferPage() {
  const [transfers, setTransfers] = React.useState<Transfer[]>([])
  const [unresolved, setUnresolved] = React.useState<Unresolved[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Transfer, direction: 'asc' | 'desc' } | null>(null)

  const fetchPlan = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await salesService.getTransferPlan()
      setTransfers(data.transfers || [])
      setUnresolved(data.unresolved || [])
    } catch (error) {
      console.error("Failed to fetch transfer plan:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const handleSort = (key: keyof Transfer) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const sortedTransfers = React.useMemo(() => {
    const items = [...transfers];
    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [transfers, sortConfig]);

  const downloadCSV = () => {
    if (transfers.length === 0) return;

    const headers = [
      "Item Code", "Department",
      "From Store", "From Address", "From Grade", "From SOH (Before)",
      "To Store", "To Address", "To Grade", "To SOH (Before)",
      "Qty"
    ];
    const rows = sortedTransfers.map(t => [
      t.item_code, t.department,
      t.from_store, t.from_address, t.from_grade, t.from_soh_before,
      t.to_store, t.to_address, t.to_grade, t.to_soh_before,
      t.qty
    ]);

    const escapeCsv = (value: string | number) => {
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Store_Transfer_Plan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof Transfer }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-1 text-primary" />
      : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
  }

  const totalTransferUnits = transfers.reduce((sum, t) => sum + t.qty, 0);
  const totalShortUnits = unresolved.reduce((sum, u) => sum + u.still_short, 0);

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Store-to-Store Transfer</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Recommended inter-store transfers for needs the warehouse can&apos;t cover.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">Recommended Transfers</p>
                <p className="text-xl font-black">
                  {Math.round(totalTransferUnits).toLocaleString()} <span className="text-xs font-bold opacity-60">UNITS</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-500/70 tracking-wider">Still Short</p>
                <p className="text-xl font-black">
                  {Math.round(totalShortUnits).toLocaleString()} <span className="text-xs font-bold opacity-60">UNITS</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={fetchPlan}
            disabled={loading}
            variant="outline"
            className="h-[72px] px-6 rounded-2xl border-primary/20 hover:bg-primary/5 shadow-sm transition-all flex items-center gap-3 cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Recalculate</span>
              <span className="text-[10px] opacity-80 uppercase tracking-widest">Latest Data</span>
            </div>
          </Button>

          <Button
            onClick={downloadCSV}
            disabled={transfers.length === 0 || loading}
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
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-sm text-left relative">
            <thead className="text-[11px] uppercase tracking-wider bg-muted/95 text-muted-foreground font-bold border-b border-border/40 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('item_code')}>
                  <div className="flex items-center">Item Code <SortIcon columnKey="item_code" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center">Department <SortIcon columnKey="department" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('from_store')}>
                  <div className="flex items-center">From Store <SortIcon columnKey="from_store" /></div>
                </th>
                <th className="px-6 py-5">From Address</th>
                <th className="px-6 py-5">From Grade</th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('from_soh_before')}>
                  <div className="flex items-center justify-end">From SOH (Before) <SortIcon columnKey="from_soh_before" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors" onClick={() => handleSort('to_store')}>
                  <div className="flex items-center">To Store <SortIcon columnKey="to_store" /></div>
                </th>
                <th className="px-6 py-5">To Address</th>
                <th className="px-6 py-5">To Grade</th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('to_soh_before')}>
                  <div className="flex items-center justify-end">To SOH (Before) <SortIcon columnKey="to_soh_before" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer group hover:bg-muted/100 transition-colors text-right" onClick={() => handleSort('qty')}>
                  <div className="flex items-center justify-end">Qty <SortIcon columnKey="qty" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-muted/60 rounded w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : sortedTransfers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-muted-foreground">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No transfers needed right now.</p>
                  </td>
                </tr>
              ) : (
                sortedTransfers.map((t, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{t.item_code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-primary/5 text-primary border-primary/20">
                        {t.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">{t.from_store}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[220px] truncate" title={t.from_address}>{t.from_address}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-[10px] font-bold ${gradeBadgeClass(t.from_grade)}`}>
                        {t.from_grade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-80">
                      {Math.round(t.from_soh_before).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">{t.to_store}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[220px] truncate" title={t.to_address}>{t.to_address}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-[10px] font-bold ${gradeBadgeClass(t.to_grade)}`}>
                        {t.to_grade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium opacity-80">
                      {Math.round(t.to_soh_before).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {Math.ceil(t.qty).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {unresolved.length > 0 && (
        <Card className="rounded-3xl border-rose-500/20 shadow-xl overflow-hidden bg-background/50 backdrop-blur-xl">
          <div className="p-6 border-b border-border/40 flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-lg font-bold">Unresolved Shortages</h2>
              <p className="text-xs text-muted-foreground">
                Need left after warehouse allocation and store transfers &mdash; no eligible donor was available (often C-grade stores, which cannot receive transfers).
              </p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="text-[11px] uppercase tracking-wider bg-muted/95 text-muted-foreground font-bold border-b border-border/40 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4 text-right">Still Short</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {unresolved.map((u, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{u.item_code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-primary/5 text-primary border-primary/20">
                        {u.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground/80">{u.store_code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`text-[10px] font-bold ${gradeBadgeClass(u.grade)}`}>
                        {u.grade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.state}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        {Math.ceil(u.still_short).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

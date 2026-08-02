"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, IndianRupee, Receipt, TrendingUp, BarChart3, Activity, PieChart as PieChartIcon } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

import storeData from "./store_data.json";

// We keep the variable name mockStores for consistency with the rest of the component
const mockStores = storeData;

export default function StoreDnaPage() {
  const [selectedStoreId, setSelectedStoreId] = useState(mockStores[0].id)
  
  const selectedStore = mockStores.find(s => s.id === selectedStoreId) || mockStores[0]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Store DNA</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed insights and performance metrics by store.</p>
        </div>
        <div className="w-full md:w-72">
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-full h-12 text-lg rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm focus:ring-primary/30">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
              {mockStores.map((store) => (
                <SelectItem key={store.id} value={store.id} className="text-base py-3 cursor-pointer">
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{selectedStore.name}</h2>
            <Badge variant="default" className="text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20">
              Grade {selectedStore.grade}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground mt-2 gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{selectedStore.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border">
          <Store className="w-5 h-5 text-primary" />
          <span className="font-medium">Store ID: {selectedStore.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="font-medium flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-500" />
              Revenue / Sq Ft
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedStore.revenuePerSqFt}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="font-medium flex items-center gap-2">
              <Receipt className="w-4 h-4 text-green-500" />
              Avg Bill Value
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedStore.avgBillValue}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Sell Thru
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedStore.sellThru}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-none shadow-md bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Rate of Sale (4W)
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedStore.rateOfSale.fourWeek} <span className="text-sm font-normal text-muted-foreground">units/wk</span></CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
              Size Distribution
            </CardTitle>
            <CardDescription>Inventory and sales distribution across sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedStore.sizeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="size" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', opacity: 0.7 }}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Department Sales
            </CardTitle>
            <CardDescription>Revenue split by department</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedStore.departmentSales}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {selectedStore.departmentSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${(value as number).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Rate of Sale Trends</CardTitle>
          <CardDescription>Historical performance metrics (units per week)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-accent/40 flex flex-col gap-1 items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">4 Week Average</span>
              <span className="text-3xl font-bold">{selectedStore.rateOfSale.fourWeek}</span>
            </div>
            <div className="p-4 rounded-xl bg-accent/40 flex flex-col gap-1 items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">8 Week Average</span>
              <span className="text-3xl font-bold">{selectedStore.rateOfSale.eightWeek}</span>
            </div>
            <div className="p-4 rounded-xl bg-accent/40 flex flex-col gap-1 items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">12 Week Average</span>
              <span className="text-3xl font-bold">{selectedStore.rateOfSale.twelveWeek}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

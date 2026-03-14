import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Package, AlertTriangle, TruckIcon, ArrowRightLeft, ClipboardList } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["hsl(239, 84%, 59%)", "hsl(187, 92%, 43%)", "hsl(160, 84%, 39%)", "hsl(280, 84%, 39%)", "hsl(30, 84%, 39%)"];

import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const response = await api.get("dashboard/");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 bg-muted rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl border border-border" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[320px] bg-muted rounded-xl border border-border" />
          <div className="h-[320px] bg-muted rounded-xl border border-border" />
        </div>
        <div className="h-64 bg-muted rounded-xl border border-border" />
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.first_name || 'User'} 
          <span className="text-muted-foreground font-normal ml-2">
            ({user?.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'})
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your inventory operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Total Products" value={kpi.total_products?.toString() || "0"} icon={Package} progress={100} />
        <KPICard title="Low Stock Items" value={kpi.low_stock_items?.toString() || "0"} icon={AlertTriangle} progress={kpi.low_stock_items > 0 ? 100 : 0} progressColor="bg-warning" />
        <KPICard title="Pending Receipts" value={kpi.pending_receipts?.toString() || "0"} icon={TruckIcon} progress={100} progressColor="bg-secondary" />
        <KPICard title="Pending Deliveries" value={kpi.pending_deliveries?.toString() || "0"} icon={TruckIcon} progress={100} />
        <KPICard title="Internal Transfers" value={kpi.internal_transfers?.toString() || "0"} icon={ArrowRightLeft} progress={100} progressColor="bg-success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Stock Levels by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.bar_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
              <Bar dataKey="stock" fill="hsl(239, 84%, 59%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Warehouse Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={charts.pie_data || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {(charts.pie_data || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {(charts.pie_data || []).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Inventory Activity</h3>
        <DataTable
          columns={[
            { key: "id", header: "ID" },
            { key: "product", header: "Product" },
            { key: "location", header: "Location" },
            { key: "qty", header: "Qty Change", render: (item) => (
              <span className={`tabular-nums font-medium ${item.qty.startsWith("+") ? "text-success" : "text-destructive"}`}>{item.qty}</span>
            )},
            { key: "type", header: "Type" },
            { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
            { key: "date", header: "Date" },
          ]}
          data={recentActivity}
        />
      </div>
    </div>
  );
}

import { Package, AlertTriangle, TruckIcon, ArrowRightLeft, ClipboardList } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { category: "Electronics", stock: 420 },
  { category: "Furniture", stock: 280 },
  { category: "Raw Materials", stock: 650 },
  { category: "Packaging", stock: 190 },
  { category: "Tools", stock: 340 },
];

const pieData = [
  { name: "Main Warehouse", value: 45 },
  { name: "Production", value: 30 },
  { name: "Storage", value: 25 },
];

const PIE_COLORS = ["hsl(239, 84%, 59%)", "hsl(187, 92%, 43%)", "hsl(160, 84%, 39%)"];

const recentActivity = [
  { id: "MOV-001", product: "Steel Bolts M8", location: "Main Warehouse", qty: "+500", type: "Receipt", status: "done" as const, date: "2026-03-14" },
  { id: "MOV-002", product: "Office Chair Pro", location: "Storage B", qty: "-25", type: "Delivery", status: "ready" as const, date: "2026-03-14" },
  { id: "MOV-003", product: "Copper Wire 2mm", location: "Production", qty: "+200", type: "Transfer", status: "waiting" as const, date: "2026-03-13" },
  { id: "MOV-004", product: "Packing Tape", location: "Main Warehouse", qty: "-15", type: "Adjustment", status: "done" as const, date: "2026-03-13" },
  { id: "MOV-005", product: "LED Panel 60x60", location: "Storage A", qty: "+100", type: "Receipt", status: "draft" as const, date: "2026-03-12" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your inventory operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Total Products" value="1,284" trend="+12%" trendUp icon={Package} progress={78} />
        <KPICard title="Low Stock Items" value="12" trend="-4%" trendUp={false} icon={AlertTriangle} progress={15} progressColor="bg-warning" />
        <KPICard title="Pending Receipts" value="8" icon={TruckIcon} progress={45} progressColor="bg-secondary" />
        <KPICard title="Pending Deliveries" value="23" icon={TruckIcon} progress={62} />
        <KPICard title="Internal Transfers" value="5" icon={ArrowRightLeft} progress={30} progressColor="bg-success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Stock Levels by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
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
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
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

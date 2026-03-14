import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Mock data removed
const types = ["All", "Receipt", "Delivery", "Transfer", "Adjustment"];

export default function MoveHistoryPage() {
  const [filter, setFilter] = useState("All");

  const { data: moves = [], isLoading } = useQuery({
    queryKey: ["moves"],
    queryFn: async () => (await api.get("/moves/")).data,
  });

  const filtered = filter === "All" ? moves : moves.filter((m: any) => m.move_type_display === filter);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Move History</h1>
        <p className="text-sm text-muted-foreground">Track all stock movements</p>
      </div>

      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "id", header: "Movement ID", render: (item) => <span className="font-mono text-xs tabular-nums">MOV-{item.id.toString().padStart(4, '0')}</span> },
          { key: "product", header: "Product", render: (item) => <span className="font-medium">{item.product_name}</span> },
          { key: "location", header: "Location", render: (item) => <span>{item.location_name} ({item.warehouse_name})</span> },
          { key: "qty", header: "Qty Change", render: (item) => (
            <span className={`tabular-nums font-semibold ${item.quantity_change > 0 ? "text-success" : "text-destructive"}`}>
              {item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}
            </span>
          )},
          { key: "type", header: "Type", render: (item) => (
            <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.move_type_display}</span>
          )},
          { key: "status", header: "Status", render: (item) => <StatusBadge status="done" /> },
          { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
        ]}
        data={filtered}
      />
    </div>
  );
}

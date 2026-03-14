import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

const moveData = [
  { id: "MOV-001", product: "Steel Bolts M8", location: "Main Warehouse", qty: "+500", type: "Receipt", status: "done" as const, date: "2026-03-14" },
  { id: "MOV-002", product: "Office Chair Pro", location: "Storage B", qty: "-25", type: "Delivery", status: "done" as const, date: "2026-03-14" },
  { id: "MOV-003", product: "Copper Wire 2mm", location: "Production", qty: "+200", type: "Transfer", status: "done" as const, date: "2026-03-13" },
  { id: "MOV-004", product: "Packing Tape 50mm", location: "Main Warehouse", qty: "-15", type: "Adjustment", status: "done" as const, date: "2026-03-13" },
  { id: "MOV-005", product: "LED Panel 60x60", location: "Storage A", qty: "+100", type: "Receipt", status: "done" as const, date: "2026-03-12" },
  { id: "MOV-006", product: "Desk Monitor Arm", location: "Production", qty: "-8", type: "Transfer", status: "done" as const, date: "2026-03-11" },
  { id: "MOV-007", product: "Steel Bolts M8", location: "Production", qty: "+150", type: "Transfer", status: "done" as const, date: "2026-03-10" },
];

const types = ["All", "Receipt", "Delivery", "Transfer", "Adjustment"];

export default function MoveHistoryPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? moveData : moveData.filter((m) => m.type === filter);

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
          { key: "id", header: "Movement ID", render: (item) => <span className="font-mono text-xs tabular-nums">{item.id}</span> },
          { key: "product", header: "Product", render: (item) => <span className="font-medium">{item.product}</span> },
          { key: "location", header: "Location" },
          { key: "qty", header: "Qty Change", render: (item) => (
            <span className={`tabular-nums font-semibold ${item.qty.startsWith("+") ? "text-success" : "text-destructive"}`}>{item.qty}</span>
          )},
          { key: "type", header: "Type", render: (item) => (
            <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.type}</span>
          )},
          { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
          { key: "date", header: "Date" },
        ]}
        data={filtered}
      />
    </div>
  );
}

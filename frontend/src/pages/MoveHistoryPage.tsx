import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useSearch } from "@/lib/SearchContext";
import { cn } from "@/lib/utils";

const types = ["All", "Receipt", "Delivery", "Transfer", "Adjustment"];

export default function MoveHistoryPage() {
  const [filter, setFilter] = useState("All");
  const { searchQuery } = useSearch();
  
  const { data: moves = [], isLoading } = useQuery({
    queryKey: ["moves"],
    queryFn: async () => (await api.get("moves/")).data,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filtered = moves.filter((m: any) => {
    const matchesSearch = !searchQuery || 
      m.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.move_type_display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reference_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filter === "All" || m.move_type_display === filter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Stock Movement History</h1>
        <p className="text-sm text-muted-foreground">Track all stock movements</p>
      </div>

      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
              filter === t 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "product", header: "Product", render: (item) => <span className="font-medium">{item.product_name}</span> },
          { key: "location", header: "Location", render: (item) => <span className="text-muted-foreground">{item.location_name}</span> },
          { key: "quantity", header: "Change", render: (item) => (
            <span className={cn("font-mono font-medium", item.quantity_change > 0 ? "text-success" : "text-destructive")}>
              {item.quantity_change > 0 ? '+' : ''}{item.quantity_change}
            </span>
          )},
          { key: "type", header: "Type", render: (item) => (
            <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.move_type_display}</span>
          )},
          { key: "status", header: "Status", render: () => <span className="text-xs text-success font-medium">Completed</span> },
          { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
        ]}
        data={filtered}
      />
    </div>
  );
}

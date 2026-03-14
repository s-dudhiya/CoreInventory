import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSearch } from "@/lib/SearchContext";

// Mock data removed


export default function AdjustmentsPage() {
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: "", location: "", recorded_quantity: "", counted_quantity: "", reason: "" });

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ["adjustments"],
    queryFn: async () => (await api.get("adjustments/")).data,
  });

  const { data: products = [], isLoading: loadingProds } = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get("products/")).data });
  const { data: locations = [], isLoading: loadingLocs } = useQuery({ queryKey: ["locations"], queryFn: async () => (await api.get("locations/")).data });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post("adjustments/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Adjustment applied");
      setOpen(false);
      setForm({ product: "", location: "", recorded_quantity: "", counted_quantity: "", reason: "" });
    },
    onError: () => toast.error("Failed to apply adjustment"),
  });

  const diff = (Number(form.counted_quantity) || 0) - (Number(form.recorded_quantity) || 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      ...form,
      recorded_quantity: Number(form.recorded_quantity),
      counted_quantity: Number(form.counted_quantity),
    });
  };

  const inputClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
  const selectClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none";

  if (isLoading || loadingProds || loadingLocs) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filteredAdjustments = adjustments.filter((a: any) => 
    a.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Inventory Adjustments</h1>
          <p className="text-sm text-muted-foreground">Correct stock mismatches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> New Adjustment
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Inventory Adjustment</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className={labelClass}>Product</label>
                <select className={selectClass} value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required>
                  <option value="">Select Product</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <select className={selectClass} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required>
                  <option value="">Select Location</option>
                  {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Recorded Qty</label>
                  <input type="number" className={inputClass} value={form.recorded_quantity} onChange={e => setForm({ ...form, recorded_quantity: e.target.value })} required />
                </div>
                <div>
                  <label className={labelClass}>Counted Qty</label>
                  <input type="number" className={inputClass} value={form.counted_quantity} onChange={e => setForm({ ...form, counted_quantity: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Adjustment Reason</label>
                <input className={inputClass} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Damaged goods" required />
              </div>

              {form.recorded_quantity && form.counted_quantity && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                  Difference: <span className={`font-bold tabular-nums ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-foreground"}`}>{diff > 0 ? "+" : ""}{diff}</span>
                </div>
              )}
              <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Apply Adjustment
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={[
          { key: "id", header: "ID", render: (item) => <span className="font-mono text-xs tabular-nums">ADJ-{item.id.toString().padStart(3, '0')}</span> },
          { key: "product", header: "Product", render: (item) => <span className="font-medium">{item.product_name}</span> },
          { key: "location", header: "Location", render: (item) => <span>{item.location_name}</span> },
          { key: "recorded", header: "Recorded", render: (item) => <span className="tabular-nums">{item.recorded_quantity}</span> },
          { key: "counted", header: "Counted", render: (item) => <span className="tabular-nums">{item.counted_quantity}</span> },
          { key: "diff", header: "Difference", render: (item) => {
            const d = item.counted_quantity - item.recorded_quantity;
            return (
              <span className={`tabular-nums font-semibold ${d > 0 ? "text-success" : d < 0 ? "text-destructive" : "text-foreground"}`}>
                {d > 0 ? "+" : ""}{d}
              </span>
            );
          }},
          { key: "reason", header: "Reason" },
          { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
        ]}
        data={filteredAdjustments}
      />
    </div>
  );
}

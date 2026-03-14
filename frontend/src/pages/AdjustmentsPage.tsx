import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const initialAdjustments = [
  { id: "ADJ-001", product: "Steel Bolts M8", location: "Main Warehouse / Rack A-01", recorded: 2400, counted: 2385, diff: -15, reason: "Damaged goods", date: "2026-03-14" },
  { id: "ADJ-002", product: "Packing Tape 50mm", location: "Storage A / Shelf 7", recorded: 1200, counted: 1215, diff: +15, reason: "Miscounted receipt", date: "2026-03-13" },
  { id: "ADJ-003", product: "Office Chair Pro", location: "Storage B / Zone 3", recorded: 85, counted: 82, diff: -3, reason: "Lost/misplaced", date: "2026-03-12" },
];

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: "", location: "", recorded: "", counted: "", reason: "" });

  const diff = Number(form.counted) - Number(form.recorded);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustments([
      { id: `ADJ-${String(adjustments.length + 1).padStart(3, "0")}`, product: form.product, location: form.location, recorded: Number(form.recorded), counted: Number(form.counted), diff, reason: form.reason, date: new Date().toISOString().split("T")[0] },
      ...adjustments,
    ]);
    setForm({ product: "", location: "", recorded: "", counted: "", reason: "" });
    setOpen(false);
  };

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
              {[
                { label: "Product", key: "product", placeholder: "e.g. Steel Bolts M8" },
                { label: "Location", key: "location", placeholder: "e.g. Main Warehouse / Rack A-01" },
                { label: "Recorded Quantity", key: "recorded", placeholder: "0", type: "number" },
                { label: "Counted Quantity", key: "counted", placeholder: "0", type: "number" },
                { label: "Adjustment Reason", key: "reason", placeholder: "e.g. Damaged goods" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              ))}
              {form.recorded && form.counted && (
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
          { key: "id", header: "ID", render: (item) => <span className="font-mono text-xs tabular-nums">{item.id}</span> },
          { key: "product", header: "Product", render: (item) => <span className="font-medium">{item.product}</span> },
          { key: "location", header: "Location" },
          { key: "recorded", header: "Recorded", render: (item) => <span className="tabular-nums">{item.recorded}</span> },
          { key: "counted", header: "Counted", render: (item) => <span className="tabular-nums">{item.counted}</span> },
          { key: "diff", header: "Difference", render: (item) => (
            <span className={`tabular-nums font-semibold ${item.diff > 0 ? "text-success" : item.diff < 0 ? "text-destructive" : "text-foreground"}`}>
              {item.diff > 0 ? "+" : ""}{item.diff}
            </span>
          )},
          { key: "reason", header: "Reason" },
          { key: "date", header: "Date" },
        ]}
        data={adjustments}
      />
    </div>
  );
}

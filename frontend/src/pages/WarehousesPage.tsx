import { useState } from "react";
import { Plus, MapPin, User, Trash2, Pencil } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const initialWarehouses = [
  { id: 1, name: "Main Warehouse", address: "123 Industrial Ave, Building A", manager: "Sarah Chen", products: 842, zones: 12 },
  { id: 2, name: "Production Warehouse", address: "456 Factory Rd, Unit 7", manager: "James Rodriguez", products: 315, zones: 6 },
  { id: 3, name: "Storage Warehouse", address: "789 Logistics Blvd, Dock 3", manager: "Emily Walsh", products: 127, zones: 4 },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", manager: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setWarehouses([...warehouses, { id: Date.now(), ...form, products: 0, zones: 0 }]);
    setForm({ name: "", address: "", manager: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Manage warehouse locations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> Add Warehouse
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Warehouse</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              {[
                { label: "Warehouse Name", key: "name", placeholder: "e.g. Main Warehouse" },
                { label: "Address", key: "address", placeholder: "e.g. 123 Industrial Ave" },
                { label: "Manager", key: "manager", placeholder: "e.g. Sarah Chen" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                  <input
                    type="text"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Add Warehouse
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((wh) => (
          <div key={wh.id} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">{wh.name}</h3>
              <div className="flex gap-1">
                <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setWarehouses(warehouses.filter(w => w.id !== wh.id))} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{wh.address}</div>
              <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{wh.manager}</div>
            </div>
            <div className="mt-4 flex gap-4 border-t border-border pt-3">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">{wh.products}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">{wh.zones}</p>
                <p className="text-xs text-muted-foreground">Zones</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const initialProducts = [
  { id: 1, name: "Steel Bolts M8", sku: "STL-M8-001", category: "Raw Materials", uom: "pcs", stock: 2400, location: "Main Warehouse / Rack A-01" },
  { id: 2, name: "Office Chair Pro", sku: "FRN-CHP-042", category: "Furniture", uom: "unit", stock: 85, location: "Storage B / Zone 3" },
  { id: 3, name: "LED Panel 60x60", sku: "ELC-LED-060", category: "Electronics", uom: "unit", stock: 320, location: "Main Warehouse / Rack C-12" },
  { id: 4, name: "Packing Tape 50mm", sku: "PKG-TPE-050", category: "Packaging", uom: "roll", stock: 1200, location: "Storage A / Shelf 7" },
  { id: 5, name: "Copper Wire 2mm", sku: "RAW-CPR-002", category: "Raw Materials", uom: "meter", stock: 8500, location: "Production / Bay 2" },
  { id: 6, name: "Desk Monitor Arm", sku: "FRN-ARM-019", category: "Furniture", uom: "unit", stock: 42, location: "Storage B / Zone 1" },
];

function InlineEditCell({ value, onSave, type = "text" }: { value: string | number; onSave: (v: string) => void; type?: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  useEffect(() => { setVal(String(value)); }, [value]);

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 py-0.5 hover:bg-accent/60 transition-colors"
        onDoubleClick={() => setEditing(true)}
        title="Double-click to edit"
      >
        {type === "number" ? Number(value).toLocaleString() : value}
      </span>
    );
  }

  const save = () => { onSave(val); setEditing(false); };
  const cancel = () => { setVal(String(value)); setEditing(false); };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        ref={inputRef}
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
        className="h-7 w-full min-w-[60px] rounded border border-primary/30 bg-card px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button onClick={save} className="rounded p-0.5 text-primary hover:bg-primary/10"><Check className="h-3.5 w-3.5" /></button>
      <button onClick={cancel} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
    </span>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", uom: "", stock: "", location: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "", uom: "", stock: "", location: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([...products, { id: Date.now(), ...form, stock: Number(form.stock), location: form.location || "Unassigned" }]);
    setForm({ name: "", sku: "", category: "", uom: "", stock: "", location: "" });
    setOpen(false);
  };

  const handleDelete = (id: number) => setProducts(products.filter((p) => p.id !== id));

  const handleEdit = (item: typeof products[0]) => {
    setEditId(item.id);
    setEditForm({ name: item.name, category: item.category, uom: item.uom, stock: String(item.stock), location: item.location });
    setEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts(products.map(p => p.id === editId ? { ...p, name: editForm.name, category: editForm.category, uom: editForm.uom, stock: Number(editForm.stock), location: editForm.location } : p));
    setEditOpen(false);
    setEditId(null);
  };

  const updateField = (id: number, field: string, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: field === "stock" ? Number(value) : value } : p));
  };

  const inputClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  const formFields = [
    { label: "Product Name", key: "name", placeholder: "e.g. Steel Bolts M8" },
    { label: "SKU Code", key: "sku", placeholder: "e.g. STL-M8-001" },
    { label: "Category", key: "category", placeholder: "e.g. Raw Materials" },
    { label: "Unit of Measure", key: "uom", placeholder: "e.g. pcs, unit, kg" },
    { label: "Location", key: "location", placeholder: "e.g. Main Warehouse / Rack A-01" },
    { label: "Initial Stock", key: "stock", placeholder: "0", type: "number" },
  ];

  const editFields = [
    { label: "Product Name", key: "name", placeholder: "e.g. Steel Bolts M8" },
    { label: "Category", key: "category", placeholder: "e.g. Raw Materials" },
    { label: "Unit of Measure", key: "uom", placeholder: "e.g. pcs, unit, kg" },
    { label: "Location", key: "location", placeholder: "e.g. Main Warehouse / Rack A-01" },
    { label: "Stock", key: "stock", placeholder: "0", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your inventory products · <span className="text-xs text-muted-foreground/70">Double-click a cell to edit inline</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              {formFields.map((f) => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className={inputClass}
                    required={f.key !== "stock" && f.key !== "location"}
                  />
                </div>
              ))}
              <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Add Product
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            {editFields.map((f) => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={editForm[f.key as keyof typeof editForm]}
                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className={inputClass}
                  required
                />
              </div>
            ))}
            <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Save Changes
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={[
          { key: "name", header: "Product Name", render: (item) => (
            <InlineEditCell value={item.name} onSave={(v) => updateField(item.id, "name", v)} />
          )},
          { key: "sku", header: "SKU", render: (item) => <span className="tabular-nums text-muted-foreground font-mono text-xs">{item.sku}</span> },
          { key: "category", header: "Category", render: (item) => (
            <InlineEditCell value={item.category} onSave={(v) => updateField(item.id, "category", v)} />
          )},
          { key: "uom", header: "UoM", render: (item) => (
            <InlineEditCell value={item.uom} onSave={(v) => updateField(item.id, "uom", v)} />
          )},
          { key: "stock", header: "Stock", render: (item) => (
            <span className={item.stock < 50 ? "text-destructive" : ""}>
              <InlineEditCell value={item.stock} onSave={(v) => updateField(item.id, "stock", v)} type="number" />
            </span>
          )},
          { key: "location", header: "Location", render: (item) => (
            <InlineEditCell value={item.location} onSave={(v) => updateField(item.id, "location", v)} />
          )},
          { key: "actions", header: "", render: (item) => (
            <div className="flex gap-1">
              <button onClick={() => handleEdit(item)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )},
        ]}
        data={products}
      />
    </div>
  );
}

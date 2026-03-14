import { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSearch } from "@/lib/SearchContext";
import { getTotalStock, isLowStock } from "@/lib/stock";

// Initial data removed, using API instead

function InlineEditCell({
  value,
  onSave,
  type = "text",
}: {
  value: string | number;
  onSave: (v: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  useEffect(() => {
    setVal(String(value));
  }, [value]);

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

  const save = () => {
    onSave(val);
    setEditing(false);
  };
  const cancel = () => {
    setVal(String(value));
    setEditing(false);
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        ref={inputRef}
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        className="h-7 w-full min-w-[60px] rounded border border-primary/30 bg-card px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        onClick={save}
        className="rounded p-0.5 text-primary hover:bg-primary/10"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={cancel}
        className="rounded p-0.5 text-muted-foreground hover:bg-accent"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    initial_stock: "0",
    location: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    initial_stock: "0",
    location: "",
  });

  // Data Fetching
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const resp = await api.get("products/");
      return resp.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const resp = await api.get("categories/");
      return resp.data;
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const resp = await api.get("units/");
      return resp.data;
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await api.get("locations/")).data,
  });

  const { data: skuSuggestion } = useQuery({
    queryKey: ["sku-suggestion"],
    queryFn: async () => (await api.get("products/suggest_sku/")).data,
    enabled: open, // Only fetch when "Add" modal is open
    staleTime: 0,
  });

  useEffect(() => {
    if (open && skuSuggestion) {
      setForm((prev) => ({ ...prev, sku: skuSuggestion.sku }));
    }
  }, [open, skuSuggestion]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: (newProd: any) => api.post("products/", newProd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product added successfully");
      setOpen(false);
      setForm({
        name: "",
        sku: "",
        category: "",
        unit: "",
        initial_stock: "0",
        location: "",
      });
    },
    onError: () => toast.error("Failed to add product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.patch(`products/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product updated");
      setEditOpen(false);
    },
    onError: () => toast.error("Failed to update product"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      ...form,
      category: form.category ? parseInt(form.category) : null,
      unit: form.unit ? parseInt(form.unit) : null,
      initial_stock: parseInt(form.initial_stock),
      location: form.location ? parseInt(form.location) : null,
    });
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditForm({
      name: item.name,
      sku: item.sku,
      category: item.category ? String(item.category) : "",
      unit: item.unit ? String(item.unit) : "",
      initial_stock: String(item.initial_stock || 0),
      location: item.stocks?.[0]?.location
        ? String(item.stocks[0].location)
        : "",
    });
    setEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({
        id: editId,
        data: {
          ...editForm,
          category: editForm.category ? parseInt(editForm.category) : null,
          unit: editForm.unit ? parseInt(editForm.unit) : null,
          initial_stock: parseInt(editForm.initial_stock),
          location: editForm.location ? parseInt(editForm.location) : null,
        },
      });
    }
  };

  const updateInlineField = (id: number, field: string, value: string) => {
    updateMutation.mutate({ id, data: { [field]: value } });
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("settings/").then((res) => res.data),
  });

  const threshold = Number(settings?.low_stock_threshold || 15);

  // Search filtering
  const filteredProducts = products.filter(
    (p: any) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name &&
        p.category_name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // View logic
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory products ·{" "}
            <span className="text-xs text-muted-foreground/70">
              Double-click a cell to edit inline
            </span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>SKU Code</label>
                <input
                  value={form.sku}
                  className={`${inputClass} bg-muted cursor-not-allowed`}
                  readOnly
                  placeholder="Generating..."
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Unit</option>
                  {units.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Initial Stock</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={form.initial_stock}
                    onChange={(e) =>
                      setForm({ ...form, initial_stock: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Quantity"
                  />
                  <select
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Default Location</option>
                    {(() => {
                      const groups: Record<string, any[]> = {};
                      locations.forEach((l: any) => {
                        if (!groups[l.warehouse_name])
                          groups[l.warehouse_name] = [];
                        groups[l.warehouse_name].push(l);
                      });
                      return Object.entries(groups).map(([wName, locs]) => (
                        <optgroup key={wName} label={wName}>
                          {locs.map((l: any) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                    })()}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
              >
                {addMutation.isPending ? "Adding..." : "Add Product"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>SKU Code</label>
              <input
                value={editForm.sku}
                className={`${inputClass} bg-muted cursor-not-allowed`}
                readOnly
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select
                value={editForm.unit}
                onChange={(e) =>
                  setEditForm({ ...editForm, unit: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select Unit</option>
                {units.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Initial Stock</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={editForm.initial_stock}
                  onChange={(e) =>
                    setEditForm({ ...editForm, initial_stock: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Quantity"
                />
                <select
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Default Location</option>
                  {(() => {
                    const groups: Record<string, any[]> = {};
                    locations.forEach((l: any) => {
                      if (!groups[l.warehouse_name])
                        groups[l.warehouse_name] = [];
                      groups[l.warehouse_name].push(l);
                    });
                    return Object.entries(groups).map(([wName, locs]) => (
                      <optgroup key={wName} label={wName}>
                        {locs.map((l: any) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Product Name",
            render: (item) => (
              <InlineEditCell
                value={item.name}
                onSave={(v) => updateInlineField(item.id, "name", v)}
              />
            ),
          },
          {
            key: "sku",
            header: "SKU",
            render: (item) => (
              <span className="tabular-nums text-muted-foreground font-mono text-xs">
                {item.sku}
              </span>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (item) => (
              <span className="text-sm">{item.category_name || "N/A"}</span>
            ),
          },
          {
            key: "uom",
            header: "UoM",
            render: (item) => (
              <span className="text-sm">{item.unit_name || "N/A"}</span>
            ),
          },
          // {
          //   key: "initial_stock",
          //   header: "Total Stock",
          //   render: (item) => {
          //     const total = getTotalStock(item);
          //     const low = isLowStock(item, threshold);
          //     return (
          //       <span
          //         className={
          //           low
          //             ? "inline-flex items-center rounded-md bg-destructive/20 px-2 py-1 font-semibold tabular-nums text-destructive ring-1 ring-inset ring-destructive/30"
          //             : "tabular-nums"
          //         }
          //       >
          //         {total.toLocaleString()}
          //       </span>
          //     );
          //   },
          // },
          {
            key: "initial_stock",
            header: "Initial Stock",
            render: (item) => {
              const low = isLowStock(item, threshold);
              return (
                <span
                  className={
                    low
                      ? "inline-flex items-center rounded-md bg-destructive/20 px-2 py-1 font-semibold tabular-nums text-destructive ring-1 ring-inset ring-destructive/30"
                      : "tabular-nums"
                  }
                >
                  <InlineEditCell
                    value={item.initial_stock}
                    onSave={(v) =>
                      updateInlineField(item.id, "initial_stock", v)
                    }
                    type="number"
                  />
                </span>
              );
            },
          },
          {
            key: "location",
            header: "Locations",
            render: (item) => (
              <div
                className="text-xs text-muted-foreground max-w-[200px] truncate"
                title={item.stocks
                  ?.map((s: any) => `${s.location_name}: ${s.quantity}`)
                  .join(", ")}
              >
                {item.stocks?.length > 0
                  ? item.stocks.map((s: any) => s.location_name).join(", ")
                  : "No stock recorded"}
              </div>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (item) => (
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          },
        ]}
        rowClassName={(item) =>
          isLowStock(item, threshold)
            ? "bg-destructive/15 even:bg-destructive/15 hover:bg-destructive/20 text-destructive border-l-4 border-l-destructive ring-1 ring-inset ring-destructive/20"
            : ""
        }
        data={filteredProducts}
      />
    </div>
  );
}

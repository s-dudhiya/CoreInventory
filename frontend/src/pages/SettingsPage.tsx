import { useState, useEffect } from "react";
import { Save, Loader2, List, Scale } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/DataTable";
import { getTotalStock, isLowStock } from "@/lib/stock";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    low_stock_threshold: 50,
    auto_assign_location: true,
    enable_multi_warehouse_transfers: true,
    require_approval_for_adjustments: false,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("settings/").then((res) => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("categories/").then((res) => res.data),
  });

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: () => api.get("units/").then((res) => res.data),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await api.get("products/")).data,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        low_stock_threshold: settings.low_stock_threshold,
        auto_assign_location: settings.auto_assign_location,
        enable_multi_warehouse_transfers: settings.enable_multi_warehouse_transfers,
        require_approval_for_adjustments: settings.require_approval_for_adjustments,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put("settings/1/", data),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your inventory system</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Low Stock Alert Threshold</h3>
          <p className="mt-1 text-xs text-muted-foreground">Products below this quantity will be flagged</p>
          <input
            type="number"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })}
            className="mt-4 h-9 w-32 rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Product Categories</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {categories?.length || 0} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Manage your product classifications</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories?.slice(0, 5).map((cat: any) => (
              <span key={cat.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                <List className="h-3 w-3" /> {cat.name}
              </span>
            ))}
            {categories?.length > 5 && <span className="text-xs text-muted-foreground pt-1">+{categories.length - 5} more</span>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Units of Measure</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {units?.length || 0} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Define measurement standards</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {units?.slice(0, 5).map((u: any) => (
              <span key={u.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                <Scale className="h-3 w-3" /> {u.symbol}
              </span>
            ))}
            {units?.length > 5 && <span className="text-xs text-muted-foreground pt-1">+{units.length - 5} more</span>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Warehouse Configuration</h3>
          <p className="mt-1 text-xs text-muted-foreground">Default warehouse settings</p>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.auto_assign_location} 
                onChange={(e) => setForm({ ...form, auto_assign_location: e.target.checked })}
                className="rounded border-border" 
              />
              Auto-assign location on receipt
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.enable_multi_warehouse_transfers} 
                onChange={(e) => setForm({ ...form, enable_multi_warehouse_transfers: e.target.checked })}
                className="rounded border-border" 
              />
              Enable multi-warehouse transfers
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.require_approval_for_adjustments} 
                onChange={(e) => setForm({ ...form, require_approval_for_adjustments: e.target.checked })}
                className="rounded border-border" 
              />
              Require approval for adjustments
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Low Stock Preview</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Highlights products where total stock is below the current threshold ({Number(form.low_stock_threshold || 0).toLocaleString()})
              </p>
            </div>
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive ring-1 ring-inset ring-destructive/20">
              {(products || []).filter((p) => isLowStock(p, Number(form.low_stock_threshold || 0))).length} Below
            </span>
          </div>

          <div className="mt-4">
            <DataTable
              columns={[
                { key: "name", header: "Product", render: (item) => <span className="font-medium">{item.name}</span> },
                { key: "sku", header: "SKU", render: (item) => <span className="tabular-nums text-muted-foreground font-mono text-xs">{item.sku}</span> },
                { key: "total_stock", header: "Total Stock", render: (item) => {
                  const total = getTotalStock(item);
                  return <span className="tabular-nums">{total.toLocaleString()}</span>;
                }},
                { key: "gap", header: "Below By", render: (item) => {
                  const threshold = Number(form.low_stock_threshold || 0);
                  const diff = Math.max(0, threshold - getTotalStock(item));
                  return <span className="tabular-nums text-destructive font-semibold">{diff.toLocaleString()}</span>;
                }},
              ]}
              data={(products || [])
                .filter((p) => isLowStock(p, Number(form.low_stock_threshold || 0)))
                .sort((a, b) => getTotalStock(a) - getTotalStock(b))
                .slice(0, 10)}
              rowClassName={(item) => isLowStock(item, Number(form.low_stock_threshold || 0)) ? "bg-destructive/15 even:bg-destructive/15 hover:bg-destructive/20 text-destructive border-l-4 border-l-destructive ring-1 ring-inset ring-destructive/20" : ""}
            />
            {productsLoading && (
              <div className="mt-3 text-xs text-muted-foreground">Loading products…</div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Settings
      </button>
    </div>
  );
}

import { useState } from "react";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("50");
  const [categories, setCategories] = useState("Electronics, Furniture, Raw Materials, Packaging, Tools");
  const [units, setUnits] = useState("pcs, unit, kg, meter, roll, box");

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
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-4 h-9 w-32 rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Product Categories</h3>
          <p className="mt-1 text-xs text-muted-foreground">Comma-separated list of categories</p>
          <textarea
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="mt-4 h-20 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Units of Measure</h3>
          <p className="mt-1 text-xs text-muted-foreground">Comma-separated list of units</p>
          <textarea
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="mt-4 h-20 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Warehouse Configuration</h3>
          <p className="mt-1 text-xs text-muted-foreground">Default warehouse settings</p>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              Auto-assign location on receipt
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              Enable multi-warehouse transfers
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" className="rounded border-border" />
              Require approval for adjustments
            </label>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
        <Save className="h-4 w-4" /> Save Settings
      </button>
    </div>
  );
}

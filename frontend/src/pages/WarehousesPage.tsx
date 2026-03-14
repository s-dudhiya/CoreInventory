import { useState } from "react";
import { Plus, Trash2, Loader2, MapPin, User as UserIcon } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSearch } from "@/lib/SearchContext";

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", manager: "" });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("users/")).data,
  });

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await api.get("warehouses/")).data,
  });

  const addMutation = useMutation({
    mutationFn: (newWh: any) => api.post("warehouses/", newWh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Warehouse added successfully");
      setOpen(false);
      setForm({ name: "", address: "", manager: "" });
    },
    onError: () => toast.error("Failed to add warehouse"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`warehouses/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Warehouse deleted");
    },
    onError: () => toast.error("Failed to delete warehouse"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      ...form,
      manager: form.manager ? parseInt(form.manager) : null
    });
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filteredWarehouses = warehouses.filter((w: any) => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.manager_name && w.manager_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inputClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

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
              <div>
                <label className={labelClass}>Warehouse Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="e.g. Main Warehouse" required />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputClass} placeholder="e.g. 123 Industrial Ave" required />
              </div>
              <div>
                <label className={labelClass}>Manager</label>
                <select 
                  value={form.manager} 
                  onChange={e => setForm({...form, manager: e.target.value})} 
                  className={inputClass}
                >
                  <option value="">Select Manager</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name || u.username} {u.last_name || ""}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={addMutation.isPending} className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                {addMutation.isPending ? "Adding..." : "Add Warehouse"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={[
          { key: "name", header: "Warehouse Name" },
          { key: "address", header: "Address", render: (item) => (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{item.address}</span>
            </div>
          )},
          { key: "manager", header: "Manager", render: (item) => (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-3 w-3" />
              </div>
              <span>{item.manager_name || "Unassigned"}</span>
            </div>
          )},
          { key: "stats", header: "Summary", render: (item) => (
            <div className="flex gap-4 text-xs font-medium">
              <span className="text-foreground">{item.product_count} Products</span>
              <span className="text-muted-foreground">{item.location_count} Zones</span>
            </div>
          )},
          { key: "actions", header: "", render: (item) => (
            <button onClick={() => deleteMutation.mutate(item.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          )},
        ]}
        data={filteredWarehouses}
      />
    </div>
  );
}

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Initial data removed, using API instead
type Status = "draft" | "waiting" | "ready" | "done" | "cancelled";


export default function OperationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("receipts");
  const [open, setOpen] = useState(false);

  // Forms
  const [receiptForm, setReceiptForm] = useState({ supplier: "", warehouse: "", status: "draft" as Status });
  const [deliveryForm, setDeliveryForm] = useState({ customer_name: "", warehouse: "", status: "draft" as Status });
  const [transferForm, setTransferForm] = useState({ from_location: "", to_location: "", status: "draft" as Status });

  // Data Fetching
  const { data: receipts = [], isLoading: loadingRec } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => (await api.get("/receipts/")).data,
  });

  const { data: deliveries = [], isLoading: loadingDel } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => (await api.get("/deliveries/")).data,
  });

  const { data: transfers = [], isLoading: loadingTrf } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => (await api.get("/transfers/")).data,
  });

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: async () => (await api.get("/suppliers/")).data });
  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: async () => (await api.get("/warehouses/")).data });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: async () => (await api.get("/locations/")).data });

  // Mutations
  const createReceipt = useMutation({
    mutationFn: (data: any) => api.post("/receipts/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt created");
      setOpen(false);
    }
  });

  const createDelivery = useMutation({
    mutationFn: (data: any) => api.post("/deliveries/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery created");
      setOpen(false);
    }
  });

  const createTransfer = useMutation({
    mutationFn: (data: any) => api.post("/transfers/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer created");
      setOpen(false);
    }
  });

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    createReceipt.mutate(receiptForm);
  };

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    createDelivery.mutate(deliveryForm);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    createTransfer.mutate(transferForm);
  };

  if (loadingRec || loadingDel || loadingTrf) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const inputClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
  const selectClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none";

  const statusOptions: Status[] = ["draft", "waiting", "ready", "done"];

  const renderModalContent = () => {
    if (tab === "receipts") {
      return (
        <form onSubmit={handleAddReceipt} className="space-y-4">
          <div>
            <label className={labelClass}>Supplier</label>
            <select className={selectClass} value={receiptForm.supplier} onChange={e => setReceiptForm({ ...receiptForm, supplier: e.target.value })} required>
              <option value="">Select Supplier</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Warehouse</label>
            <select className={selectClass} value={receiptForm.warehouse} onChange={e => setReceiptForm({ ...receiptForm, warehouse: e.target.value })} required>
              <option value="">Select Warehouse</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={createReceipt.isPending} className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            {createReceipt.isPending ? "Creating..." : "Create Receipt"}
          </button>
        </form>
      );
    }
    if (tab === "deliveries") {
      return (
        <form onSubmit={handleAddDelivery} className="space-y-4">
          <div><label className={labelClass}>Customer Name</label><input className={inputClass} value={deliveryForm.customer_name} onChange={e => setDeliveryForm({ ...deliveryForm, customer_name: e.target.value })} placeholder="e.g. TechCorp" required /></div>
          <div>
            <label className={labelClass}>Warehouse</label>
            <select className={selectClass} value={deliveryForm.warehouse} onChange={e => setDeliveryForm({ ...deliveryForm, warehouse: e.target.value })} required>
              <option value="">Select Warehouse</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={createDelivery.isPending} className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            {createDelivery.isPending ? "Creating..." : "Create Delivery"}
          </button>
        </form>
      );
    }
    return (
      <form onSubmit={handleAddTransfer} className="space-y-4">
        <div>
          <label className={labelClass}>From Location</label>
          <select className={selectClass} value={transferForm.from_location} onChange={e => setTransferForm({ ...transferForm, from_location: e.target.value })} required>
            <option value="">Select Location</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>To Location</label>
          <select className={selectClass} value={transferForm.to_location} onChange={e => setTransferForm({ ...transferForm, to_location: e.target.value })} required>
            <option value="">Select Location</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
          </select>
        </div>
        <button type="submit" disabled={createTransfer.isPending} className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {createTransfer.isPending ? "Creating..." : "Create Transfer"}
        </button>
      </form>
    );
  };

  const modalTitle = tab === "receipts" ? "Create Receipt" : tab === "deliveries" ? "Create Delivery" : "Create Transfer";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Operations</h1>
          <p className="text-sm text-muted-foreground">Manage receipts, deliveries, and internal transfers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> {modalTitle}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{modalTitle}</DialogTitle></DialogHeader>
            {renderModalContent()}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="transfers">Internal Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="mt-4">
          <DataTable
            columns={[
              { key: "id", header: "Receipt ID", render: (item) => <span className="font-mono text-xs tabular-nums">REC-{item.id.toString().padStart(3, '0')}</span> },
              { key: "supplier", header: "Supplier", render: (item) => <span>{item.supplier_name}</span> },
              { key: "warehouse", header: "Warehouse", render: (item) => <span>{item.warehouse_name}</span> },
              { key: "items", header: "Items", render: (item) => <span className="text-xs text-muted-foreground">{item.items?.length || 0} items</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
            ]}
            data={receipts}
          />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-4">
          <DataTable
            columns={[
              { key: "id", header: "Order ID", render: (item) => <span className="font-mono text-xs tabular-nums">DEL-{item.id.toString().padStart(3, '0')}</span> },
              { key: "customer", header: "Customer", render: (item) => <span>{item.customer_name}</span> },
              { key: "warehouse", header: "Warehouse", render: (item) => <span>{item.warehouse_name}</span> },
              { key: "items", header: "Items", render: (item) => <span className="text-xs text-muted-foreground">{item.items?.length || 0} items</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
            ]}
            data={deliveries}
          />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <DataTable
            columns={[
              { key: "id", header: "Transfer ID", render: (item) => <span className="font-mono text-xs tabular-nums">TRF-{item.id.toString().padStart(3, '0')}</span> },
              { key: "from", header: "From", render: (item) => <span>{item.from_location_name}</span> },
              { key: "to", header: "To", render: (item) => <span>{item.to_location_name}</span> },
              { key: "items", header: "Items", render: (item) => <span className="text-xs text-muted-foreground">{item.items?.length || 0} items</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date", render: (item) => <span>{item.created_at?.split('T')[0]}</span> },
            ]}
            data={transfers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type Status = "draft" | "waiting" | "ready" | "done" | "cancelled";

const initialReceipts: { id: string; supplier: string; products: string; qty: number; status: Status; date: string }[] = [
  { id: "REC-001", supplier: "Acme Metals Ltd.", products: "Steel Bolts M8", qty: 500, status: "done", date: "2026-03-14" },
  { id: "REC-002", supplier: "BrightLED Co.", products: "LED Panel 60x60", qty: 100, status: "ready", date: "2026-03-13" },
  { id: "REC-003", supplier: "PackPro Inc.", products: "Packing Tape 50mm", qty: 300, status: "waiting", date: "2026-03-12" },
  { id: "REC-004", supplier: "WireWorld", products: "Copper Wire 2mm", qty: 2000, status: "draft", date: "2026-03-11" },
];

const initialDeliveries: { id: string; customer: string; products: string; qty: number; status: Status; date: string }[] = [
  { id: "DEL-001", customer: "TechCorp Solutions", products: "LED Panel 60x60", qty: 50, status: "done", date: "2026-03-14" },
  { id: "DEL-002", customer: "OfficeMax Ltd.", products: "Office Chair Pro", qty: 10, status: "ready", date: "2026-03-13" },
  { id: "DEL-003", customer: "BuildRight Inc.", products: "Steel Bolts M8", qty: 200, status: "waiting", date: "2026-03-12" },
];

const initialTransfers: { id: string; from: string; to: string; product: string; qty: number; status: Status; date: string }[] = [
  { id: "TRF-001", from: "Main Warehouse", to: "Production", product: "Copper Wire 2mm", qty: 500, status: "done", date: "2026-03-14" },
  { id: "TRF-002", from: "Storage A", to: "Main Warehouse", product: "Packing Tape 50mm", qty: 100, status: "ready", date: "2026-03-13" },
  { id: "TRF-003", from: "Storage B", to: "Production", product: "Desk Monitor Arm", qty: 15, status: "draft", date: "2026-03-12" },
];


export default function OperationsPage() {
  const [tab, setTab] = useState("receipts");
  const [open, setOpen] = useState(false);

  const [receipts, setReceipts] = useState(initialReceipts);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [transfers, setTransfers] = useState(initialTransfers);

  // Receipt form
  const [receiptForm, setReceiptForm] = useState({ supplier: "", products: "", qty: "", status: "draft" as Status });
  // Delivery form
  const [deliveryForm, setDeliveryForm] = useState({ customer: "", products: "", qty: "", status: "draft" as Status });
  // Transfer form
  const [transferForm, setTransferForm] = useState({ from: "", to: "", product: "", qty: "", status: "draft" as Status });

  const today = new Date().toISOString().slice(0, 10);

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `REC-${String(receipts.length + 1).padStart(3, "0")}`;
    setReceipts([...receipts, { id, supplier: receiptForm.supplier, products: receiptForm.products, qty: Number(receiptForm.qty), status: receiptForm.status, date: today }]);
    setReceiptForm({ supplier: "", products: "", qty: "", status: "draft" });
    setOpen(false);
  };

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `DEL-${String(deliveries.length + 1).padStart(3, "0")}`;
    setDeliveries([...deliveries, { id, customer: deliveryForm.customer, products: deliveryForm.products, qty: Number(deliveryForm.qty), status: deliveryForm.status, date: today }]);
    setDeliveryForm({ customer: "", products: "", qty: "", status: "draft" });
    setOpen(false);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TRF-${String(transfers.length + 1).padStart(3, "0")}`;
    setTransfers([...transfers, { id, from: transferForm.from, to: transferForm.to, product: transferForm.product, qty: Number(transferForm.qty), status: transferForm.status, date: today }]);
    setTransferForm({ from: "", to: "", product: "", qty: "", status: "draft" });
    setOpen(false);
  };

  const inputClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
  const selectClass = "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none";

  const statusOptions: Status[] = ["draft", "waiting", "ready", "done"];

  const renderModalContent = () => {
    if (tab === "receipts") {
      return (
        <form onSubmit={handleAddReceipt} className="space-y-4">
          <div><label className={labelClass}>Supplier</label><input className={inputClass} value={receiptForm.supplier} onChange={e => setReceiptForm({ ...receiptForm, supplier: e.target.value })} placeholder="e.g. Acme Metals Ltd." required /></div>
          <div><label className={labelClass}>Products</label><input className={inputClass} value={receiptForm.products} onChange={e => setReceiptForm({ ...receiptForm, products: e.target.value })} placeholder="e.g. Steel Bolts M8" required /></div>
          <div><label className={labelClass}>Quantity</label><input type="number" className={inputClass} value={receiptForm.qty} onChange={e => setReceiptForm({ ...receiptForm, qty: e.target.value })} placeholder="0" required /></div>
          <div><label className={labelClass}>Status</label><select className={selectClass} value={receiptForm.status} onChange={e => setReceiptForm({ ...receiptForm, status: e.target.value as Status })}>{statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
          <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">Create Receipt</button>
        </form>
      );
    }
    if (tab === "deliveries") {
      return (
        <form onSubmit={handleAddDelivery} className="space-y-4">
          <div><label className={labelClass}>Customer</label><input className={inputClass} value={deliveryForm.customer} onChange={e => setDeliveryForm({ ...deliveryForm, customer: e.target.value })} placeholder="e.g. TechCorp Solutions" required /></div>
          <div><label className={labelClass}>Products</label><input className={inputClass} value={deliveryForm.products} onChange={e => setDeliveryForm({ ...deliveryForm, products: e.target.value })} placeholder="e.g. LED Panel 60x60" required /></div>
          <div><label className={labelClass}>Quantity</label><input type="number" className={inputClass} value={deliveryForm.qty} onChange={e => setDeliveryForm({ ...deliveryForm, qty: e.target.value })} placeholder="0" required /></div>
          <div><label className={labelClass}>Status</label><select className={selectClass} value={deliveryForm.status} onChange={e => setDeliveryForm({ ...deliveryForm, status: e.target.value as Status })}>{statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
          <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">Create Delivery</button>
        </form>
      );
    }
    return (
      <form onSubmit={handleAddTransfer} className="space-y-4">
        <div><label className={labelClass}>From Location</label><input className={inputClass} value={transferForm.from} onChange={e => setTransferForm({ ...transferForm, from: e.target.value })} placeholder="e.g. Main Warehouse" required /></div>
        <div><label className={labelClass}>To Location</label><input className={inputClass} value={transferForm.to} onChange={e => setTransferForm({ ...transferForm, to: e.target.value })} placeholder="e.g. Production" required /></div>
        <div><label className={labelClass}>Product</label><input className={inputClass} value={transferForm.product} onChange={e => setTransferForm({ ...transferForm, product: e.target.value })} placeholder="e.g. Copper Wire 2mm" required /></div>
        <div><label className={labelClass}>Quantity</label><input type="number" className={inputClass} value={transferForm.qty} onChange={e => setTransferForm({ ...transferForm, qty: e.target.value })} placeholder="0" required /></div>
        <div><label className={labelClass}>Status</label><select className={selectClass} value={transferForm.status} onChange={e => setTransferForm({ ...transferForm, status: e.target.value as Status })}>{statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
        <button type="submit" className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">Create Transfer</button>
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
              { key: "id", header: "Receipt ID", render: (item) => <span className="font-mono text-xs tabular-nums">{item.id}</span> },
              { key: "supplier", header: "Supplier" },
              { key: "products", header: "Products" },
              { key: "qty", header: "Quantity", render: (item) => <span className="tabular-nums font-medium">{item.qty}</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date" },
            ]}
            data={receipts}
          />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-4">
          <DataTable
            columns={[
              { key: "id", header: "Order ID", render: (item) => <span className="font-mono text-xs tabular-nums">{item.id}</span> },
              { key: "customer", header: "Customer" },
              { key: "products", header: "Products" },
              { key: "qty", header: "Quantity", render: (item) => <span className="tabular-nums font-medium">{item.qty}</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date" },
            ]}
            data={deliveries}
          />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <DataTable
            columns={[
              { key: "id", header: "Transfer ID", render: (item) => <span className="font-mono text-xs tabular-nums">{item.id}</span> },
              { key: "from", header: "From" },
              { key: "to", header: "To" },
              { key: "product", header: "Product" },
              { key: "qty", header: "Quantity", render: (item) => <span className="tabular-nums font-medium">{item.qty}</span> },
              { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
              { key: "date", header: "Date" },
            ]}
            data={transfers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

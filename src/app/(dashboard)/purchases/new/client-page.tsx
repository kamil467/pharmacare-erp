"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createPurchase } from "@/app/actions/purchases";
import { addSupplier } from "@/app/actions/suppliers";
import { useRouter } from "next/navigation";

export function NewPurchaseClient({ suppliers, products }: { suppliers: any[], products: any[] }) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: "",
        batchNumber: "",
        location: "",
        expiryDate: "",
        quantity: 1,
        freeQuantity: 0,
        purchaseRate: 0,
        mrp: 0,
        saleRate: 0,
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Calculations
  const calculateItemTotal = (item: any) => {
    return (item.quantity * Number(item.purchaseRate)) || 0;
  };

  let subtotalBase = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalAmount = 0;

  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const gstRate = product ? product.gstRate : 0;
    
    const itemTotal = (item.quantity * Number(item.purchaseRate)) || 0;
    const baseRate = gstRate > 0 ? Math.round(Number(item.purchaseRate) / (1 + (gstRate / 100))) : Number(item.purchaseRate);
    const itemBaseTotal = baseRate * item.quantity;
    const taxAmt = itemTotal - itemBaseTotal;
    const cgstAmt = Math.round(taxAmt / 2);
    const sgstAmt = taxAmt - cgstAmt;

    subtotalBase += itemBaseTotal;
    totalCgst += cgstAmt;
    totalSgst += sgstAmt;
    totalAmount += itemTotal;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isNewSupplier && !supplierId) || (isNewSupplier && !newSupplierName) || !invoiceNumber || items.length === 0) {
      alert("Please fill all required fields and add at least one item.");
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.batchNumber || !item.expiryDate || !item.location) {
        alert("All items must have a product, batch number, rack location, and expiry date.");
        return;
      }
    }

    setIsSubmitting(true);
    
    let finalSupplierId = supplierId;
    
    if (isNewSupplier) {
      const supRes = await addSupplier({ name: newSupplierName.trim() } as any);
      if (supRes.success && supRes.data) {
        finalSupplierId = supRes.data.id;
      } else {
        alert("Failed to create new supplier.");
        setIsSubmitting(false);
        return;
      }
    }
    
    const purchaseData = {
      supplierId: finalSupplierId,
      invoiceNumber,
      purchaseDate: new Date(purchaseDate),
      paymentStatus: paymentStatus as "paid" | "pending" | "partial",
      subtotal: Math.round(subtotalBase * 100), // convert to paise
      discount: 0,
      cgst: Math.round(totalCgst * 100),
      sgst: Math.round(totalSgst * 100),
      igst: 0,
      totalAmount: Math.round(totalAmount * 100),
      notes,
    };

    const formattedItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const gstRate = product ? product.gstRate : 0;
      
      const itemTotal = (item.quantity * Number(item.purchaseRate)) || 0;
      const baseRate = gstRate > 0 ? Math.round(Number(item.purchaseRate) / (1 + (gstRate / 100))) : Number(item.purchaseRate);
      const itemBaseTotal = baseRate * item.quantity;
      const taxAmt = itemTotal - itemBaseTotal;
      const cgstAmt = Math.round(taxAmt / 2);
      const sgstAmt = taxAmt - cgstAmt;

      return {
        productId: item.productId,
        batchNumber: item.batchNumber,
        location: item.location,
        expiryDate: new Date(item.expiryDate),
        quantity: Number(item.quantity),
        freeQuantity: Number(item.freeQuantity || 0),
        purchaseRate: Math.round(Number(item.purchaseRate) * 100),
        mrp: Math.round(Number(item.mrp) * 100),
        saleRate: Math.round(Number(item.saleRate) * 100),
        cgstAmount: Math.round(cgstAmt * 100),
        sgstAmount: Math.round(sgstAmt * 100),
        totalAmount: Math.round(itemTotal * 100),
      };
    });

    const res = await createPurchase(purchaseData, formattedItems);
    
    setIsSubmitting(false);
    if (res.success) {
      alert("Purchase saved and inventory updated successfully!");
      router.push("/purchases");
    } else {
      alert("Failed to save purchase.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <Link href="/purchases" className="inline-flex items-center text-sm text-brand-600 hover:text-brand-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Purchases
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Supplier *</label>
              <button 
                type="button" 
                onClick={() => setIsNewSupplier(!isNewSupplier)} 
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center"
              >
                {isNewSupplier ? "Select Existing" : <><Plus className="w-3 h-3 mr-1" /> New Supplier</>}
              </button>
            </div>
            {isNewSupplier ? (
              <Input 
                required 
                placeholder="Enter supplier name" 
                value={newSupplierName} 
                onChange={(e) => setNewSupplierName(e.target.value)} 
                autoFocus
              />
            ) : (
              <select 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice No. *</label>
            <Input required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Date *</label>
            <Input type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={handleAddItem} className="gap-1">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 font-medium text-gray-500 w-48">Product</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 w-24">Batch No</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 w-24">Rack</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 w-32">Expiry</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 w-20">Qty</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 w-20">Free</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 w-24">Pur. Rate</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 w-24">MRP</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 w-24">Sale Rate</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 w-24">Total</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2 px-2">
                        <select 
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          value={item.productId}
                          onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
                        >
                          <option value="">Select...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <Input required className="h-9 px-2 text-sm" value={item.batchNumber} onChange={(e) => handleItemChange(item.id, "batchNumber", e.target.value)} placeholder="B123" />
                      </td>
                      <td className="py-2 px-2">
                        <Input required className="h-9 px-2 text-sm" value={item.location} onChange={(e) => handleItemChange(item.id, "location", e.target.value)} placeholder="Rack A1" />
                      </td>
                      <td className="py-2 px-2">
                        <Input required type="date" className="h-9 px-2" value={item.expiryDate} onChange={(e) => handleItemChange(item.id, "expiryDate", e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <Input required type="number" min="1" className="h-9 px-2 text-center" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))} />
                      </td>
                      <td className="py-2 px-2">
                        <Input type="number" min="0" className="h-9 px-2 text-center" value={item.freeQuantity} onChange={(e) => handleItemChange(item.id, "freeQuantity", Number(e.target.value))} />
                      </td>
                      <td className="py-2 px-2">
                        <Input required type="number" step="0.01" min="0" className="h-9 px-2 text-right" value={item.purchaseRate} onChange={(e) => handleItemChange(item.id, "purchaseRate", Number(e.target.value))} />
                      </td>
                      <td className="py-2 px-2">
                        <Input required type="number" step="0.01" min="0" className="h-9 px-2 text-right" value={item.mrp} onChange={(e) => handleItemChange(item.id, "mrp", Number(e.target.value))} />
                      </td>
                      <td className="py-2 px-2">
                        <Input required type="number" step="0.01" min="0" className="h-9 px-2 text-right" value={item.saleRate} onChange={(e) => handleItemChange(item.id, "saleRate", Number(e.target.value))} />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-gray-900">
                        ₹{calculateItemTotal(item).toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="w-full md:w-1/2">
          <label className="text-sm font-medium mb-2 block">Notes</label>
          <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Add any remarks or internal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Card className="w-full md:w-1/3 bg-gray-50 border-gray-200">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">₹{subtotalBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax / GST</span>
              <span className="font-medium">₹{(totalCgst + totalSgst).toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="font-bold text-lg text-brand-600">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-brand-600 hover:bg-brand-700 h-11 text-base">
              {isSubmitting ? "Saving..." : "Save Purchase & Update Stock"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

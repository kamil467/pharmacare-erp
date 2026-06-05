"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Package, ArrowLeft, Calendar, Edit2, Check } from "lucide-react";
import { addBatch, updateBatchStock } from "@/app/actions/batches";
import Link from "next/link";
import { format } from "date-fns";

export function ProductBatchesClient({ product, initialBatches }: { product: any, initialBatches: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);

  const [formData, setFormData] = useState({
    productId: product.id,
    batchNumber: "",
    expiryDate: "",
    mrp: "",
    purchaseRate: "",
    saleRate: "",
    stock: "0",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await addBatch(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    
    window.location.reload();
  };

  const handleUpdateStock = async (batchId: string) => {
    setLoading(true);
    await updateBatchStock(batchId, editingStockValue, product.id);
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {product.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {product.category} • {product.genericName || "No generic name"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-1">Total Stock</div>
            <div className="text-2xl font-bold text-gray-900">
              {initialBatches.reduce((acc, b) => acc + b.stock, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-1">Active Batches</div>
            <div className="text-2xl font-bold text-gray-900">
              {initialBatches.filter(b => b.stock > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-1">Pack Size</div>
            <div className="text-2xl font-bold text-gray-900">
              {product.packSize || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Batch Inventory
        </h2>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Batch (Stock In)
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-brand-200 animate-slide-up">
          <CardHeader>
            <CardTitle>Add New Batch</CardTitle>
            <CardDescription>
              Record a new stock arrival for {product.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {error && (
                <div className="sm:col-span-full p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  placeholder="e.g. BATCH123"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Shelf/Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Rack A1"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseRate">Purchase Rate (₹) *</Label>
                <Input
                  id="purchaseRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchaseRate}
                  onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP (₹) *</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saleRate">Sale Rate (₹) *</Label>
                <Input
                  id="saleRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.saleRate}
                  onChange={(e) => setFormData({ ...formData, saleRate: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-end gap-2 sm:col-span-full mt-2 pt-4 border-t border-gray-100">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Batch
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Sale Rate</th>
                  <th className="text-center py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No batches found for this product.
                    </td>
                  </tr>
                ) : (
                  initialBatches.map((batch) => {
                    const isExpiringSoon = new Date(batch.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                    const isExpired = new Date(batch.expiryDate) < new Date();
                    
                    return (
                      <tr key={batch.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${batch.stock === 0 ? 'opacity-50' : ''}`}>
                        <td className="py-3 px-4 font-medium text-gray-900">{batch.batchNumber}</td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-1.5 ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(batch.expiryDate), "MMM yyyy")}
                            {isExpired && <span className="text-[10px] ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Expired</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">₹{(batch.mrp / 100).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">₹{(batch.saleRate / 100).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-gray-500">{batch.location || "-"}</td>
                        <td className="py-3 px-4 text-right">
                          {editingStockId === batch.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input 
                                type="number" 
                                min="0" 
                                className="w-20 h-7 text-right text-xs" 
                                value={editingStockValue} 
                                onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className={`font-semibold ${batch.stock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                              {batch.stock}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editingStockId === batch.id ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStock(batch.id)}>
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" onClick={() => setEditingStockId(null)}>
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-gray-400 hover:text-brand-600" 
                              onClick={() => {
                                setEditingStockId(batch.id);
                                setEditingStockValue(batch.stock);
                              }}
                              title="Adjust Stock"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

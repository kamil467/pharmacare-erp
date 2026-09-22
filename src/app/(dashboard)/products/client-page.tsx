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
import { Search, Plus, Loader2, Pill, Power, Edit } from "lucide-react";
import { addProduct, updateProduct, toggleProductStatus } from "@/app/actions/products";
import Link from "next/link";


export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    manufacturer: "",
    category: "Tablet",
    hsnCode: "",
    gstRate: 12,
    packSize: "1x10",
    minStockLevel: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    let res;
    if (editingId) {
      res = await updateProduct(editingId, formData);
    } else {
      res = await addProduct(formData);
    }
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    
    window.location.reload();
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      genericName: product.genericName || "",
      manufacturer: product.manufacturer || "",
      category: product.category,
      hsnCode: product.hsnCode || "",
      gstRate: product.gstRate,
      packSize: product.packSize || "",
      minStockLevel: product.minStockLevel,
    });
    setEditingId(product.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this product?`)) {
      await toggleProductStatus(id, !currentStatus);
      window.location.reload();
    }
  };

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.genericName && p.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
            Medicine Master
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalogue and master details
          </p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({
            name: "",
            genericName: "",
            manufacturer: "",
            category: "Tablet",
            hsnCode: "",
            gstRate: 12,
            packSize: "1x10",
            minStockLevel: 10,
          });
          setShowAddForm(true);
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-brand-200 animate-slide-up">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
            <CardDescription>
              Master details apply to all future batches of this medicine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {error && (
                <div className="sm:col-span-full p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Dolo 650 Tablet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-400"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Drop">Drop</option>
                  <option value="Cream/Ointment">Cream/Ointment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="genericName">Generic Name / Composition</Label>
                <Input
                  id="genericName"
                  placeholder="e.g. Paracetamol 650mg"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="e.g. Micro Labs"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Input
                  id="packSize"
                  placeholder="e.g. 1x15"
                  value={formData.packSize}
                  onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  placeholder="e.g. 3004"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%) *</Label>
                <select 
                  id="gstRate"
                  className="flex h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-400"
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value) })}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Alert Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-end gap-2 sm:col-span-full mt-2 pt-4 border-t border-gray-100">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
                  {editingId ? "Save Changes" : "Create Product"}
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
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Products Catalogue</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Product Name</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!product.isActive ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.genericName && (
                          <div className="text-[11px] text-gray-500 mt-0.5">{product.genericName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                          {product.category}
                        </span>
                        {product.packSize && <span className="ml-2 text-[12px] text-gray-400">({product.packSize})</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-medium ${product.totalStock <= product.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.totalStock}
                        </div>
                        {product.totalStock <= product.minStockLevel && product.totalStock > 0 && (
                          <div className="text-[10px] text-red-500">Low Stock</div>
                        )}
                        {product.totalStock === 0 && (
                          <div className="text-[10px] text-red-500">Out of Stock</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                              View Batches
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-brand-600"
                            onClick={() => handleEdit(product)}
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={`h-7 w-7 ${product.isActive ? 'text-gray-400 hover:text-red-600' : 'text-red-500 hover:text-brand-600'}`}
                            onClick={() => handleToggleActive(product.id, product.isActive)}
                            title={product.isActive ? "Disable Product" : "Enable Product"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

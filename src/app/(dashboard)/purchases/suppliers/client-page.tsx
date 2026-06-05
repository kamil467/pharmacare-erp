"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, MapPin, Phone, Mail, Users } from "lucide-react";
import { addSupplier } from "@/app/actions/suppliers";

export function SuppliersClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstin: "",
    address: "",
  });

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addSupplier(formData);
    if (res.success && res.data) {
      setSuppliers([...suppliers, res.data]);
      setShowAddForm(false);
      setFormData({ name: "", contactPerson: "", phone: "", email: "", gstin: "", address: "" });
    } else {
      alert("Failed to add supplier");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search suppliers..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-brand-600 hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-brand-200 bg-brand-50/30">
          <CardHeader>
            <CardTitle>Add New Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name *</label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person</label>
                <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GSTIN</label>
                <Input value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-600">Save Supplier</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-1" title={supplier.name}>{supplier.name}</h3>
                {supplier.isActive ? (
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Active</span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">Inactive</span>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {supplier.contactPerson && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{supplier.contactPerson}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate" title={supplier.email}>{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-100">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs line-clamp-2" title={supplier.address}>{supplier.address}</span>
                  </div>
                )}
                {supplier.gstin && (
                  <div className="text-xs mt-1 text-gray-500 font-mono">GST: {supplier.gstin}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredSuppliers.length === 0 && !showAddForm && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-gray-200">
            <Users className="mx-auto h-8 w-8 text-gray-300 mb-3" />
            <p className="text-gray-500">No suppliers found</p>
          </div>
        )}
      </div>
    </div>
  );
}

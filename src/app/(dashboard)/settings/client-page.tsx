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
import { Settings as SettingsIcon, Save, Loader2, Store, FileText, MapPin } from "lucide-react";
import { updateStoreSettings } from "@/app/actions/settings";
import type { StoreSettings } from "@/db/schema";

export function SettingsClient({ initialData }: { initialData: StoreSettings | undefined }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    gstin: initialData?.gstin || "",
    drugLicenseNo: initialData?.drugLicenseNo || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    pincode: initialData?.pincode || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    invoicePrefix: initialData?.invoicePrefix || "INV",
    inventoryTrackingMode: initialData?.inventoryTrackingMode || "pack",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    const res = await updateStoreSettings(formData);
    
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(res.error || "Failed to update settings");
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Store Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure your pharmacy store details and billing preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-600" strokeWidth={1.8} />
              Store Information
            </CardTitle>
            <CardDescription>
              Basic details about your pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="store-name">Store Name *</Label>
              <Input
                id="store-name"
                placeholder="My Pharmacy"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => updateField("gstin", e.target.value)}
                maxLength={15}
              />
              <p className="text-[11px] text-gray-400">
                15-digit GST Identification Number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="drug-license">Drug License No.</Label>
              <Input
                id="drug-license"
                placeholder="XX-XXXXX-XXXX"
                value={formData.drugLicenseNo}
                onChange={(e) => updateField("drugLicenseNo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Phone</Label>
              <Input
                id="store-phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">Email</Label>
              <Input
                id="store-email"
                type="email"
                placeholder="store@pharmacy.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" strokeWidth={1.8} />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="Shop No. 1, ABC Complex, Main Road"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
              <p className="text-[11px] text-gray-400">
                Used for CGST/SGST vs IGST calculation
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                placeholder="400001"
                value={formData.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
                maxLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" strokeWidth={1.8} />
              Billing & Operational Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
              <Input
                id="invoice-prefix"
                placeholder="INV"
                value={formData.invoicePrefix}
                onChange={(e) => updateField("invoicePrefix", e.target.value)}
                maxLength={10}
              />
              <p className="text-[11px] text-gray-400">
                Invoices will be numbered as INV-2026-00001
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory-tracking">Inventory Tracking Mode</Label>
              <select
                id="inventory-tracking"
                className="flex h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-400"
                value={formData.inventoryTrackingMode}
                onChange={(e) => updateField("inventoryTrackingMode", e.target.value)}
              >
                <option value="pack">By Packs/Strips (Default)</option>
                <option value="unit">By Individual Pills/Units</option>
              </select>
              <p className="text-[11px] text-gray-400">
                How stock is primarily counted and sold
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2 items-center gap-4">
          {success && (
            <span className="text-sm font-medium text-brand-600 animate-fade-in">
              Settings saved successfully!
            </span>
          )}
          <Button type="submit" disabled={loading} className="gap-2 px-8">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

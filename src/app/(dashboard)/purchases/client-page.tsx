"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Users } from "lucide-react";
import Link from "next/link";
import { getPurchaseDetails } from "@/app/actions/purchases";

export function PurchasesClient({ initialPurchases }: { initialPurchases: any[] }) {
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<any[]>([]);

  const handleViewDetails = async (purchase: any) => {
    setSelectedPurchase(purchase);
    const res = await getPurchaseDetails(purchase.id);
    if (res.data) setPurchaseDetails(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-end">
        <Link href="/purchases/suppliers">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Manage Suppliers
          </Button>
        </Link>
        <Link href="/purchases/new">
          <Button className="gap-2 bg-brand-600 hover:bg-brand-700">
            <Plus className="w-4 h-4" /> New Purchase Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Invoice No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No purchases found.</td>
                  </tr>
                ) : (
                  initialPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{purchase.invoiceNumber}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-500">{purchase.supplierName || "Unknown"}</td>
                      <td className="py-3 px-4">
                        <span className={`capitalize px-2 py-1 rounded text-[11px] ${
                          purchase.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          purchase.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {purchase.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">₹{(purchase.totalAmount / 100).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(purchase)}>
                          <Eye className="w-4 h-4 text-brand-500" />
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

      {selectedPurchase && (
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoice Details: {selectedPurchase.invoiceNumber}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Supplier: {selectedPurchase.supplierName} • Date: {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedPurchase(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4">Qty</th>
                  <th className="text-left py-2 px-4">Free</th>
                  <th className="text-right py-2 px-4">Pur. Rate</th>
                  <th className="text-right py-2 px-4">MRP</th>
                  <th className="text-right py-2 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseDetails.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-center">{item.freeQuantity}</td>
                    <td className="py-2 px-4 text-right">₹{(item.purchaseRate / 100).toFixed(2)}</td>
                    <td className="py-2 px-4 text-right">₹{(item.mrp / 100).toFixed(2)}</td>
                    <td className="py-2 px-4 text-right font-medium">₹{(item.totalAmount / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

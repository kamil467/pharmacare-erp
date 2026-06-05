"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Package, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function InventoryClient({ initialInventory }: { initialInventory: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = initialInventory.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
            Inventory Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Global view of all active batches and stock levels
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Active Batches</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by product or batch..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
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
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No stock found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isExpiringSoon = new Date(item.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                    const isExpired = new Date(item.expiryDate) < new Date();
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{item.productCategory}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">{item.batchNumber}</td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-1.5 ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                            {isExpired || isExpiringSoon ? <AlertTriangle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                            {format(new Date(item.expiryDate), "MMM yyyy")}
                            {isExpired && <span className="text-[10px] ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Expired</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">₹{(item.mrp / 100).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">₹{(item.saleRate / 100).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center text-gray-500">{item.location || "-"}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{item.stock}</td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/products/${item.productId}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 text-brand-600 hover:text-brand-700">
                              Manage <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
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

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";

export function ExpiryClient({ initialData }: { initialData: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "expired" | "30" | "60" | "90">("all");

  const today = new Date();

  const filteredData = initialData.filter(item => {
    // Search filter
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Date filter
    const daysUntilExpiry = differenceInDays(new Date(item.expiryDate), today);
    
    if (filter === "expired") return daysUntilExpiry < 0;
    if (filter === "30") return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    if (filter === "60") return daysUntilExpiry > 30 && daysUntilExpiry <= 60;
    if (filter === "90") return daysUntilExpiry > 60 && daysUntilExpiry <= 90;
    
    return true; // "all"
  });

  const getStatusColor = (expiryDate: Date) => {
    const days = differenceInDays(new Date(expiryDate), today);
    if (days < 0) return "bg-red-50 text-red-700 border-red-200";
    if (days <= 30) return "bg-orange-50 text-orange-700 border-orange-200";
    if (days <= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  const getStatusText = (expiryDate: Date) => {
    const days = differenceInDays(new Date(expiryDate), today);
    if (days < 0) return "Expired";
    if (days === 0) return "Expires Today";
    return `In ${days} days`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={1.8} />
            Expiry Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor and manage batches expiring within the next 90 days.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("all")}
                className={filter === "all" ? "" : "text-gray-500"}
              >
                All Alerts
              </Button>
              <Button 
                variant={filter === "expired" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("expired")}
                className={filter === "expired" ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : "text-gray-500 hover:text-red-600"}
              >
                Expired
              </Button>
              <Button 
                variant={filter === "30" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("30")}
                className={filter === "30" ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" : "text-gray-500 hover:text-orange-500"}
              >
                Next 30 Days
              </Button>
              <Button 
                variant={filter === "60" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("60")}
                className={filter === "60" ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : "text-gray-500 hover:text-amber-500"}
              >
                31-60 Days
              </Button>
              <Button 
                variant={filter === "90" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("90")}
                className={filter === "90" ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500" : "text-gray-500 hover:text-yellow-500"}
              >
                61-90 Days
              </Button>
            </div>
            
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search product or batch..." 
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
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Value (₹)</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-gray-200 mb-2" />
                        <p>No batches found matching the criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const statusClass = getStatusColor(item.expiryDate);
                    const stockValue = (item.purchaseRate / 100) * item.stock;
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusClass}`}>
                            {getStatusText(item.expiryDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{item.productCategory}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">{item.batchNumber}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(item.expiryDate), "MMM yyyy")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{item.stock}</td>
                        <td className="py-3 px-4 text-right text-gray-600">₹{stockValue.toFixed(2)}</td>
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

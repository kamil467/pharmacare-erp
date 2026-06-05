"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GstClient({ salesList, purchasesList }: { salesList: any[], purchasesList: any[] }) {
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportCSV = () => {
    let csvContent = "";

    if (activeTab === "sales") {
      // Sales Header
      csvContent = "Date,Invoice No,Customer,GSTIN,Subtotal,CGST,SGST,IGST,Total Amount\n";

      salesList.forEach(sale => {
        const date = new Date(sale.invoiceDate).toLocaleDateString();
        const row = [
          date,
          sale.invoiceNumber,
          sale.customerName || "Walk-in",
          sale.customerGstin || "N/A",
          (sale.subtotal / 100).toFixed(2),
          (sale.cgst / 100).toFixed(2),
          (sale.sgst / 100).toFixed(2),
          (sale.igst / 100).toFixed(2),
          (sale.totalAmount / 100).toFixed(2)
        ];
        csvContent += row.map(v => `"${v}"`).join(",") + "\n";
      });
    } else {
      // Purchases Header
      csvContent = "Date,Invoice No,Supplier,GSTIN,Subtotal,CGST,SGST,IGST,Total Amount\n";

      purchasesList.forEach(purchase => {
        const date = new Date(purchase.purchaseDate).toLocaleDateString();
        const row = [
          date,
          purchase.invoiceNumber,
          purchase.supplierName || "Unknown",
          purchase.supplierGstin || "N/A",
          (purchase.subtotal / 100).toFixed(2),
          (purchase.cgst / 100).toFixed(2),
          (purchase.sgst / 100).toFixed(2),
          (purchase.igst / 100).toFixed(2),
          (purchase.totalAmount / 100).toFixed(2)
        ];
        csvContent += row.map(v => `"${v}"`).join(",") + "\n";
      });
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `gst_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSales = salesList.filter(s =>
    s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.customerGstin || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPurchases = purchasesList.filter(p =>
    p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.supplierGstin || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sales' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("sales")}
          >
            Output Tax (Sales)
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'purchases' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("purchases")}
          >
            Input Tax Credit (Purchases)
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search invoice or GSTIN..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 bg-white shrink-0">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            {activeTab === "sales" ? "Sales Transactions" : "Purchase Transactions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Invoice No</th>
                  <th className="px-4 py-3 font-medium">{activeTab === "sales" ? "Customer" : "Supplier"}</th>
                  <th className="px-4 py-3 font-medium">GSTIN</th>
                  <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  <th className="px-4 py-3 font-medium text-right">CGST</th>
                  <th className="px-4 py-3 font-medium text-right">SGST</th>
                  <th className="px-4 py-3 font-medium text-right">IGST</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === "sales" ? (
                  filteredSales.length > 0 ? filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-brand-600">{sale.invoiceNumber}</td>
                      <td className="px-4 py-3">{sale.customerName || <span className="text-gray-400 italic">Walk-in</span>}</td>
                      <td className="px-4 py-3 text-xs">{sale.customerGstin || "-"}</td>
                      <td className="px-4 py-3 text-right">₹{(sale.subtotal / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(sale.cgst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(sale.sgst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(sale.igst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">₹{(sale.totalAmount / 100).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No sales transactions found</td>
                    </tr>
                  )
                ) : (
                  filteredPurchases.length > 0 ? filteredPurchases.map(purchase => (
                    <tr key={purchase.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-brand-600">{purchase.invoiceNumber}</td>
                      <td className="px-4 py-3">{purchase.supplierName}</td>
                      <td className="px-4 py-3 text-xs">{purchase.supplierGstin || "-"}</td>
                      <td className="px-4 py-3 text-right">₹{(purchase.subtotal / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(purchase.cgst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(purchase.sgst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{(purchase.igst / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">₹{(purchase.totalAmount / 100).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No purchase transactions found</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

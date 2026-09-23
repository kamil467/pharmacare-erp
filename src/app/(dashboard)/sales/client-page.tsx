"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { getSaleDetails } from "@/app/actions/sales";

export function SalesClient({ initialSales }: { initialSales: any[] }) {
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [saleDetails, setSaleDetails] = useState<any[]>([]);

  const handleViewDetails = async (sale: any) => {
    setSelectedSale(sale);
    const res = await getSaleDetails(sale.id);
    if (res.data) setSaleDetails(res.data);
  };

  const handleExportCSV = () => {
    if (initialSales.length === 0) return;
    
    const headers = ["Invoice No", "Date", "Customer", "Payment Mode", "Subtotal", "Tax", "Total Amount"];
    const rows = initialSales.map(s => [
      s.invoiceNumber,
      new Date(s.invoiceDate).toLocaleDateString(),
      s.customerName || "Walk-in",
      s.paymentMode,
      (s.subtotal / 100).toFixed(2),
      ((s.cgst + s.sgst + s.igst) / 100).toFixed(2),
      (s.totalAmount / 100).toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Invoice No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Mode</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Profit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No sales found.</td>
                  </tr>
                ) : (
                  initialSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.invoiceNumber}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(sale.invoiceDate).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {sale.customerName || "Walk-in"}
                        {sale.customerPhone && <div className="text-xs text-gray-400">{sale.customerPhone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px]">{sale.paymentMode}</span>
                      </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">₹{(sale.totalAmount / 100).toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right font-medium ${sale.profitAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {sale.profitAmount ? `₹${(sale.profitAmount / 100).toFixed(2)}` : "—"}
                    </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale)}>
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

      {selectedSale && (
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoice Details: {selectedSale.invoiceNumber}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">{new Date(selectedSale.invoiceDate).toLocaleString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedSale(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-left py-2 px-4">Batch</th>
                  <th className="text-center py-2 px-4">Qty</th>
                  <th className="text-right py-2 px-4">Rate</th>
                  <th className="text-right py-2 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {saleDetails.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-4">{item.productName}</td>
                    <td className="py-2 px-4 text-xs text-gray-500">{item.batchNumber}</td>
                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-right">₹{(item.saleRate / 100).toFixed(2)}</td>
                    <td className="py-2 px-4 text-right font-medium">₹{(item.totalAmount / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {saleDetails.length > 0 && saleDetails.some(item => item.profitAmount !== null) && (
              <div className="mt-4 flex justify-end gap-6 border-t pt-4 text-sm">
                <span className="text-gray-500">Cost: <strong className="text-gray-700">₹{(saleDetails.reduce((sum, item) => sum + (item.costAmount || 0), 0) / 100).toFixed(2)}</strong></span>
                <span className="text-gray-500">Gross profit: <strong className="text-green-600">₹{(saleDetails.reduce((sum, item) => sum + (item.profitAmount || 0), 0) / 100).toFixed(2)}</strong></span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { FileText, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { sales, purchases, suppliers } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { GstClient } from "./client-page";

export default async function GstPage() {
  // Sales GST
  const salesGst = await db.select({
    cgst: sql<number>`SUM(${sales.cgst})`.mapWith(Number),
    sgst: sql<number>`SUM(${sales.sgst})`.mapWith(Number),
    igst: sql<number>`SUM(${sales.igst})`.mapWith(Number),
  }).from(sales);

  const totalSalesGst = (
    (salesGst[0]?.cgst || 0) +
    (salesGst[0]?.sgst || 0) +
    (salesGst[0]?.igst || 0)
  ) / 100;

  // Purchases GST
  const purchasesGst = await db.select({
    cgst: sql<number>`SUM(${purchases.cgst})`.mapWith(Number),
    sgst: sql<number>`SUM(${purchases.sgst})`.mapWith(Number),
    igst: sql<number>`SUM(${purchases.igst})`.mapWith(Number),
  }).from(purchases);

  const totalPurchasesGst = (
    (purchasesGst[0]?.cgst || 0) +
    (purchasesGst[0]?.sgst || 0) +
    (purchasesGst[0]?.igst || 0)
  ) / 100;

  const netLiability = totalSalesGst - totalPurchasesGst;

  // Detailed lists
  const salesList = await db.select({
    id: sales.id,
    invoiceDate: sales.invoiceDate,
    invoiceNumber: sales.invoiceNumber,
    customerName: sales.customerName,
    customerGstin: sales.customerGstin,
    subtotal: sales.subtotal,
    cgst: sales.cgst,
    sgst: sales.sgst,
    igst: sales.igst,
    totalAmount: sales.totalAmount,
  }).from(sales).orderBy(desc(sales.invoiceDate));

  const purchasesList = await db.select({
    id: purchases.id,
    purchaseDate: purchases.purchaseDate,
    invoiceNumber: purchases.invoiceNumber,
    supplierName: suppliers.name,
    supplierGstin: suppliers.gstin,
    subtotal: purchases.subtotal,
    cgst: purchases.cgst,
    sgst: purchases.sgst,
    igst: purchases.igst,
    totalAmount: purchases.totalAmount,
  }).from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .orderBy(desc(purchases.purchaseDate));

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          GST Compliance
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tax calculation and input credit summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-brand-100 bg-brand-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-700">
              Output Tax (Sales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{totalSalesGst.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div className="flex justify-between"><span>CGST:</span> <span>₹{((salesGst[0]?.cgst || 0) / 100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST:</span> <span>₹{((salesGst[0]?.sgst || 0) / 100).toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-green-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Input Tax Credit (Purchases)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{totalPurchasesGst.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div className="flex justify-between"><span>CGST:</span> <span>₹{((purchasesGst[0]?.cgst || 0) / 100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST:</span> <span>₹{((purchasesGst[0]?.sgst || 0) / 100).toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className={netLiability > 0 ? "border-orange-200" : "border-gray-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Net GST Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netLiability > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              ₹{Math.max(0, netLiability).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {netLiability <= 0 ? "No tax liability. Excess ITC available." : "Tax amount to be paid."}
            </p>
          </CardContent>
        </Card>
      </div>

      <GstClient salesList={salesList} purchasesList={purchasesList} />
    </div>
  );
}

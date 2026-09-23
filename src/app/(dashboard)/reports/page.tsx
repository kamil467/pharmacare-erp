import { BarChart3, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { sales, saleItems, purchases, batches } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function ReportsPage() {
  // 1. Total Revenue
  const revenueResult = await db.select({ total: sql<number>`SUM(${sales.totalAmount})`.mapWith(Number) }).from(sales);
  const totalRevenue = (revenueResult[0]?.total || 0) / 100;

  // 2. Total Purchases Cost
  const purchasesResult = await db.select({ total: sql<number>`SUM(${purchases.totalAmount})`.mapWith(Number) }).from(purchases);
  const totalPurchases = (purchasesResult[0]?.total || 0) / 100;

  // 3. Inventory Valuation (based on purchaseRate)
  const inventoryValueResult = await db.select({
    value: sql<number>`SUM(${batches.stock} * ${batches.purchaseRate})`.mapWith(Number)
  }).from(batches);
  const inventoryValue = (inventoryValueResult[0]?.value || 0) / 100;

  const profitResult = await db.select({
    cost: sql<number>`COALESCE(SUM(${saleItems.costAmount}), 0)`.mapWith(Number),
    profit: sql<number>`COALESCE(SUM(${saleItems.profitAmount}), 0)`.mapWith(Number),
  }).from(saleItems);
  const totalCost = (profitResult[0]?.cost || 0) / 100;
  const grossProfit = (profitResult[0]?.profit || 0) / 100;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Reports & Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Financial and inventory performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Gross Profit</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">₹{grossProfit.toFixed(2)}</div><p className="text-xs text-gray-400 mt-1">Revenue less product cost</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Gross Margin</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-gray-900">{grossMargin.toFixed(1)}%</div><p className="text-xs text-gray-400 mt-1">Before operating expenses</p></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{totalPurchases.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">All time purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Inventory Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{inventoryValue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Based on purchase rates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

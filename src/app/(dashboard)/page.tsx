import {
  Package,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { db } from "@/db";
import { products, batches, sales, purchases, suppliers } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export default async function DashboardPage() {
  // Fetch real data
  const totalProductsCount = await db.select({ count: sql<number>`count(*)` }).from(products);
  const totalProducts = totalProductsCount[0].count;

  // Calculate low stock items
  const productsWithStock = await db
    .select({
      id: products.id,
      minStockLevel: products.minStockLevel,
      totalStock: sql<number>`COALESCE(SUM(${batches.stock}), 0)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(batches, eq(products.id, batches.productId))
    .groupBy(products.id);

  const lowStockItems = productsWithStock.filter(p => p.totalStock <= p.minStockLevel && p.totalStock > 0).length;
  const outOfStockItems = productsWithStock.filter(p => p.totalStock === 0).length;

  // Expiring soon (next 90 days)
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  
  const allBatches = await db.select().from(batches).where(sql`${batches.stock} > 0`);
  const expiringSoonBatches = allBatches.filter(b => new Date(b.expiryDate) <= ninetyDaysFromNow && new Date(b.expiryDate) > new Date()).length;
  const expiredBatches = allBatches.filter(b => new Date(b.expiryDate) <= new Date()).length;

  // Calculate inventory value
  const totalInventoryValue = allBatches.reduce((acc, b) => acc + ((b.purchaseRate * b.stock) / 100), 0);

  // Today's Sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysSalesQuery = await db.select({
    total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`.mapWith(Number)
  })
  .from(sales)
  .where(
    and(
      gte(sales.invoiceDate, today),
      lte(sales.invoiceDate, tomorrow)
    )
  );
  
  const todaysSales = todaysSalesQuery[0].total;

  // Monthly Revenue
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  const monthlySalesQuery = await db.select({
    total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`.mapWith(Number)
  })
  .from(sales)
  .where(
    and(
      gte(sales.invoiceDate, firstDayOfMonth),
      lte(sales.invoiceDate, nextMonth)
    )
  );

  const monthlySales = monthlySalesQuery[0].total;

  const recentSalesQuery = await db.select().from(sales).orderBy(sql`${sales.invoiceDate} DESC`).limit(5);
  
  const recentPurchasesQuery = await db.select({
    id: purchases.id,
    invoiceNumber: purchases.invoiceNumber,
    purchaseDate: purchases.purchaseDate,
    totalAmount: purchases.totalAmount,
    supplierName: suppliers.name
  })
  .from(purchases)
  .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
  .orderBy(sql`${purchases.purchaseDate} DESC`)
  .limit(5);

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${(todaysSales / 100).toFixed(2)}`,
      change: "Live updates",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-brand-50",
      iconColor: "text-brand-600",
    },
    {
      title: "Monthly Revenue",
      value: `₹${(monthlySales / 100).toFixed(2)}`,
      change: "This month",
      changeType: "positive" as const,
      icon: IndianRupee,
      iconBg: "bg-brand-50",
      iconColor: "text-brand-600",
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "Master Catalogue",
      changeType: "neutral" as const,
      icon: Package,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      title: "Low Stock Items",
      value: (lowStockItems + outOfStockItems).toString(),
      change: `${outOfStockItems} out of stock`,
      changeType: (lowStockItems + outOfStockItems) > 0 ? "negative" as const : "positive" as const,
      icon: AlertTriangle,
      iconBg: (lowStockItems + outOfStockItems) > 0 ? "bg-red-50" : "bg-amber-50",
      iconColor: (lowStockItems + outOfStockItems) > 0 ? "text-red-600" : "text-amber-600",
    },
    {
      title: "Expiring Soon",
      value: (expiringSoonBatches + expiredBatches).toString(),
      change: `${expiredBatches} already expired`,
      changeType: (expiringSoonBatches + expiredBatches) > 0 ? "negative" as const : "positive" as const,
      icon: Clock,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      title: "Inventory Value",
      value: `₹${totalInventoryValue.toFixed(2)}`,
      change: "Total purchase value",
      changeType: "neutral" as const,
      icon: ShoppingCart,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here&apos;s your pharmacy overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-[13px] text-gray-500 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-[28px] font-semibold text-gray-900 leading-none tracking-tight">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.changeType === "positive" && (
                        <ArrowUpRight className="w-3.5 h-3.5 text-brand-500" />
                      )}
                      {stat.changeType === "negative" && (
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${
                          stat.changeType === "positive"
                            ? "text-brand-600"
                            : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] ${stat.iconColor}`}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4 text-brand-600"
                strokeWidth={1.8}
              />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSalesQuery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <ShoppingCart
                  className="w-8 h-8 mb-3 text-gray-200"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium text-gray-500">
                  No sales yet
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Sales will appear here once you start billing
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {recentSalesQuery.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(sale.invoiceDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {sale.paymentMode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{(sale.totalAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package
                className="w-4 h-4 text-gray-500"
                strokeWidth={1.8}
              />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPurchasesQuery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Package
                  className="w-8 h-8 mb-3 text-gray-200"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium text-gray-500">
                  No purchases yet
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Purchase entries will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {recentPurchasesQuery.map(purchase => (
                  <div key={purchase.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{purchase.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(purchase.purchaseDate).toLocaleDateString()} • {purchase.supplierName || 'Unknown Supplier'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{(purchase.totalAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

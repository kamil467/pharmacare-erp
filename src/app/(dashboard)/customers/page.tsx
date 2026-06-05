import { Users, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { sales } from "@/db/schema";
import { sql, isNotNull, and, desc } from "drizzle-orm";

export default async function CustomersPage() {
  const customers = await db.select({
    customerPhone: sales.customerPhone,
    customerName: sql<string>`MAX(${sales.customerName})`,
    totalSpent: sql<number>`SUM(${sales.totalAmount})`.mapWith(Number),
    visitCount: sql<number>`COUNT(${sales.id})`.mapWith(Number),
    lastVisit: sql<string>`MAX(${sales.invoiceDate})`
  })
  .from(sales)
  .where(and(isNotNull(sales.customerPhone), sql`${sales.customerPhone} != ''`))
  .groupBy(sales.customerPhone)
  .orderBy(desc(sql`SUM(${sales.totalAmount})`));

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Customer History
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track customer visits and total spending</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Visits</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total Spent</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No customer history found. Start billing with customer numbers!
                    </td>
                  </tr>
                ) : (
                  customers.map((c: any) => (
                    <tr key={c.customerPhone} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{c.customerName || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-500 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {c.customerPhone}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{c.visitCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-brand-600">
                        ₹{(c.totalSpent / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        {new Date(c.lastVisit).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

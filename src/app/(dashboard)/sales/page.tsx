import { TrendingUp } from "lucide-react";
import { getSales } from "@/app/actions/sales";
import { SalesClient } from "./client-page";

export default async function SalesPage() {
  const { data: initialSales = [] } = await getSales();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Sales History
        </h1>
        <p className="text-gray-500 text-sm mt-1">Complete audit trail of all transactions</p>
      </div>
      <SalesClient initialSales={initialSales} />
    </div>
  );
}

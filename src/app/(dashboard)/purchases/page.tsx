import { ShoppingCart } from "lucide-react";
import { getPurchases } from "@/app/actions/purchases";
import { PurchasesClient } from "./client-page";

export const metadata = {
  title: "Purchases - PharmaCare",
};

export default async function PurchasesPage() {
  const { data: initialPurchases = [] } = await getPurchases();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          Purchase Invoices
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track inbound inventory and supplier purchases</p>
      </div>
      <PurchasesClient initialPurchases={initialPurchases || []} />
    </div>
  );
}

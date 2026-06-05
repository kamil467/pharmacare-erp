import { Receipt } from "lucide-react";
import { BillingClient } from "./client-page";

export default function BillingPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          POS Billing
        </h1>
        <p className="text-gray-500 text-sm mt-1">Fast checkout with FEFO auto-allocation</p>
      </div>
      <BillingClient />
    </div>
  );
}

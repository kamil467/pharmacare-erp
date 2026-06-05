import { ShoppingCart } from "lucide-react";
import { db } from "@/db";
import { products, suppliers } from "@/db/schema";
import { NewPurchaseClient } from "./client-page";

export const metadata = {
  title: "New Purchase Invoice - PharmaCare",
};

export default async function NewPurchasePage() {
  const allSuppliers = await db.select().from(suppliers).orderBy(suppliers.name);
  const allProducts = await db.select().from(products).orderBy(products.name);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          New Purchase Invoice
        </h1>
        <p className="text-gray-500 text-sm mt-1">Enter invoice details to automatically update inventory</p>
      </div>
      <NewPurchaseClient suppliers={allSuppliers} products={allProducts} />
    </div>
  );
}

import { db } from "@/db";
import { products, batches } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { InventoryClient } from "./client-page";

export const metadata = {
  title: "Inventory Tracking - PharmaCare",
};

export default async function InventoryPage() {
  // Fetch all active batches with their product info
  const inventoryList = await db
    .select({
      id: batches.id,
      batchNumber: batches.batchNumber,
      expiryDate: batches.expiryDate,
      mrp: batches.mrp,
      purchaseRate: batches.purchaseRate,
      saleRate: batches.saleRate,
      stock: batches.stock,
      location: batches.location,
      productName: products.name,
      productCategory: products.category,
      productId: products.id,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(sql`${batches.stock} > 0`)
    .orderBy(asc(batches.expiryDate));

  return <InventoryClient initialInventory={inventoryList} />;
}

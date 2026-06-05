import { db } from "@/db";
import { products, batches } from "@/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import { ExpiryClient } from "./client-page";

export const metadata = {
  title: "Expiry Tracker - PharmaCare",
};

export default async function ExpiryPage() {
  // Fetch active batches up to 120 days from now, or already expired
  const hundredTwentyDaysFromNow = new Date();
  hundredTwentyDaysFromNow.setDate(hundredTwentyDaysFromNow.getDate() + 120);

  const expiryList = await db
    .select({
      id: batches.id,
      batchNumber: batches.batchNumber,
      expiryDate: batches.expiryDate,
      mrp: batches.mrp,
      saleRate: batches.saleRate,
      stock: batches.stock,
      location: batches.location,
      productName: products.name,
      productCategory: products.category,
      productId: products.id,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(
      sql`${batches.stock} > 0 AND ${batches.expiryDate} <= ${hundredTwentyDaysFromNow}`
    )
    .orderBy(asc(batches.expiryDate));

  return <ExpiryClient initialData={expiryList} />;
}

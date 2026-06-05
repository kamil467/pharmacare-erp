import { db } from "@/db";
import { products, batches } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductBatchesClient } from "./client-page";

export const metadata = {
  title: "Product Details - PharmaCare",
};

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const productList = await db.select().from(products).where(eq(products.id, id));
  
  if (!productList.length) {
    notFound();
  }
  
  const product = productList[0];
  
  const batchList = await db.select().from(batches)
    .where(eq(batches.productId, id))
    .orderBy(asc(batches.expiryDate));

  return <ProductBatchesClient product={product} initialBatches={batchList} />;
}

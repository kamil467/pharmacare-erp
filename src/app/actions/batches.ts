"use server";

import { db } from "@/db";
import { batches } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const batchSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().or(z.date()),
  mrp: z.union([z.string(), z.number()]),
  purchaseRate: z.union([z.string(), z.number()]),
  saleRate: z.union([z.string(), z.number()]),
  stock: z.union([z.string(), z.number()]),
  location: z.string().optional(),
});

export type BatchInput = z.infer<typeof batchSchema>;

export async function addBatch(data: BatchInput) {
  try {
    const parsedData = batchSchema.parse(data);
    const newBatch = await db.insert(batches).values({
      productId: parsedData.productId,
      batchNumber: parsedData.batchNumber,
      expiryDate: new Date(parsedData.expiryDate),
      mrp: typeof parsedData.mrp === 'string' ? Math.round(parseFloat(parsedData.mrp) * 100) : Math.round(parsedData.mrp * 100),
      purchaseRate: typeof parsedData.purchaseRate === 'string' ? Math.round(parseFloat(parsedData.purchaseRate) * 100) : Math.round(parsedData.purchaseRate * 100),
      saleRate: typeof parsedData.saleRate === 'string' ? Math.round(parseFloat(parsedData.saleRate) * 100) : Math.round(parsedData.saleRate * 100),
      stock: typeof parsedData.stock === 'string' ? parseInt(parsedData.stock, 10) : parsedData.stock,
      location: parsedData.location,
    }).returning();
    
    revalidatePath("/inventory");
    revalidatePath(`/products/${parsedData.productId}`);
    return { success: true, batch: newBatch[0] };
  } catch {
    
    return { error: "Failed to add batch" };
  }
}

export async function updateBatchStock(id: string, newStock: number, productId: string) {
  try {
    await db.update(batches)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(batches.id, id));
    
    revalidatePath("/inventory");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch {
    
    return { error: "Failed to update stock" };
  }
}

export async function getBatchesForProduct(productId: string) {
  try {
    const data = await db.select().from(batches)
      .where(eq(batches.productId, productId))
      .orderBy(asc(batches.expiryDate));
    return { data };
  } catch (error) {
    return { error: "Failed to fetch batches" };
  }
}

"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  genericName: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
  gstRate: z.coerce.number().min(0),
  packSize: z.string().nullable().optional(),
  minStockLevel: z.coerce.number().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function addProduct(data: ProductInput) {
  try {
    const parsedData = productSchema.parse(data);
    const newProduct = await db.insert(products).values({
      name: parsedData.name,
      genericName: parsedData.genericName ?? undefined,
      manufacturer: parsedData.manufacturer ?? undefined,
      category: parsedData.category ?? "Other",
      hsnCode: parsedData.hsnCode ?? undefined,
      gstRate: parsedData.gstRate,
      packSize: parsedData.packSize ?? undefined,
      minStockLevel: parsedData.minStockLevel,
    }).returning();

    revalidatePath("/products");
    return { success: true, product: newProduct[0] };
  } catch {
    
    return { error: "Failed to add product" };
  }
}

export async function updateProduct(id: string, data: ProductInput) {
  try {
    const parsedData = productSchema.parse(data);
    await db.update(products).set({
      name: parsedData.name,
      genericName: parsedData.genericName ?? undefined,
      manufacturer: parsedData.manufacturer ?? undefined,
      category: parsedData.category ?? "Other",
      hsnCode: parsedData.hsnCode ?? undefined,
      gstRate: parsedData.gstRate,
      packSize: parsedData.packSize ?? undefined,
      minStockLevel: parsedData.minStockLevel,
      updatedAt: new Date(),
    }).where(eq(products.id, id));

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch {
    
    return { error: "Failed to update product" };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, id));
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update product status" };
  }
}

export async function searchProducts(query: string) {
  try {
    if (!query || query.length < 2) return { data: [] };

    const results = await db.select().from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.genericName, `%${query}%`)
        )
      )
      .limit(10);

    return { data: results };
  } catch (error) {
    return { error: "Search failed" };
  }
}

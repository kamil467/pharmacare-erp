"use server";

import { db } from "@/db";
import { purchases, purchaseItems, batches, suppliers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./audit";
import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().or(z.date()),
  quantity: z.number().min(1),
  freeQuantity: z.number().min(0).optional().default(0),
  purchaseRate: z.number().min(0),
  saleRate: z.number().min(0),
  mrp: z.number().min(0),
  location: z.string().optional(),
});

const purchaseSchema = z.object({
  invoiceNumber: z.string().min(1),
  purchaseDate: z.string().or(z.date()),
  supplierId: z.string().uuid(),
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0).optional().default(0),
  totalAmount: z.number().min(0),
  paymentStatus: z.enum(["paid", "pending", "partial"]),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;

export async function getPurchases() {
  try {
    const allPurchases = await db
      .select({
        id: purchases.id,
        invoiceNumber: purchases.invoiceNumber,
        purchaseDate: purchases.purchaseDate,
        totalAmount: purchases.totalAmount,
        paymentStatus: purchases.paymentStatus,
        supplierName: suppliers.name,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .orderBy(purchases.purchaseDate);

    return { success: true, data: allPurchases };
  } catch {
    
    return { success: false, error: "Failed to fetch purchases" };
  }
}

export async function getPurchaseDetails(purchaseId: string) {
  try {
    const details = await db
      .select()
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));
    return { success: true, data: details };
  } catch {
    
    return { success: false, error: "Failed to fetch purchase details" };
  }
}

export async function createPurchase(purchaseData: PurchaseInput, itemsData: PurchaseItemInput[]) {
  try {
    const parsedPurchase = purchaseSchema.parse(purchaseData);
    const purchaseRow = { ...parsedPurchase, purchaseDate: new Date(parsedPurchase.purchaseDate) };
    const parsedItems = z.array(purchaseItemSchema).parse(itemsData);

    const result = await db.transaction(async (tx) => {
      // 1. Insert the purchase record
      const [newPurchase] = await tx.insert(purchases).values(purchaseRow).returning();

      // 2. Process each item: Create/Update Batch and Insert Purchase Item
      for (const item of parsedItems) {
        // Find if a batch with same productId, batchNumber and expiryDate exists
        const existingBatch = await tx
          .select()
          .from(batches)
          .where(
            and(
              eq(batches.productId, item.productId),
              eq(batches.batchNumber, item.batchNumber)
              // NOTE: For exact match, expiryDate could be compared too, but SQLite dates
              // might have precision issues. Assuming batchNumber is unique per product usually.
            )
          )
          .get();

        let currentBatchId = "";

        if (existingBatch) {
          // Update existing batch
          const [updatedBatch] = await tx
            .update(batches)
            .set({
              stock: existingBatch.stock + item.quantity + (item.freeQuantity || 0),
              purchaseRate: item.purchaseRate,
              saleRate: item.saleRate,
              mrp: item.mrp,
              location: item.location,
              expiryDate: new Date(item.expiryDate), // Just to ensure it's updated if entered differently
              updatedAt: new Date(),
            })
            .where(eq(batches.id, existingBatch.id))
            .returning();
            
          currentBatchId = updatedBatch.id;
        } else {
          // Create new batch
          const [newBatch] = await tx
            .insert(batches)
            .values({
              productId: item.productId,
              batchNumber: item.batchNumber,
              expiryDate: new Date(item.expiryDate),
              purchaseRate: item.purchaseRate,
              saleRate: item.saleRate,
              mrp: item.mrp,
              location: item.location,
              stock: item.quantity + (item.freeQuantity || 0),
            })
            .returning();
            
          currentBatchId = newBatch.id;
        }

        // Insert Purchase Item
        await tx.insert(purchaseItems).values({
          ...item,
          purchaseId: newPurchase.id,
          batchId: currentBatchId,
          totalAmount: item.purchaseRate * item.quantity,
        });
      }

      await createAuditLog(tx, "PURCHASE_CREATED", "purchase", newPurchase.id, {
        invoiceNumber: parsedPurchase.invoiceNumber,
        supplierId: parsedPurchase.supplierId,
        totalAmount: parsedPurchase.totalAmount,
        itemCount: parsedItems.length
      });

      return newPurchase;
    });

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch {
    
    return { success: false, error: "Transaction failed" };
  }
}

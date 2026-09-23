"use server";

import { db } from "@/db";
import { products, batches, sales, saleItems } from "@/db/schema";
import { eq, sql, and, asc, or, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./audit";
import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().optional(),
  quantity: z.number().min(1),
  saleRate: z.number().min(0),
  gstRate: z.number().min(0),
});

const saleSchema = z.object({
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  customerGstin: z.string().nullable().optional(),
  paymentMode: z.enum(["cash", "card", "upi", "credit"]),
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0).optional().default(0),
  totalAmount: z.number().min(0),
  items: z.array(saleItemSchema).min(1),
});

export type SaleInput = z.infer<typeof saleSchema>;

export async function createSale(data: SaleInput) {
  try {
    const parsedData = saleSchema.parse(data);
    return await db.transaction(async (tx) => {
      // Create Sale Record
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      const [newSale] = await tx.insert(sales).values({
        invoiceNumber,
        customerName: parsedData.customerName || null,
        customerPhone: parsedData.customerPhone || null,
        customerGstin: parsedData.customerGstin || null,
        paymentMode: parsedData.paymentMode || "cash",
        subtotal: parsedData.subtotal,
        discount: parsedData.discount || 0,
        cgst: parsedData.cgst,
        sgst: parsedData.sgst,
        igst: parsedData.igst || 0,
        totalAmount: parsedData.totalAmount,
      }).returning();
      
      const saleId = newSale.id;
      const totalTaxableBeforeDiscount = parsedData.items.reduce((sum, item) => {
        const baseRate = item.gstRate > 0 ? Math.round(item.saleRate / (1 + (item.gstRate / 100))) : item.saleRate;
        return sum + baseRate * item.quantity;
      }, 0);
      
      // Process Items with FEFO
      for (const item of parsedData.items) {
        let remainingQuantity = item.quantity;
        
        // Fetch batches for this product ordered by expiry date (FEFO)
        const productBatches = await tx.select()
          .from(batches)
          .where(and(
            eq(batches.productId, item.productId), 
            sql`${batches.stock} > 0`,
            gt(batches.expiryDate, new Date())
          ))
          .orderBy(asc(batches.expiryDate));
          
        for (const batch of productBatches) {
          if (remainingQuantity <= 0) break;
          
          const deduction = Math.min(batch.stock, remainingQuantity);
          remainingQuantity -= deduction;
          
          // Deduct from batch
          await tx.update(batches)
            .set({ stock: batch.stock - deduction, updatedAt: new Date() })
            .where(eq(batches.id, batch.id));
            
          // Base calculations for tax - assuming item.saleRate is INCLUSIVE
          // Base = Rate / (1 + GST/100)
          const baseRate = item.gstRate > 0 ? Math.round(item.saleRate / (1 + (item.gstRate / 100))) : item.saleRate;
          const taxAmt = item.saleRate - baseRate;
          const cgstAmt = Math.round(taxAmt / 2);
          const sgstAmt = taxAmt - cgstAmt;
          const lineTaxableAmount = baseRate * deduction;
          const itemTaxableAmount = baseRate * item.quantity;
          const allocatedDiscount = totalTaxableBeforeDiscount > 0
            ? Math.round(parsedData.discount * (itemTaxableAmount / totalTaxableBeforeDiscount) * (deduction / item.quantity))
            : 0;
          const costAmount = batch.purchaseRate * deduction;
          const profitAmount = lineTaxableAmount - allocatedDiscount - costAmount;
          
          // Insert sale item
          await tx.insert(saleItems).values({
            saleId,
            productId: item.productId,
            batchId: batch.id,
            quantity: deduction,
            saleRate: item.saleRate,
            mrp: batch.mrp,
            gstRate: item.gstRate,
            taxableAmount: baseRate * deduction,
            cgstAmount: cgstAmt * deduction,
            sgstAmount: sgstAmt * deduction,
            igstAmount: 0,
            totalAmount: item.saleRate * deduction,
            purchaseRateAtSale: batch.purchaseRate,
            costAmount,
            profitAmount,
          });
        }
        
        if (remainingQuantity > 0) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }
      
      await createAuditLog(tx, "SALE_CREATED", "sale", saleId, { 
        invoiceNumber, 
        totalAmount: data.totalAmount,
        itemCount: data.items.length
      });
      
      revalidatePath("/billing");
      revalidatePath("/sales");
      revalidatePath("/inventory");
      revalidatePath("/"); // Dashboard
      
      return { success: true, sale: newSale };
    });
  } catch (error: any) {
    
    return { error: error.message || "Failed to create sale" };
  }
}

export async function getSales() {
  try {
    const results = await db.select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      invoiceDate: sales.invoiceDate,
      customerName: sales.customerName,
      customerPhone: sales.customerPhone,
      paymentMode: sales.paymentMode,
      subtotal: sales.subtotal,
      cgst: sales.cgst,
      sgst: sales.sgst,
      igst: sales.igst,
      totalAmount: sales.totalAmount,
      profitAmount: sql<number>`COALESCE((SELECT SUM(${saleItems.profitAmount}) FROM sale_items WHERE sale_items.sale_id = ${sales.id}), 0)`.mapWith(Number),
    }).from(sales).orderBy(sql`${sales.invoiceDate} DESC`).limit(100);
    return { data: results };
  } catch (error) {
    return { error: "Failed to fetch sales" };
  }
}

export async function searchProductsForBilling(query: string = "") {
  try {
    let whereClause = eq(products.isActive, true);
    
    if (query && query.length >= 2) {
      whereClause = and(
        or(
          sql`${products.name} LIKE ${`%${query}%`}`,
          sql`${products.genericName} LIKE ${`%${query}%`}`
        ),
        eq(products.isActive, true)
      ) as any;
    }

    const results = await db.select({
      id: products.id,
      name: products.name,
      genericName: products.genericName,
      packSize: products.packSize,
      gstRate: products.gstRate,
      totalStock: sql<number>`COALESCE(SUM(${batches.stock}), 0)`.mapWith(Number),
      saleRate: sql<number>`MIN(CASE WHEN ${batches.stock} > 0 THEN ${batches.saleRate} ELSE NULL END)`.mapWith(Number),
      mrp: sql<number>`MIN(CASE WHEN ${batches.stock} > 0 THEN ${batches.mrp} ELSE NULL END)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(batches, and(
      eq(products.id, batches.productId),
      gt(batches.expiryDate, new Date())
    ))
    .where(whereClause)
    .groupBy(products.id)
    .having(sql`COALESCE(SUM(${batches.stock}), 0) > 0`)
    .limit(10);
    
    return { data: results };
  } catch {
    return { error: "Search failed" };
  }
}

export async function previewSale(data: { items: SaleInput['items'] }) {
  try {
    const parsedItems = z.array(saleItemSchema).parse(data.items);
    const pickList: any[] = [];

    for (const item of parsedItems) {
      let remainingQuantity = item.quantity;
      
      const productBatches = await db.select()
        .from(batches)
        .where(and(
          eq(batches.productId, item.productId),
          sql`${batches.stock} > 0`,
          gt(batches.expiryDate, new Date())
        ))
        .orderBy(asc(batches.expiryDate));

      for (const batch of productBatches) {
        if (remainingQuantity <= 0) break;

        const deduction = Math.min(batch.stock, remainingQuantity);
        remainingQuantity -= deduction;

        pickList.push({
          productId: item.productId,
          productName: item.productName || "Unknown Product",
          batchNumber: batch.batchNumber,
          location: batch.location || "Unassigned",
          quantityToPick: deduction,
          expiryDate: batch.expiryDate,
        });
      }

      if (remainingQuantity > 0) {
        throw new Error(`Insufficient stock for product ${item.productName || item.productId}`);
      }
    }

    return { success: true, pickList };
  } catch (error: any) {
    
    return { success: false, error: error.message || "Failed to preview sale" };
  }
}

export async function getSaleDetails(saleId: string) {
  try {
    const items = await db.select({
      id: saleItems.id,
      quantity: saleItems.quantity,
      saleRate: saleItems.saleRate,
      mrp: saleItems.mrp,
      gstRate: saleItems.gstRate,
      taxableAmount: saleItems.taxableAmount,
      purchaseRateAtSale: saleItems.purchaseRateAtSale,
      costAmount: saleItems.costAmount,
      profitAmount: saleItems.profitAmount,
      cgstAmount: saleItems.cgstAmount,
      sgstAmount: saleItems.sgstAmount,
      totalAmount: saleItems.totalAmount,
      productName: products.name,
      batchNumber: batches.batchNumber,
      expiryDate: batches.expiryDate
    })
    .from(saleItems)
    .innerJoin(products, eq(saleItems.productId, products.id))
    .innerJoin(batches, eq(saleItems.batchId, batches.id))
    .where(eq(saleItems.saleId, saleId));
    
    return { data: items };
  } catch (error) {
    return { error: "Failed to fetch sale details" };
  }
}

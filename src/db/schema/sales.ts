import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { products } from "./products";
import { batches } from "./batches";

export const sales = sqliteTable("sales", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerGstin: text("customer_gstin"),
  invoiceDate: integer("invoice_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  paymentMode: text("payment_mode", { enum: ["cash", "card", "upi", "credit"] }).notNull().default("cash"),
  subtotal: integer("subtotal").notNull(), // stored in paise, before discount and tax
  discount: integer("discount").notNull().default(0), // stored in paise
  cgst: integer("cgst").notNull().default(0), // stored in paise
  sgst: integer("sgst").notNull().default(0), // stored in paise
  igst: integer("igst").notNull().default(0), // stored in paise
  totalAmount: integer("total_amount").notNull(), // stored in paise, final bill amount
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const saleItems = sqliteTable("sale_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  saleId: text("sale_id").notNull().references(() => sales.id),
  productId: text("product_id").notNull().references(() => products.id),
  batchId: text("batch_id").notNull().references(() => batches.id),
  quantity: integer("quantity").notNull(),
  saleRate: integer("sale_rate").notNull(), // stored in paise, actual rate charged per pack/unit (inclusive of tax)
  mrp: integer("mrp").notNull(), // MRP from the batch (in paise)
  gstRate: integer("gst_rate").notNull(), // GST percent for this item
  taxableAmount: integer("taxable_amount").notNull(), // base value before tax for this line item (in paise)
  cgstAmount: integer("cgst_amount").notNull().default(0), // CGST for this line item (in paise)
  sgstAmount: integer("sgst_amount").notNull().default(0), // SGST for this line item (in paise)
  igstAmount: integer("igst_amount").notNull().default(0), // IGST for this line item (in paise)
  totalAmount: integer("total_amount").notNull(), // total for this line item (in paise), usually quantity * saleRate (inclusive of tax)
});

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;

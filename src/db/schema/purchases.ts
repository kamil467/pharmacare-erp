import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { products } from "./products";
import { batches } from "./batches";
import { suppliers } from "./suppliers";

export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  invoiceNumber: text("invoice_number").notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull(),
  paymentStatus: text("payment_status", { enum: ["paid", "pending", "partial"] }).notNull().default("pending"),
  subtotal: integer("subtotal").notNull(), // stored in paise
  discount: integer("discount").notNull().default(0), // stored in paise
  cgst: integer("cgst").notNull().default(0), // stored in paise
  sgst: integer("sgst").notNull().default(0), // stored in paise
  igst: integer("igst").notNull().default(0), // stored in paise
  totalAmount: integer("total_amount").notNull(), // stored in paise
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const purchaseItems = sqliteTable("purchase_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseId: text("purchase_id").notNull().references(() => purchases.id),
  productId: text("product_id").notNull().references(() => products.id),
  batchId: text("batch_id").notNull().references(() => batches.id), // points to the batch created/updated by this item
  quantity: integer("quantity").notNull(),
  freeQuantity: integer("free_quantity").notNull().default(0),
  purchaseRate: integer("purchase_rate").notNull(), // stored in paise
  mrp: integer("mrp").notNull(), // stored in paise
  saleRate: integer("sale_rate").notNull(), // stored in paise
  cgstAmount: integer("cgst_amount").notNull().default(0), // stored in paise
  sgstAmount: integer("sgst_amount").notNull().default(0), // stored in paise
  totalAmount: integer("total_amount").notNull(), // stored in paise
});

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type NewPurchaseItem = typeof purchaseItems.$inferInsert;

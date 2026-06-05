import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { products } from "./products";

export const batches = sqliteTable("batches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  batchNumber: text("batch_number").notNull(),
  expiryDate: integer("expiry_date", { mode: "timestamp" }).notNull(),
  mrp: integer("mrp").notNull(), // stored in paise
  purchaseRate: integer("purchase_rate").notNull(), // stored in paise
  saleRate: integer("sale_rate").notNull(), // stored in paise
  stock: integer("stock").notNull().default(0),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;

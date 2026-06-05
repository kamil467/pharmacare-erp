import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  manufacturer: text("manufacturer"),
  category: text("category").notNull(), // e.g. "Tablet", "Syrup", "Injection"
  hsnCode: text("hsn_code"),
  gstRate: integer("gst_rate").notNull().default(12),
  packSize: text("pack_size"), // e.g. "1x10"
  minStockLevel: integer("min_stock_level").notNull().default(10),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

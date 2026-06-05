import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const storeSettings = sqliteTable("store_settings", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().default("My Pharmacy"),
  gstin: text("gstin"),
  drugLicenseNo: text("drug_license_no"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  invoicePrefix: text("invoice_prefix").notNull().default("INV"),
  isInterStateDefault: integer("is_inter_state_default", { mode: "boolean" }).notNull().default(false),
  inventoryTrackingMode: text("inventory_tracking_mode", { enum: ["pack", "unit"] }).notNull().default("pack"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type NewStoreSettings = typeof storeSettings.$inferInsert;

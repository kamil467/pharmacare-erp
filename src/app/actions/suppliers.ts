"use server";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  try {
    const allSuppliers = await db.select().from(suppliers).orderBy(suppliers.name);
    return { success: true, data: allSuppliers };
  } catch {
    
    return { success: false, error: "Failed to fetch suppliers" };
  }
}

export async function searchSuppliers(query: string) {
  try {
    const results = await db
      .select()
      .from(suppliers)
      .where(
        or(
          like(suppliers.name, `%${query}%`),
          like(suppliers.contactPerson, `%${query}%`),
          like(suppliers.phone, `%${query}%`)
        )
      )
      .limit(10);
    return { success: true, data: results };
  } catch {
    
    return { success: false, error: "Failed to search suppliers" };
  }
}

export async function addSupplier(data: Omit<typeof suppliers.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  try {
    const [newSupplier] = await db.insert(suppliers).values(data).returning();
    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases/new");
    return { success: true, data: newSupplier };
  } catch {
    
    return { success: false, error: "Failed to add supplier" };
  }
}

export async function updateSupplier(id: string, data: Partial<Omit<typeof suppliers.$inferInsert, "id" | "createdAt" | "updatedAt">>) {
  try {
    const [updated] = await db
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
      
    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases/new");
    return { success: true, data: updated };
  } catch {
    
    return { success: false, error: "Failed to update supplier" };
  }
}

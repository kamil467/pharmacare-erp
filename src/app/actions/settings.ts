"use server";

import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStoreSettings(data: any) {
  try {
    await db
      .update(storeSettings)
      .set({
        name: data.name,
        gstin: data.gstin,
        drugLicenseNo: data.drugLicenseNo,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        invoicePrefix: data.invoicePrefix,
        inventoryTrackingMode: data.inventoryTrackingMode,
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.id, 1));
      
    revalidatePath("/settings");
    return { success: true };
  } catch {
    
    return { error: "Failed to update store settings" };
  }
}

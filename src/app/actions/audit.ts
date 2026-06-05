"use server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export async function createAuditLog(
  tx: any, 
  action: string, 
  entityType: string, 
  entityId: string, 
  details?: any
) {
  try {
    const detailsStr = details ? JSON.stringify(details) : null;
    await tx.insert(auditLogs).values({
      action,
      entityType,
      entityId,
      details: detailsStr
    });
  } catch {
    // Audit log failures are non-critical; swallow silently
  }
}

export async function getAuditLogs(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const logs = await db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
      
    return { success: true, data: logs };
  } catch {
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

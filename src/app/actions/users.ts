"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["owner", "staff"]),
});

export type UserInput = z.infer<typeof userSchema>;

export async function addUser(data: UserInput) {
  try {
    const parsedData = userSchema.parse(data);
    const passwordHash = await bcrypt.hash(parsedData.password, 12);
    
    await db.insert(users).values({
      name: parsedData.name,
      email: parsedData.email.toLowerCase(),
      passwordHash,
      role: parsedData.role,
      isActive: true,
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("UNIQUE")) {
      return { error: "Email already exists" };
    }
    return { error: "Failed to add user" };
  }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  try {
    await db.update(users).set({ isActive }).where(eq(users.id, id));
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
    return { success: true };
  } catch {
    return { error: "Failed to reset password" };
  }
}

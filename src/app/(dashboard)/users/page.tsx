import { db } from "@/db";
import { users } from "@/db/schema";
import { UsersClient } from "./client-page";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  
  if (session?.user?.role !== "owner") {
    redirect("/");
  }

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  return <UsersClient initialUsers={allUsers} currentUserEmail={session?.user?.email || ""} />;
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (session?.user?.role !== "owner") {
    redirect("/");
  }

  return children;
}

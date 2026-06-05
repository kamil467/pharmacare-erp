import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./client-page";

export default async function SettingsPage() {
  const settings = await db.query.storeSettings.findFirst({
    where: eq(storeSettings.id, 1),
  });

  return <SettingsClient initialData={settings} />;
}

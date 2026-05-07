import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storeSettingsTable } from "@workspace/db";
import { UpdateStoreSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(storeSettingsTable).limit(1);
  if (!existing) {
    const [created] = await db.insert(storeSettingsTable).values({}).returning();
    return created;
  }
  return existing;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(settings);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateStoreSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await ensureSettings();

  const [updated] = await db
    .update(storeSettingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(storeSettingsTable.id, settings.id))
    .returning();

  res.json(updated);
});

export default router;

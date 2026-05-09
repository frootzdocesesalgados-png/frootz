import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "frootz2024";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  (req.session as Record<string, unknown>).admin = { username, loggedIn: true };
  res.json({ username, loggedIn: true });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.session as Record<string, unknown>;
  const admin = session.admin as { username: string; loggedIn: boolean } | undefined;

  if (!admin?.loggedIn) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({ username: admin.username, loggedIn: true });
});

export default router;

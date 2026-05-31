import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

interface StreamPermission {
  status: "pending" | "approved" | "denied";
  streamKey: string;
  requestedAt: number;
  userId: string;
}

const permissions = new Map<string, StreamPermission>();

function generateStreamKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "plat_";
  for (let i = 0; i < 14; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

router.post("/request", (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return void res.status(401).json({ error: "Unauthorized" });

  const existing = permissions.get(userId);
  if (existing?.status === "approved") {
    return void res.json({ status: "approved", streamKey: existing.streamKey });
  }
  if (existing?.status === "pending") {
    return void res.json({ status: "pending" });
  }

  permissions.set(userId, {
    status: "pending",
    streamKey: generateStreamKey(),
    requestedAt: Date.now(),
    userId,
  });
  res.json({ status: "pending" });
});

router.get("/status", (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return void res.status(401).json({ error: "Unauthorized" });

  const perm = permissions.get(userId);
  if (!perm) return void res.json({ status: "none" });

  res.json({
    status: perm.status,
    streamKey: perm.status === "approved" ? perm.streamKey : undefined,
  });
});

router.post("/approve", (req, res) => {
  const { userId: requesterId } = getAuth(req);
  const adminKey = process.env.ADMIN_KEY || "platipus-admin-2024";
  const { code, userId } = req.body as { code?: string; userId?: string };

  const targetId = userId ?? requesterId;
  if (!targetId) return void res.status(400).json({ error: "No user ID" });

  if (code !== adminKey) {
    return void res.status(403).json({ error: "Invalid code" });
  }

  const perm = permissions.get(targetId);
  if (!perm) {
    permissions.set(targetId, {
      status: "approved",
      streamKey: generateStreamKey(),
      requestedAt: Date.now(),
      userId: targetId,
    });
    return void res.json({ status: "approved", streamKey: permissions.get(targetId)!.streamKey });
  }

  perm.status = "approved";
  res.json({ status: "approved", streamKey: perm.streamKey });
});

router.get("/requests", (req, res) => {
  const adminKey = process.env.ADMIN_KEY || "platipus-admin-2024";
  const keyHeader = req.headers["x-admin-key"];
  if (keyHeader !== adminKey) return void res.status(403).json({ error: "Forbidden" });
  res.json(Array.from(permissions.values()));
});

export default router;

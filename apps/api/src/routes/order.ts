import { Router } from "express";
import { IntentRequest } from "../../../packages/types/src";
import { parseOrderIntent } from "../services/ai";

const router = Router();

router.post("/intent", async (req, res) => {
  const { message, cartContext } = req.body as IntentRequest;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const result = await parseOrderIntent(message, cartContext ?? []);
  res.json(result);
});

export default router;

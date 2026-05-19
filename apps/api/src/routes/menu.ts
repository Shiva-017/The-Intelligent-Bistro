import { Router } from "express";
import { menu } from "../data/menu";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ items: menu });
});

router.get("/:id", (req, res) => {
  const item = menu.find((m) => m.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

export default router;

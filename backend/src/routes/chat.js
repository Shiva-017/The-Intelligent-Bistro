const { Router } = require("express");
const { processOrder } = require("../services/claude");

const router = Router();

router.post("/", async (req, res) => {
  const { message, cart = [], history = [] } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const result = await processOrder(message, cart, history);
  res.json(result);
});

module.exports = router;

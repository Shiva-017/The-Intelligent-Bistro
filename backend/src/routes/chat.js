const { Router } = require("express");
const { processOrder } = require("../services/claude");

const router = Router();

router.post("/", async (req, res) => {
  const { message, cart = [], history = [] } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      reply: "Please send a message.",
      action: "none",
      items: [],
    });
  }

  try {
    const result = await processOrder(message, cart, history);
    res.json(result);
  } catch (err) {
    console.error("Claude error:", err?.message ?? err);
    res.status(500).json({
      reply: "Sorry, I had trouble processing that. Please try again.",
      action: "none",
      items: [],
    });
  }
});

module.exports = router;

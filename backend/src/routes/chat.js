const { Router } = require("express");

const router = Router();

router.post("/", (req, res) => {
  res.json({ reply: "ok", action: null });
});

module.exports = router;

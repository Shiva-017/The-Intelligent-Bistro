const { Router } = require("express");
const menu = require("../data/menu");

const router = Router();

router.get("/", (req, res) => {
  res.json(menu);
});

module.exports = router;

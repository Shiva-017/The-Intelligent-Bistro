const express = require("express");
const cors = require("cors");
const menuRouter = require("./src/routes/menu");
const chatRouter = require("./src/routes/chat");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/menu", menuRouter);
app.use("/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

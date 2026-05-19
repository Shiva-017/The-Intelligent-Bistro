import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import menuRouter from "./routes/menu";
import orderRouter from "./routes/order";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRouter);
app.use("/api/order", orderRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

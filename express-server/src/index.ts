import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { apiRouter } from "./routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api", apiRouter);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

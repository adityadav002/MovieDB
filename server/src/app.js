import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./libs/db.js";
import dataRoute from "./routes/dataRoute.js";
import authRouter from "./routes/authRoute.js";

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Backend is working ✅');
});

app.use("/api", dataRoute);
app.use("/api/auth", authRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Global Error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectdb();
});

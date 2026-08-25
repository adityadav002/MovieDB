import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./libs/db.js";
import dataRoute from "./routes/dataRoute.js";
import authRouter from "./routes/authRoute.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "up", 
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/data", dataRoute);

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
  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled Global Error:", err.stack);
  }
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Internal server error",
      code: err.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectdb();
});

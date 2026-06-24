/** @format */

import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./libs/db.js";
import dataRoute from "./routes/dataRoute.js";
import authRouter from "./routes/authRoute.js";
// import session from 'express-session';

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true 
}));

app.get('/', (req, res) => {
  res.send('Backend is working ✅');
});

app.use("/api", dataRoute);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectdb();
});

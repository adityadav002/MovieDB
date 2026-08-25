import express from "express"
import {registerUser, loginUser, getCurrentUser, logoutUser} from "../controllers/authController.js"
import authMiddleware from "../middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
const authRouter = express.Router()

authRouter.post('/register', authLimiter, registerUser);

authRouter.post('/login', authLimiter, loginUser);

authRouter.get('/logout', logoutUser);

authRouter.post('/protect', authMiddleware, getCurrentUser);

export default authRouter
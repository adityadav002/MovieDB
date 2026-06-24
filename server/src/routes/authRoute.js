import express from "express"
import {registerUser, loginUser, getCurrentUser, logoutUser} from "../controllers/authController.js"
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router()

authRouter.post('/register', registerUser);

authRouter.post('/login', loginUser);

authRouter.get('/logout', logoutUser);

authRouter.post('/protect', authMiddleware, getCurrentUser);

export default authRouter
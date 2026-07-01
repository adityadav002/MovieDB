import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(201).json({
      message: "User created successfully",
      user: { name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error("Error from registerUser:", error);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "1h" });
      
      return res.status(200).json({
        message: "Login successful",
        user: { name: user.name, email: user.email },
        token,
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error from loginUser:", error);
    return res.status(500).json({ message: "Internal server error during login" });
  }
};

export const logoutUser = (req, res) => {
  // Since we rely on frontend localStorage for token, the backend logout is essentially a no-op 
  // but we can return success for consistency.
  return res.status(200).json({ message: "Logout successful" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error from getCurrentUser:", error);
    res.status(500).json({ message: "Internal server error fetching user" });
  }
};
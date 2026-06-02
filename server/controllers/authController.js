import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

// Helper: Generate JWT Token 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==========================================
// 1. REGISTER USER
// ==========================================
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation guard
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword // Save the hashed password, not plain text!
        });

        // Generate dynamic session token
        const token = generateToken(user._id);

        return res.status(201).json({ success: true, token, user });

    } catch (error) {
        console.error("Register error:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================================
// 2. LOGIN USER
// ==========================================
export const login = async (req, res) => { // Fixed "eqq" typo and added missing "async" keyword
    try {
        const { email, password } = req.body;

        // Validation guard
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Find the user by their unique email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Check if the submitted password matches the hashed password in MongoDB
        const isMatch = await bcrypt.compare(password, user.password); // Fixed "compaire" spelling typo
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate token for existing user session
        const token = generateToken(user._id);

        return res.status(200).json({ success: true, token, user });

    } catch (error) {
        console.error("Login error:", error.message); // Fixed label context from "Register error" to "Login error"
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

 // get current user
 export const getUser = async (req, res) => { // Fixed "eqq" typo and added missing "async" keyword
    try {
        const user = await User.findById(req.userId).select("-password");
         if(!user){
            return res.status(400).json({success: false, message: "user not found"})

         }

         res.json({success: true, user})
         

    } catch (error) {
        console.error("det user error:", error.message); // Fixed label context from "Register error" to "Login error"
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

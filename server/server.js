import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rankRoutes from './routes/rankRoutes.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';

const app = express();

// 1. CORS Middleware - Placed at the very top
// This allows your frontend (localhost:5173) to talk to this backend
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Standard Middleware
app.use(express.json());

// 3. API Routes
app.use('/api/rank', rankRoutes);
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(process.cwd(), "../client/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(process.cwd(), "../client/dist", "index.html"));
    });
}
// 4. Database Connection
mongoose.connect(process.env.MONGODB_URL || process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// 5. Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
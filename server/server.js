import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rankRoutes from './routes/rankRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true
}));
app.use(express.json());

// 2. API Routes
app.use('/api/rank', rankRoutes);
app.use('/api/auth', authRoutes);

// 3. Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
    // Points to the 'client/dist' folder created after 'npm run build'
    const clientPath = path.resolve(__dirname, '../client/dist');
    app.use(express.static(clientPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
    });
}

// 4. Database Connection
mongoose.connect(process.env.MONGODB_URL || process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// 5. Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
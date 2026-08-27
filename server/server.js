import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rankRoutes from './routes/rankRoutes.js';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:5000',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server tools (no origin), and allow when origin is in the list
    if (!origin) return callback(null, true);

    // If FRONTEND_URL is not set in production, be permissive to avoid blocking builds/preview
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // Otherwise check the allowed list and any additional env-provided URLs
    const extra = [
      ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((u) => u.trim()) : []),
      ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
    ];
    const allAllowed = new Set([...allowedOrigins, ...extra]);
    if (allAllowed.has(origin)) return callback(null, true);

    // Optional override: set ALLOW_ORIGIN='*' to allow any origin (not recommended for long-term)
    if (process.env.ALLOW_ORIGIN === '*') return callback(null, true);

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'seo-rank-tracker', mongo: mongoose.connection.readyState === 1 });
});

app.use('/api/rank', rankRoutes);
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientPath = path.resolve(__dirname, '../client/dist');
  console.log('Production mode detected. NODE_ENV=%s, serving client from %s', process.env.NODE_ENV, clientPath);

  // Explicitly enable index serving for static files to make behavior deterministic
  app.use(express.static(clientPath, { index: 'index.html' }));

  // Serve index.html for any non-API route. Using app.use avoids path-to-regexp parsing issues
  // that can occur with express v5 when using wildcard patterns. Explicitly skip API routes.
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/_next') || req.path.startsWith('/static')) {
      return next();
    }
    console.log('Serving index.html for path:', req.path);
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

const mongoUri = process.env.MONGODB_URL || process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected Successfully');
    } catch (err) {
      console.error('MongoDB Connection Error:', err);
    }
  } else {
    console.log('No MongoDB connection string provided. Running in fallback mode without database persistence.');
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
};

startServer();
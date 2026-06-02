SEO Rank Tracker
A full-stack MERN (MongoDB, Express, React, Node.js) application designed to track and monitor keyword rankings for SEO purposes.

🚀 Architecture
This project uses a decoupled architecture for optimal performance:

Frontend: Built with React + Vite and deployed on Vercel for high-speed content delivery.

Backend: Built with Node.js + Express and deployed on Render to manage API logic and database connectivity.

📁 Project Structure
Plaintext
seo-rank-tracker/
├── client/          # Vite + React Frontend
└── server/          # Node.js + Express Backend
⚙️ Development Setup
Prerequisites
Node.js (v18+)

MongoDB Atlas account

1. Backend Setup
Bash
cd server
npm install
# Create a .env file in the /server directory:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# FRONTEND_URL=http://localhost:5173
node server.js
2. Frontend Setup
Bash
cd client
npm install
# Run the development server
npm run dev
🌐 Deployment Instructions
1. Frontend (Vercel)
Import your GitHub repository into Vercel.

Root Directory: Set to client.

Vercel will auto-detect the Vite configuration.

Deploy.

2. Backend (Render)
Create a new Web Service on Render.

Root Directory: Set to server.

Build Command: npm install

Start Command: node server.js

Environment Variables: Add the following in the Render Dashboard:

NODE_ENV: production

MONGO_URI: your_mongodb_connection_string

FRONTEND_URL: https://your-vercel-frontend-url.vercel.app

🛠 Tech Stack
Frontend: React, Vite, Tailwind CSS, Axios, Lucide-React

Backend: Node.js, Express, Mongoose (MongoDB)

Authentication: JWT (JSON Web Tokens)

Deployment: Vercel (Frontend), Render (Backend)

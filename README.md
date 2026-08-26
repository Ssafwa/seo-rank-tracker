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
# Create a .env file in the /server directory with these variables (example):
# JWT_SECRET="your_jwt_secret_here"
# MONGODB_URL="mongodb+srv://<username>:<password>@cluster0.kwdy7yb.mongodb.net/seo?retryWrites=true&w=majority"
# (or) MONGO_URI="mongodb://user:pass@host:port/dbname"  # include the protocol prefix
# PORT=5000
# FRONTEND_URL=http://localhost:5173
# BROWSERBASE_API_KEY="your_browserbase_api_key_here"  # required for search/rank features that use Browserbase
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

Environment Variables: Add the following in the Render Dashboard (use MONGODB_URL or MONGO_URI — both are supported):

NODE_ENV: production

JWT_SECRET: your_jwt_secret

MONGODB_URL: mongodb+srv://<username>:<password>@cluster0.kwdy7yb.mongodb.net/seo?retryWrites=true&w=majority
# or MONGO_URI: mongodb://user:pass@host:port/dbname

FRONTEND_URL: https://your-vercel-frontend-url.vercel.app

BROWSERBASE_API_KEY: your_browserbase_api_key (required for the keyword rank/check feature)

🛠 Tech Stack
Frontend: React, Vite, Tailwind CSS, Axios, Lucide-React

Backend: Node.js, Express, Mongoose (MongoDB)

Authentication: JWT (JSON Web Tokens)

Deployment: Vercel (Frontend), Render (Backend)

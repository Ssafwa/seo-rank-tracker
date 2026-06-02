SEO Rank Tracker
A full-stack MERN (MongoDB, Express, React, Node.js) application designed to track and monitor keyword rankings for SEO purposes.

🚀 Overview
This application helps users track their website's performance on search engines. It consists of a React frontend for the dashboard and a Node.js/Express backend for API handling and database management.

🛠 Tech Stack
Frontend: React, Vite, Tailwind CSS, Axios, Lucide-React

Backend: Node.js, Express, Mongoose (MongoDB)

Authentication: JWT-based auth

Deployment: Vercel (Frontend), Render (Backend)

📁 Project Structure
Plaintext
seo-rank-tracker/
├── client/          # Vite + React Frontend
├── server/          # Node.js + Express Backend
└── README.md
⚙️ Installation & Setup
Prerequisites
Node.js (v18+)

MongoDB Atlas Account

npm or yarn

1. Backend Setup
Bash
cd server
npm install
# Create a .env file in the server folder
# Add: MONGO_URI=your_mongodb_connection_string
# Add: PORT=5000
# Add: FRONTEND_URL=https://your-vercel-url.vercel.app
node server.js
2. Frontend Setup
Bash
cd client
npm install
# Ensure you are pointing to your backend URL in your API calls
npm run dev
🌐 Deployment
Frontend (Vercel)
Import your GitHub repository to Vercel.

Set the Root Directory to client.

Vercel will auto-detect the Vite configuration. Click Deploy.

Backend (Render)
Create a new Web Service on Render.

Set the Root Directory to server.

Set Build Command to npm install.

Set Start Command to node server.js.

Add your Environment Variables (MONGO_URI, FRONTEND_URL) in the Render Dashboard.

💡 How to use this
Register/Login: Securely access your personalized dashboard.

Add Keywords: Input the keywords you wish to track.

Monitor: View ranking updates and SEO data via the dashboard interface.

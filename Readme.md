# 🚀 HostKit  
### AI-Powered Deployment & Debugging Platform

HostKit is a full-stack DevOps platform that allows developers to deploy, monitor, and debug applications with the help of AI.

It simplifies the deployment process by combining containerization, real-time logging, and intelligent error analysis into a single platform.

---

## 📌 Problem Statement

This project is built for a hackathon under the **DevOps Deployment Panel** category.

As described in the problem statement:
- Users should be able to connect repositories
- Deploy applications
- Manage environment variables
- View logs
- Rollback deployments

This aligns with the hackathon requirement to build a real-world DevOps system.

---

## ✨ Features

### 🔹 Core Features
- One-click deployment
- GitHub repository integration
- Real-time logs streaming
- AI-based error explanation
- Environment variable management
- Deployment history tracking
- Rollback support

### 🔹 Advanced Features
- Docker-based container deployment
- Queue-based job processing (Redis + BullMQ)
- Reverse proxy using NGINX
- Modular backend architecture
- AI debugging suggestions

---

## 🧠 System Architecture

```
Frontend (React)
   ↓
API Gateway (Node.js / Express)
   ↓
Backend Services
   ↓
Queue (Redis / BullMQ)
   ↓
Worker Service
   ↓
Docker Engine
   ↓
Running Containers
   ↓
NGINX (Reverse Proxy)
```

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)

### Backend
- Node.js
- Express

### Database
- MongoDB

### DevOps
- Docker
- NGINX
- Redis (BullMQ)

### AI
- LLM-based error analysis

---

## ⚙️ How It Works

1. User connects a GitHub repository  
2. Deployment is triggered  
3. Job is pushed into Redis queue  
4. Worker service:
   - Clones the repository  
   - Builds Docker image  
   - Runs container  
5. Logs are captured in real-time  
6. Frontend displays logs using WebSockets  
7. AI analyzes errors and suggests fixes  

---

## 📡 Real-Time Logs

- Implemented using Socket.io  
- Backend streams logs  
- Worker sends execution logs  
- Frontend displays logs live  

---

## 🔐 Authentication

- JWT-based authentication  
- GitHub OAuth integration  

---

## 📦 Project Structure

```
HOSTKIT/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js
│   │   │   ├── database.js
│   │   │   └── redis.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── deployment.controller.js
│   │   │   └── project.controller.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── admin.middleware.js
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── deployment.model.js
│   │   │   ├── deploymentLog.model.js
│   │   │   ├── project.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── queue/
│   │   │   └── deployment.queue.js
│   │   │
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── deployment.routes.js
│   │   │   └── project.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── ai.service.js
│   │   │   ├── deployment.service.js
│   │   │   ├── mail.service.js
│   │   │   └── project.service.js
│   │   │
│   │   ├── validation/
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── workers/
│   │   │   └── deploymentWorker.js
│   │   │
│   │   └── app.js
│   │
│   ├── server.js
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── dashboard/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── shared/
│   │   ├── App.jsx
│   │   ├── AppRoutes.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
├── deployments/
├── docker-compose.yml
├── .gitignore
└── README.md
```
---

## 🚧 Current Status

⚠️ Deployment is not fully completed due to:
- Cloud infrastructure limitations  
- Lack of payment methods for cloud services  
- Docker orchestration challenges  

✅ However:
- Backend architecture is implemented  
- Queue + worker system is working  
- Real-time logging is implemented  
- System design is complete  

---

## 🎯 Future Improvements

- AWS ECS / Kubernetes integration  
- Auto scaling  
- Custom domain support  
- CI/CD with GitHub Actions  
- Improved UI/UX  

---

## 🎥 Demo

Add your demo video link here.

---

## 🌍 Live Link

Deployment in progress.

---

## 👥 Team

- Sameer (Backend + DevOps)  
- Team Members (Frontend + AI)

---

## 💡 Why This Project?

- Solves a real-world DevOps problem  
- Combines MERN + Docker + AI  
- Focuses on practical implementation  
- Aligns with hackathon evaluation criteria:
  - Functionality  
  - UI/UX  
  - Performance  
  - Real-world usability  

---

## 🧩 Key Learnings

- System design (production level thinking)  
- Docker and containerization  
- Queue systems (BullMQ)  
- Real-time communication  
- AI integration  

---

## 🛠️ Setup Instructions

```bash
# Clone repository
git clone https://github.com/sameer-dev-106/hostKit

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Run project
npm run dev
```

---

## ⭐ Final Note

HostKit is an attempt to build a **mini Heroku / Railway-like platform** with AI-powered debugging capabilities.

Even though deployment is still in progress, the system demonstrates strong architecture, real-world thinking, and DevOps concepts.

---
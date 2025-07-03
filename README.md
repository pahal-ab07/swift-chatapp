# Swift-Chat: Real-Time Chat Application

A modern, full-stack real-time chat application with authentication, responsive design, and a beautiful UI.

---

## 🚀 Tech Stack

### **Frontend**
- **React** (v19+): Component-based UI
- **Vite**: Fast development/build tool
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **tailwind-scrollbar**: Custom, styled scrollbars
- **React Router DOM**: Client-side routing
- **Axios**: HTTP requests
- **React Hot Toast**: Toast notifications

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web server and API framework
- **WebSocket (ws)**: Real-time, bidirectional communication
- **MongoDB**: NoSQL database for user, message, and profile storage
- **Mongoose**: MongoDB object modeling
- **Nodemailer**: Email sending for verification

### **Authentication & Security**
- **JWT (JSON Web Tokens)**: Secure authentication
- **Bcrypt**: Password hashing
- **Email Verification**: Secure user onboarding

### **Other**
- **ESLint**: Code linting and quality
- **PostCSS & Autoprefixer**: CSS processing
- **Modern JavaScript (ES6+)**: Clean, modular code

---

## ✨ Features

- **User Registration & Login** (with email verification)
- **Real-Time Messaging** (WebSocket-powered)
- **Responsive UI** (desktop & mobile)
- **Profile Management** (update name, avatar, etc.)
- **Online/Offline User Status**
- **Custom Scrollbars** (for chat area)
- **Beautiful, Modern Design** (Tailwind CSS)
- **Toast Notifications** (for feedback)
- **Secure Authentication** (JWT, bcrypt)
- **Email Verification** (Nodemailer)
- **Error Handling** (frontend and backend)

---

## 📁 Project Structure

```
Real-Time-Chat-Application/
  frontend/         # React + Vite + Tailwind client
    src/
      components/   # Reusable UI components
      pages/        # Main pages (Login, Register, Chat, etc.)
      context/      # React context for auth/profile
      assets/       # Images and static assets
    public/
    tailwind.config.js
    package.json
  server/           # Node.js + Express + WebSocket backend
    controllers/
    models/
    routes/
    middleware/
    utils/
    wsServer.js
    index.js
    package.json
```

---

## 🛠️ Getting Started

### **1. Clone the repository**
```bash
git clone https://github.com/your-username/real-time-chat-application.git
cd real-time-chat-application
```

### **2. Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install
```

### **3. Configure Environment Variables**
- Create a `.env` file in the `server/` directory for MongoDB URI, JWT secret, email credentials, etc.

### **4. Run the Application**
```bash
# Start backend
cd server
npm run dev

# Start frontend (in a new terminal)
cd ../frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000) (or as configured)

---

## 📸 Screenshots

_Add screenshots of your landing page, chat UI, login/register, etc._

---

## 🙏 Credits

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Nodemailer](https://nodemailer.com/)
- [React Hot Toast](https://react-hot-toast.com/)

---

## 📄 License

MIT License
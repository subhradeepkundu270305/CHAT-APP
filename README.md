<div align="center">

  <img src="https://img.shields.io/badge/EverLink-Live%20Demo-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  &nbsp;
  <img src="https://img.shields.io/badge/Made_with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  &nbsp;
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  &nbsp;
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  &nbsp;
  <img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  &nbsp;
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />

</div>

<br />

<div align="center">
  <h1>💬 EverLink — Real-Time Chat App</h1>
  <p><strong>A premium, full-stack real-time chat application built with the MERN stack + Socket.io.<br/>Dark-mode UI, Google auth, media sharing, typing indicators, and more.</strong></p>

  <a href="https://chat-app-wheat-seven-59.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-chat--app--wheat--seven--59.vercel.app-8b5cf6?style=for-the-badge" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
    <img src="https://img.shields.io/badge/⭐%20Star%20on-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Google OAuth** | One-tap sign-in via Google — no passwords needed |
| ⚡ **Real-Time Messaging** | Instant bi-directional chat powered by Socket.io |
| ✅ **Read Receipts** | Double-tick indicators (grey = delivered, blue = seen) |
| ⌨️ **Typing Indicator** | Live "typing…" animation when the other person types |
| 🖼️ **Image Sharing** | Share photos up to 10MB via Cloudinary CDN |
| 🗑️ **Delete Messages** | Remove messages from both sides in real-time |
| 🟢 **Online Status** | See who's online with a live green dot + last seen time |
| 📇 **Contact Linking** | Add contacts by phone number with a link-request system |
| 🔔 **Link Requests** | Send, receive, accept, cancel, or deny contact requests |
| 😊 **Emoji Picker** | Full categorised emoji picker built into the message bar |
| 👤 **Profile Setup** | Upload avatar, set display name, bio & phone number |
| 📸 **Contact Info Panel** | View shared media, contact details, and remove contacts |
| 📱 **Mobile Responsive** | Fully adaptive — works perfectly on any screen size |
| 🌑 **Premium Dark UI** | Glassmorphic dark theme with neon violet accents & animations |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite** — fast modern SPA
- **Tailwind CSS v4** — utility-first styling
- **Socket.io-client** — real-time bi-directional events
- **React Router DOM v7** — client-side routing
- **@react-oauth/google** — Google One-Tap OAuth
- **Axios** — HTTP client

### Backend
- **Node.js** + **Express.js** — REST API & WebSocket server
- **MongoDB** + **Mongoose** — document database
- **Socket.io** — WebSocket engine
- **JWT** + **Google Auth Library** — authentication
- **Cloudinary** — image upload & CDN storage
- **bcryptjs** — password hashing

### Deployment
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Railway](https://railway.app)
- **Database** → MongoDB Atlas

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) — local or Atlas cluster
- Cloudinary account
- Google OAuth Client ID

### 1. Clone the repo
```bash
git clone https://github.com/subhradeepkundu270305/CHAT-APP.git
cd CHAT-APP
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
npm run server
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the dev server:
```bash
npm run dev
```

### 4. Open the app
```
http://localhost:5173
```

---

## 📁 Project Structure

```
CHAT-APP/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # ChatContainer, Sidebar, RightSidebar
│   │   ├── pages/           # HomePage, LoginPage, ProfilePage
│   │   ├── context/         # SocketContext
│   │   └── lib/             # API client, utilities
│   └── index.html
│
└── server/                  # Node.js + Express backend
    ├── controllers/         # Auth, messages, contacts, users
    ├── models/              # Mongoose schemas (User, Message, Contact, LinkRequest)
    ├── routes/              # REST API routes
    ├── socket/              # Socket.io event handlers
    └── server.js
```

---

## 🤝 Contributing

Contributions are welcome and appreciated!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ by **[Subhradeep Kundu](https://github.com/subhradeepkundu270305)**

⭐ If you found this project useful, please consider giving it a star on GitHub!

</div>

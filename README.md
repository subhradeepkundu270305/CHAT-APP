<div align="center">
  <br />
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Made_with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Made_with-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    </a>
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Made_with-Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    </a>
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Powered_by-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    </a>
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Styled_with-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
    </a>
    <a href="https://github.com/subhradeepkundu270305/CHAT-APP" target="_blank">
      <img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
    </a>
</div>

# Real-Time Chat Application 💬

A modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for seamless communication.

## ✨ Features

- **🔐 Authentication**: Secure user login and registration using JWT and Google OAuth.
- **💬 Real-Time Messaging**: Instant messaging capabilities powered by Socket.io.
- **🖼️ Media Sharing**: Support for sharing images via Cloudinary integration.
- **👥 Contact Management**: Add and manage user contacts easily.
- **📱 Responsive Design**: Fully responsive, mobile-first design leveraging Tailwind CSS.
- **💅 Premium UI**: Modern aesthetic with dark mode and smooth micro-interactions.

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **Authentication**: `@react-oauth/google`
- **Real-time**: `socket.io-client`
- **HTTP Client**: Axios

### Backend (Server-Side)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT) & Google Auth Library
- **Password Hashing**: bcryptjs
- **Media Storage**: Cloudinary

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/subhradeepkundu270305/CHAT-APP.git
   cd CHAT-APP
   ```

2. **Setup the Backend Server**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory and add the following configuration:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   PORT=5000

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google OAuth (if applicable)
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. **Setup the Frontend Client**
   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### Running the Application

1. **Start the Express Backend**
   Open a terminal, navigate to the `server` directory, and run:
   ```bash
   npm run server
   ```

2. **Start the React Frontend**
   Open a second terminal, navigate to the `client` directory, and run:
   ```bash
   npm run dev
   ```

3. **Access the App**
   Open your browser and navigate to `http://localhost:5173/`

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Subhradeep Kundu**
- GitHub: [@subhradeepkundu270305](https://github.com/subhradeepkundu270305)

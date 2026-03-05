import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SocketProvider } from './context/SocketContext';

// --- STARTUP: Clean up any stale / malformed tokens ---
try {
  const token = localStorage.getItem('token');
  if (token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Malformed token');
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.id || !payload?.exp) throw new Error('Invalid token payload');
    if (Date.now() / 1000 > payload.exp) throw new Error('Token expired');
  }
} catch {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
// ------------------------------------------------------

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
)

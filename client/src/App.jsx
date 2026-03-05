import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'

// Guard: redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Guard: redirects authenticated users away from /login
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (token) {
    // Already logged in — send to the right page
    return <Navigate to={user.isProfileComplete ? '/' : '/profile'} replace />
  }
  return children
}

const App = () => {
  return (
    <div
      className="
        min-h-screen w-full relative overflow-hidden
        bg-[url('./src/assets/bgImage.svg')]
        bg-cover bg-center bg-no-repeat
      "
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 min-h-screen">
        <Routes>
          {/* Root rendering HomePage */}
          <Route path='/' element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          {/* Public — only accessible when NOT logged in */}
          <Route path='/login' element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          {/* Protected Profile page */}
          <Route path='/profile' element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Legacy Contacts route redirecting to root */}
          <Route path='/contacts' element={<Navigate to="/" replace />} />

          {/* Catch-all fallback */}
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

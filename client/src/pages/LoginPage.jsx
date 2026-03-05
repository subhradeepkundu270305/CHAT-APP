import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/api';
import assets from '../assets/assets';

const LoginPage = () => {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential,
      });

      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (!user.isProfileComplete) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.error || "Google login failed");
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-y-auto bg-[#0A0A0A] flex items-center justify-center font-sans">

      {/* ===== AMBIENT BACKGROUND GLOW ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen absolute top-[-20%] left-[-10%]" />
        <div className="w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen absolute bottom-[-10%] right-[-5%]" />
      </div>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center md:justify-between min-h-[100dvh] md:min-h-[80vh] gap-8 md:gap-0 py-10 md:py-0">

        {/* LEFT — 3D SPLINE DESIGN — hidden on mobile, shown on md+ */}
        <div className="hidden md:flex w-full lg:w-1/2 justify-center items-center h-[400px] lg:h-[600px] relative">
          <div className="absolute inset-0 w-full h-full drop-shadow-[0_0_80px_rgba(139,92,246,0.3)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-black/20">
            <iframe
              src='https://my.spline.design/robotfollowcursorforlandingpage-8hl8uqza5al7iUz0nxPluq4O/'
              frameBorder='0'
              width='100%'
              height='100%'
              title="3D Robot"
              className="absolute inset-0"
            ></iframe>
            {/* Hide the Spline "Built with Spline" button */}
            <div
              className="absolute bottom-0 right-0 w-72 h-28 z-10"
              style={{
                background: '#b84d7a',
                WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 100%, black 70%, transparent 95%)',
                maskImage: 'radial-gradient(ellipse 100% 100% at 100% 100%, black 70%, transparent 95%)',
              }}
            />
          </div>
        </div>

        {/* RIGHT — PREMIUM AUTH CARD */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-12">

          {/* Animated Glowing Neon Border wrapper */}
          <div className="relative w-full max-w-[420px] rounded-3xl p-[2px] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">

            {/* Spinning gradient layers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_310deg,#8b5cf6_360deg)] animate-[spin_4s_linear_infinite] opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_180deg,transparent_0_310deg,#d946ef_360deg)] animate-[spin_4s_linear_infinite] opacity-80" />

            {/* Inner Card */}
            <div
              className="relative w-full h-full rounded-[calc(1.5rem-2px)] p-7 sm:p-8 lg:p-10 z-10 overflow-hidden"
              style={{ background: 'rgba(10,5,30,0.95)', backdropFilter: 'blur(25px)' }}
            >
              {/* INNER CARD GLOW */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              {/* Mobile: show logo branding */}
              <div className="mb-8 sm:mb-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <img src={assets.chat} alt="EverLink" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                  <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                    <span className="font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">EverLink</span>
                  </h1>
                </div>
                <p className="text-white/50 text-sm font-light">
                  Sign in to continue your seamless spatial journey.
                </p>
              </div>

              {errorMsg && (
                <div className="text-red-300 text-sm text-center border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-3 mb-6 backdrop-blur-md">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-6">
                <div className="relative group p-[1px] rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  {/* ANIMATED BORDER FOR BUTTON */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/50 via-fuchsia-600/50 to-violet-600/50 opacity-50 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex justify-center items-center bg-[#111111] p-1.5 rounded-full transition-colors w-full z-10">
                    <div className="w-full flex justify-center invert-[0.05] contrast-125">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setErrorMsg("Google login failed")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        width="300"
                      />
                    </div>
                  </div>
                </div>

                {/* DECORATIVE DIVIDER */}
                <div className="flex items-center justify-center gap-4 mt-4 opacity-30">
                  <div className="h-[1px] w-12 bg-white/50" />
                  <span className="text-xs text-white/70 uppercase tracking-widest font-mono">Secure Auth</span>
                  <div className="h-[1px] w-12 bg-white/50" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default LoginPage

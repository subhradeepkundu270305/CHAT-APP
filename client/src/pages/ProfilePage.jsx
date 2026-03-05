import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import assets from '../assets/assets'

const ProfilePage = () => {
  const navigate = useNavigate()

  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) setFullName(user.fullName);
    if (user.bio) setBio(user.bio);
    if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
    if (user.avatar) setAvatarPreview(user.avatar);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size exceeds 10MB limit. Please choose a smaller image.")
        return
      }
      setErrorMsg("")
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    if (!phoneNumber.trim()) {
      setErrorMsg("Mobile number is required to complete your profile.")
      return
    }

    if (phoneNumber.trim().length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.")
      return
    }

    if (avatar && avatar.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return }

      const payload = {
        fullName,
        bio,
        phoneNumber: phoneNumber.trim(),
        avatar: avatar ? avatarPreview : undefined
      }

      const res = await api.put('/api/users/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/')
    } catch (error) {
      console.error(error)
      setErrorMsg(error.response?.data?.error || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-y-auto bg-[#0A0A0A] flex items-center justify-center font-sans">

      {/* ===== AMBIENT BACKGROUND GLOW ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full bg-violet-600/20 blur-[150px] mix-blend-screen absolute top-[-20%] left-[-10%]" />
        <div className="w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen absolute bottom-[-10%] right-[-5%]" />
      </div>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center md:justify-between min-h-[100dvh] md:min-h-[80vh] gap-8 md:gap-0 py-10 md:py-0">

        {/* LEFT — 3D SPLINE DESIGN — hidden on mobile */}
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

        {/* RIGHT — PREMIUM PROFILE CARD */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-12 relative">

          {/* Animated Glowing Neon Border wrapper */}
          <div className="relative w-full max-w-[440px] rounded-3xl p-[2px] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">

            {/* Spinning gradient layer */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_310deg,#8b5cf6_360deg)] animate-[spin_4s_linear_infinite] opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_180deg,transparent_0_310deg,#d946ef_360deg)] animate-[spin_4s_linear_infinite] opacity-80" />

            {/* Inner Card cutting out the center */}
            <div className="relative w-full h-full rounded-[calc(1.5rem-2px)] p-8 lg:p-10 z-10" style={{ background: 'rgba(10,5,30,0.95)', backdropFilter: 'blur(25px)' }}>

              {/* INNER CARD TOP GLOW */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              {/* HEADER */}
              <div className="mb-8 text-center flex flex-col items-center">
                <img src={assets.chat} alt="EverLink" className="w-10 h-10 mb-3 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                <h1 className="text-2xl font-light tracking-tight text-white mb-1">
                  Your <span className="font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Profile</span>
                </h1>
                <p className="text-white/40 text-xs font-light tracking-wide">Update your photo and personal details</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">

                {/* AVATAR UPLOADER */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer">
                    {/* Glowing ring */}
                    <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />
                    <div className="relative w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden transition-all">
                      <img
                        src={avatarPreview || assets.avatar_icon}
                        alt="Profile Preview"
                        className={`w-full h-full object-cover ${!avatarPreview ? 'p-4 opacity-50' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white/70 text-[10px] font-medium">Change</span>
                      </div>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 tracking-wide">JPG, PNG, WEBP · Max 10MB</p>

                  {errorMsg && (
                    <div className="text-red-300 text-xs text-center border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-2.5 w-full backdrop-blur-md">
                      {errorMsg}
                    </div>
                  )}
                </div>

                {/* DIVIDER */}
                <div className="h-[1px] bg-white/[0.06] my-1" />

                {/* FULL NAME */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest pl-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="profile-input"
                    required
                  />
                </div>

                {/* BIO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest pl-1 font-medium">Bio</label>
                  <textarea
                    placeholder="Write a short bio about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="profile-input resize-none"
                    rows="2"
                  />
                </div>

                {/* PHONE NUMBER */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest pl-1 font-medium flex items-center gap-2">
                    Mobile Number
                    <span className="text-violet-400/80 normal-case tracking-normal text-[10px]">· required</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Add your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="profile-input"
                    required
                  />
                  <p className="text-[10px] text-amber-400/70 pl-1 flex items-start gap-1 mt-0.5">
                    <span>⚠</span>
                    <span>Used by contacts to find and add you on EverLink.</span>
                  </p>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative mt-2 group overflow-hidden py-3 rounded-2xl text-sm font-medium tracking-wide text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)', backgroundSize: '200% 200%' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <img src={assets.chat} alt="" className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                        Save Profile
                      </>
                    )}

                  </span>
                </button>

              </form>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .profile-input {
          width: 100%;
          background: rgba(10, 5, 30, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.35);
          box-shadow: 0 0 0 1px rgba(139,92,246,0.08), 0 0 12px rgba(139,92,246,0.1), inset 0 1px 8px rgba(0,0,0,0.5);
          border-radius: 0.9rem;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: white;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .profile-input::placeholder { color: rgba(255,255,255,0.2); }
        .profile-input:focus {
          border-color: rgba(167,139,250,0.7);
          box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1), inset 0 1px 8px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  )
}

export default ProfilePage

import React, { useState, useEffect, useRef } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useSocket } from '../context/SocketContext'

const Sidebar = ({ selectedUser, setSelectedUser, contacts, fetchContacts, user, unreadCounts = {}, lastMessages = {}, linkRequests = [], sentRequests = [], onRespondRequest, onCancelRequest, onLinkRequestSent }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useSocket()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [syncInput, setSyncInput] = useState("")
  const [messageMsg, setMessageMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [contactSearch, setContactSearch] = useState("")
  const [notifTab, setNotifTab] = useState("received") // "received" | "sent"

  const menuRef = useRef(null)
  const notifRef = useRef(null)

  // Handle click outside to close menu / notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSync = async (e) => {
    e.preventDefault();
    setMessageMsg(""); setErrorMsg("");
    if (!syncInput.trim()) return;
    if (syncInput.trim().length !== 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/link-requests/send', { phoneNumber: syncInput.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessageMsg(res.data.message || "Link request sent!");
      if (onLinkRequestSent) onLinkRequestSent();
      setSyncInput("");
      setTimeout(() => setMessageMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to send request.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getLastMsgPreview = (contactUser) => {
    const lm = lastMessages[contactUser._id];
    if (!lm) return null;
    if (lm.deleted) return '🚫 This message was deleted';
    if (lm.image) return '📷 Photo';
    if (lm.text) return lm.text.length > 32 ? lm.text.slice(0, 32) + '…' : lm.text;
    return null;
  };

  const pendingCount = linkRequests.length;

  return (
    <div
      className={`
        bg-black/40 backdrop-blur-3xl
        h-full p-3 sm:p-5 rounded-l-2xl overflow-y-auto text-white
        border-r border-violet-500/10 shadow-[20px_0_60px_rgba(0,0,0,0.5)]
        ${selectedUser ? "hidden md:block" : ""}
      `}
    >
      {/* Header */}
      <div className="pb-6">
        <div className="relative flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <img src={assets.chat} alt="EverLink" className="w-7 h-7 drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]" />
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight">
              EverLink
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <div ref={notifRef}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <img src={assets.frnd} alt="Requests" className="w-5 h-5 opacity-80 brightness-150" style={{ filter: 'drop-shadow(0 0 5px rgba(139,92,246,0.6))' }} />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.7)] animate-pulse">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-3 w-[300px] sm:w-[360px] max-h-[400px] overflow-y-auto rounded-2xl border border-violet-500/20 text-sm z-[100] flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)]"
                  style={{
                    background: 'rgba(12, 6, 30, 0.98)',
                    backdropFilter: 'blur(24px)'
                  }}
                >
                  <div className="px-3 pt-3 pb-1 flex border-b border-white/5">
                    <button
                      onClick={() => setNotifTab("received")}
                      className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${notifTab === "received" ? "text-violet-300 border-violet-500" : "text-white/40 border-transparent hover:text-white/60"}`}
                    >
                      Received ({pendingCount})
                    </button>
                    <button
                      onClick={() => setNotifTab("sent")}
                      className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${notifTab === "sent" ? "text-violet-300 border-violet-500" : "text-white/40 border-transparent hover:text-white/60"}`}
                    >
                      Sent ({sentRequests.length})
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {notifTab === "received" ? (
                      pendingCount === 0 ? (
                        <div className="py-8 text-center">
                          <img src={assets.frnd} className="w-8 h-8 mx-auto mb-2 opacity-20 grayscale brightness-200" alt="No requests" />
                          <p className="text-white/30 text-xs">No pending requests</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {linkRequests.map((req) => (
                            <div
                              key={req._id}
                              className="flex items-start gap-3 p-3 rounded-xl border border-violet-500/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                              <img
                                src={req.from?.avatar || assets.avatar_icon}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-violet-500/20"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-white/90 leading-snug">
                                  <span className="font-semibold text-white">{req.from?.fullName}</span>
                                  {' '}wants to link with you
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => onRespondRequest(req._id, 'accept')}
                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 bg-violet-600/30 text-violet-200 border border-violet-500/30 hover:bg-violet-500/50 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                  >
                                    Link
                                  </button>
                                  <button
                                    onClick={() => onRespondRequest(req._id, 'deny')}
                                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 bg-white/5 text-white/50 border border-white/10 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                  >
                                    Deny
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      // Sent Tab
                      sentRequests.length === 0 ? (
                        <div className="py-8 text-center">
                          <img src={assets.frnd} className="w-8 h-8 mx-auto mb-2 opacity-20 grayscale brightness-200" alt="No sent requests" />
                          <p className="text-white/30 text-xs">No sent requests</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {sentRequests.map((req) => (
                            <div
                              key={req._id}
                              className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                              <img
                                src={req.to?.avatar || assets.avatar_icon}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10"
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-[13px] text-white/90 leading-snug mb-2">
                                  Requested {' '}
                                  <span className="font-semibold text-white">{req.to?.fullName || req.to?.phoneNumber}</span>
                                </p>
                                <button
                                  onClick={() => onCancelRequest(req._id)}
                                  className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 bg-white/5 text-white/50 border border-white/10 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                >
                                  Cancel Request
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center opacity-80 hover:opacity-100"
              >
                <img src={assets.menu_icon} alt="Menu" className="h-[18px]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 p-2 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-sm z-30">
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/90 hover:text-white flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <div className="h-[1px] bg-white/10 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Contact — Mobile Number Only */}
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSync} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(10, 5, 30, 0.6)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 0 12px rgba(139,92,246,0.1), inset 0 1px 8px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.7)';
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(167,139,250,0.15), 0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1), inset 0 1px 8px rgba(0,0,0,0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.08), 0 0 12px rgba(139,92,246,0.1), inset 0 1px 8px rgba(0,0,0,0.5)';
              }}
            >
              <svg className="w-4 h-4 text-violet-400/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Enter phone number to link…"
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                className="bg-transparent outline-none text-[13px] w-full placeholder:text-white/30 text-white"
              />
              <button
                type="submit"
                className="w-6 h-6 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all flex-shrink-0 hover:shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {messageMsg && <p className="text-green-400 text-[10px] pl-1 font-medium">{messageMsg}</p>}
            {errorMsg && <p className="text-red-400 text-[10px] pl-1 font-medium">{errorMsg}</p>}
          </form>
        </div>
      </div>

      {/* Contact Search */}
      <div className="mb-3">
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 group/search"
          style={{
            background: 'rgba(10, 5, 30, 0.5)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 0 0 1px rgba(139,92,246,0.05), 0 0 8px rgba(139,92,246,0.06), inset 0 1px 6px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(167,139,250,0.12), 0 0 16px rgba(139,92,246,0.2), 0 0 32px rgba(139,92,246,0.08), inset 0 1px 6px rgba(0,0,0,0.4)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.05), 0 0 8px rgba(139,92,246,0.06), inset 0 1px 6px rgba(0,0,0,0.4)';
          }}
        >
          <svg
            className="w-4 h-4 text-violet-400/60 group-focus-within/search:text-violet-300 transition-colors duration-300 flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts…"
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-white/25 text-white/90"
          />
          {contactSearch && (
            <button
              onClick={() => setContactSearch("")}
              className="w-4 h-4 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <svg className="w-2.5 h-2.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex flex-col gap-2 relative pb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/30 px-1 mb-1">Recent Chats</h3>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <svg className="w-10 h-10 mb-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <p className="text-xs text-center font-medium">No contacts yet</p>
            <p className="text-[10px] text-center mt-1">Enter a phone number above to link</p>
          </div>
        ) : (
          contacts
            .filter((c) => {
              if (!contactSearch.trim()) return true;
              const name = c.contactUserId?.fullName || '';
              return name.toLowerCase().includes(contactSearch.trim().toLowerCase());
            })
            .map((c) => {
              const contactUser = c.contactUserId;
              if (!contactUser) return null;
              const isActive = selectedUser?._id === contactUser._id;
              const isOnline = onlineUsers.includes(contactUser._id);
              const unread = unreadCounts[contactUser._id] || 0;
              const lastMsg = getLastMsgPreview(contactUser);

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedUser(contactUser)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group
                    ${isActive
                      ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 border border-violet-500/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.15)]"
                      : "border border-transparent hover:bg-white/5 hover:border-violet-500/10"}`}
                >
                  {/* Avatar with online dot */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full p-[2px] transition-all duration-500 ${isActive ? 'bg-gradient-to-tr from-violet-400 to-fuchsia-500 rotate-[360deg]' : 'bg-white/10 group-hover:bg-violet-500/40'}`}>
                      <img
                        src={contactUser.avatar || assets.avatar_icon}
                        alt=""
                        className="w-full h-full rounded-full object-cover bg-black/60 border-2 border-transparent"
                      />
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#100a20] transition-colors
                        ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-600'}`}
                    />
                  </div>

                  {/* Name + Last Message */}
                  <div className="flex flex-col flex-1 overflow-hidden justify-center pl-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`font-medium truncate text-[14px] ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white/95'}`}>
                        {contactUser.fullName}
                      </p>
                    </div>

                    {lastMsg ? (
                      <p className={`text-[12px] truncate ${unread > 0 ? 'text-violet-300 font-medium' : 'text-white/50 group-hover:text-white/70'}`}>
                        {lastMsg}
                      </p>
                    ) : (
                      <p className="text-[12px] text-white/30 truncate italic">
                        {contactUser.bio || "Say hello!"}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { useSocket } from '../context/SocketContext'

// ── Emoji data by category ────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: '😀', name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷'] },
  { label: '👋', name: 'Gestures', emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦵', '🦶', '👀', '👅', '🫶'] },
  { label: '❤️', name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☯️', '🫀', '💋', '💌', '💍', '💎'] },
  { label: '🐶', name: 'Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🦄', '🐔', '🐧', '🐦', '🦅', '🦉', '🐺', '🦋', '🐛', '🐌', '🐞', '🐜', '🦟', '🐢', '🦎', '🐍', '🦀', '🦞', '🐠', '🐳', '🐬', '🐊'] },
  { label: '🍕', name: 'Food', emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🥑', '🥦', '🌽', '🥕', '🍔', '🍟', '🍕', '🌮', '🌯', '🥗', '🍜', '🍣', '🍦', '🍰', '🎂', '🍫', '🍬', '🍭', '☕', '🧃', '🥤', '🍺', '🥂'] },
  { label: '✈️', name: 'Travel', emojis: ['🚗', '🚕', '🚙', '🚌', '🏎', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸', '🚂', '⛵', '🚢', '🏠', '🏡', '🏢', '🗼', '🗽', '⛺', '🏖', '🏔', '🌋', '🗺', '🌍', '🌎', '🌏', '🌙', '⭐', '🌟', '☀️', '⛅', '🌩', '❄️', '🌈', '🌊'] },
  { label: '🎉', name: 'Objects', emojis: ['🎉', '🎊', '🎈', '🎀', '🎁', '🏆', '🥇', '🎭', '🎨', '🎬', '🎤', '🎵', '🎶', '🎸', '🎹', '🥁', '🎮', '🕹', '🎯', '🎲', '🧩', '🎩', '🎪', '🔥', '💥', '✨', '🌸', '💫', '🌺', '🌻', '🌷', '🍀', '🌿', '🍁', '🌾'] },
  { label: '💯', name: 'Symbols', emojis: ['💯', '🔔', '🔕', '💤', '♾', '🔄', '✅', '❌', '❓', '❗', '💢', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🔲', '🔳', '▶️', '⏩', '⏭', '⏸', '⏹', '⏺', '🔁', '🔀', '🆕', '🆙', '🆒', '🆓', '🔝', '🅰️', '🅱️', '🆎', '🆑'] },
];

// ── Animated typing dots ───────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 justify-start mb-4">
    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '180ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '360ms' }} />
    </div>
  </div>
)

// ── Premium double-tick read receipt ─────────────────────────────────
const MessageTicks = ({ seen }) => {
  const color = seen ? '#60a5fa' : '#6b7280'; // blue when seen, grey otherwise
  return (
    <span className="inline-flex items-center ml-1">
      <svg viewBox="0 0 18 12" className="w-4 h-[11px]" fill="none">
        {/* First tick */}
        <path d="M1 6L5.5 10.5L13 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Second tick (offset right) */}
        <path d="M5 10.5L17 1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
};

// ── Format last-seen ───────────────────────────────────────────────────
const formatLastSeen = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
  if (isToday) return `last seen today at ${timeStr}`;
  if (isYesterday) return `last seen yesterday at ${timeStr}`;
  return `last seen ${date.toLocaleDateString([], { day: 'numeric', month: 'short' })} at ${timeStr}`;
};

const TYPING_THROTTLE_MS = 1000;

const ChatContainer = ({
  selectedUser,
  setSelectedUser,
  setIsInfoOpen,
  messages,
  newMessage,
  setNewMessage,
  imagePreview,
  setImagePreview,
  handleSendMessage,
  chatError,
  user,
  isTyping,
  socket,
  onDeleteMessage,
}) => {
  const scrollEnd = useRef()
  const typingTimeoutRef = useRef(null)
  const emojiPickerRefDesk = useRef(null)
  const emojiPickerRefMob = useRef(null)
  const { onlineUsers, lastSeenMap } = useSocket()
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [emojiTab, setEmojiTab] = useState(0)
  const [activeMsgId, setActiveMsgId] = useState(null)

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e) => {
      const clickedDesk = emojiPickerRefDesk.current && emojiPickerRefDesk.current.contains(e.target);
      const clickedMob = emojiPickerRefMob.current && emojiPickerRefMob.current.contains(e.target);
      if (!clickedDesk && !clickedMob) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // ── Typing emit ────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedUser) return;
    if (!typingTimeoutRef.current) socket.emit('typing', { to: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { to: selectedUser._id });
      typingTimeoutRef.current = null;
    }, TYPING_THROTTLE_MS);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { alert("File size exceeds 10MB limit."); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMsg = async (msgId) => {
    if (!msgId || deletingId === msgId) return;
    setDeletingId(msgId);
    try {
      await onDeleteMessage(msgId);
    } finally {
      setDeletingId(null);
    }
  };

  const lastSeenSource = lastSeenMap[selectedUser?._id] || selectedUser?.lastSeen;
  const statusLine = isOnline ? 'Online' : formatLastSeen(lastSeenSource);

  return selectedUser ? (
    <div className='h-full flex flex-col bg-white/[0.02] backdrop-blur-3xl overflow-hidden'>

      {/* ── HEADER */}
      <div className='flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-6 border-b border-white/5 bg-black/20 backdrop-blur-xl z-20 shadow-sm'>

        {/* Mobile: back button */}
        <button
          onClick={() => setSelectedUser(null)}
          className='md:hidden flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 transition-all'
        >
          <svg className='w-4 h-4 text-white/70' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 19l-7-7 7-7' />
          </svg>
        </button>

        <div className="relative flex-shrink-0">
          <img src={selectedUser.avatar || assets.profile_martin} alt=""
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-violet-500/30 bg-black/40 p-[1px]" />
          {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#12101f] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
        </div>

        <div className='flex flex-col flex-1 min-w-0'>
          <p className='text-white font-medium text-[14px] sm:text-[15px] truncate tracking-wide'>{selectedUser.fullName}</p>
          {isTyping ? (
            <span className='text-violet-400 font-medium text-[10px] sm:text-[11px] animate-pulse tracking-wide'>typing…</span>
          ) : statusLine ? (
            <span className={`text-[10px] sm:text-[11px] font-medium ${isOnline ? 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'text-white/40 font-light'}`}>{statusLine}</span>
          ) : null}
        </div>

        {/* Info button — visible on ALL screens */}
        <button
          onClick={() => setIsInfoOpen(prev => !prev)}
          className="flex-shrink-0 relative group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-400/60 active:scale-95 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          title="Contact info"
        >
          <svg className="w-4 h-4 text-violet-300 group-hover:text-violet-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* ── MESSAGES */}
      <div className='flex flex-col flex-1 min-h-0 overflow-y-auto p-4 md:p-6 gap-2 md:gap-3 scrollbar-hide'>
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user._id;
          const isSending = !!msg._sending;

          if (msg.deleted) {
            return (
              <div key={msg._id || index} className={`flex items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {isMe ? (
                  <img src={user?.avatar || assets.profile_martin} alt="" className='w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1 opacity-50 order-last' />
                ) : (
                  <img src={selectedUser.avatar || assets.profile_martin} alt="" className='w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1 opacity-50' />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-[13px] italic flex items-center gap-1.5
                    ${isMe ? 'rounded-br-[4px] bg-white/5 border border-white/5' : 'rounded-bl-[4px] bg-white/5 border border-white/5'}`}>
                    <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span className="text-white/30">This message was deleted</span>
                  </div>
                  <span className='text-white/30 text-[10px] mt-1 px-1'>{formatMessageTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg._id || index}
              onClick={() => setActiveMsgId(prev => prev === msg._id ? null : msg._id)}
              className={`relative flex items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'} cursor-pointer group/message`}>

              {isMe ? (
                <img src={user?.avatar || assets.profile_martin} alt=""
                  className='w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1 opacity-80 order-last' />
              ) : (
                <img src={selectedUser.avatar || assets.profile_martin} alt=""
                  className='w-6 h-6 rounded-full object-cover flex-shrink-0 mb-1 opacity-80' />
              )}

              <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Floating Options Menu (only for sender's messages) */}
                {isMe && !isSending && activeMsgId === msg._id && (
                  <div className="absolute bottom-full right-8 mb-2 z-50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden min-w-[120px] animate-in fade-in zoom-in duration-200 origin-bottom-right" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(20,10,40,0.95)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex flex-col text-left">
                      <button
                        className="px-4 py-2.5 text-[14px] font-medium text-red-400 hover:bg-white/5 hover:text-red-300 text-left w-full transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMsg(msg._id);
                          setActiveMsgId(null);
                        }}
                      >
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[280px] md:max-w-[400px]`}>
                  {msg.image ? (
                    <div className="relative group/img">
                      <img
                        src={msg.image}
                        alt="shared"
                        onClick={() => !isSending && setLightboxSrc(msg.image)}
                        className={`max-w-full rounded-xl border border-white/10 shadow-lg transition-all ${isSending ? 'opacity-60 blur-[1px]' : 'cursor-pointer hover:opacity-90 hover:scale-[1.01]'}`}
                        style={{ maxWidth: '220px' }}
                      />
                      {isSending && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                          <svg className="w-5 h-5 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        </div>
                      )}
                      {/* Download button — shown on hover, only when not sending */}
                      {!isSending && (
                        <a
                          href={msg.image}
                          download={`image_${Date.now()}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          title="Download image"
                          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-violet-600/80 hover:border-violet-400/50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className={`relative px-4 py-2.5 text-[14px] leading-relaxed break-words shadow-sm
                      ${isMe
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-br-[4px]'
                        : 'bg-white/10 backdrop-blur-md text-white/95 rounded-2xl rounded-bl-[4px] border border-white/5'
                      } ${isSending ? 'opacity-60' : ''}`}>
                      {msg.text}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-1 px-1 transition-opacity ${isMe ? 'opacity-70 group-hover/message:opacity-100' : 'opacity-40'}`}>
                    <span className='text-white/70 text-[10px] uppercase tracking-wider font-medium'>{formatMessageTime(msg.createdAt)}</span>
                    {isMe && <MessageTicks seen={!!msg.seen} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}
        <div ref={scrollEnd} className="h-2" />
      </div>

      {/* ── INPUT BAR */}
      <div
        className='flex-shrink-0 bg-[#0d0820]/95 border-t border-white/5 px-2 sm:px-4 py-2'
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {chatError && <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-[10px] backdrop-blur-md border border-red-500/30 whitespace-nowrap shadow-xl z-10">{chatError}</div>}

        {/* Image preview strip */}
        {imagePreview && (
          <div className="w-full max-w-4xl mx-auto mb-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="preview" className="h-16 sm:h-20 rounded-xl border border-violet-500/30 shadow-lg object-cover" />
              <button type="button" onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shadow-lg border-2 border-[#100a20] text-xs transition-colors">
                ✕
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className='relative flex items-center gap-2 w-full max-w-4xl mx-auto'>

          {/* ── DESKTOP ONLY: standalone image + emoji buttons ── */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <input type="file" id='image-desk' accept='image/png, image/jpeg, image/webp' hidden onChange={handleImageChange} />
              <label htmlFor="image-desk" className="group w-10 h-10 rounded-full flex items-center justify-center bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all cursor-pointer hover:shadow-[0_0_14px_rgba(139,92,246,0.3)]">
                <svg className="w-5 h-5 text-violet-400/70 group-hover:text-violet-300 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
            </div>

            {/* Emoji — desktop only */}
            <div className="relative" ref={emojiPickerRefDesk}>
              <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all text-xl
                  ${showEmoji ? 'bg-violet-500/30 border-violet-400/60' : 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-400/50'}`}
                title="Emoji"
              >😊</button>
              {showEmoji && (
                <div className="absolute bottom-14 left-0 rounded-2xl overflow-hidden border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3),0_10px_40px_rgba(0,0,0,0.6)] z-50"
                  style={{ background: 'rgba(45,30,80,0.97)', backdropFilter: 'blur(20px)', width: '300px' }}>
                  <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b border-white/5 overflow-x-auto scrollbar-hide">
                    {EMOJI_CATEGORIES.map((cat, i) => (
                      <button key={i} type="button" onClick={() => setEmojiTab(i)}
                        className={`flex-shrink-0 w-8 h-7 rounded-lg text-lg flex items-center justify-center transition-all ${emojiTab === i ? 'bg-violet-600/40' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                        title={cat.name}>{cat.label}</button>
                    ))}
                  </div>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{EMOJI_CATEGORIES[emojiTab].name}</span>
                  </div>
                  <div className="grid grid-cols-8 gap-0.5 px-2 pb-3 overflow-y-auto scrollbar-hide" style={{ maxHeight: '200px' }}>
                    {EMOJI_CATEGORIES[emojiTab].emojis.map((emoji, i) => (
                      <button key={i} type="button" onClick={() => setNewMessage(prev => prev + emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-violet-500/20 hover:scale-125 transition-all duration-100">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── NEON INPUT FIELD — contains media+emoji inside on mobile ── */}
          <div className='neon-input-wrap flex-1 flex items-center gap-1 px-2 sm:px-4 py-1 rounded-3xl transition-all duration-300'>

            {/* Mobile: image button inside input */}
            <div className="sm:hidden flex-shrink-0">
              <input type="file" id='image-mob' accept='image/png, image/jpeg, image/webp' hidden onChange={handleImageChange} />
              <label htmlFor="image-mob" className="w-8 h-8 rounded-full flex items-center justify-center text-violet-400/60 hover:text-violet-300 active:scale-95 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
            </div>

            {/* Mobile: emoji button inside input */}
            <div className="sm:hidden flex-shrink-0 relative" ref={emojiPickerRefMob}>
              <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-violet-400/60 hover:text-violet-300 active:scale-95 transition-all">
                😊
              </button>
              {showEmoji && (
                <div className="absolute bottom-12 left-0 rounded-2xl overflow-hidden border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3),0_10px_40px_rgba(0,0,0,0.6)] z-50"
                  style={{ background: 'rgba(45,30,80,0.97)', backdropFilter: 'blur(20px)', width: 'min(90vw, 300px)' }}>
                  <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b border-white/5 overflow-x-auto scrollbar-hide">
                    {EMOJI_CATEGORIES.map((cat, i) => (
                      <button key={i} type="button" onClick={() => setEmojiTab(i)}
                        className={`flex-shrink-0 w-8 h-7 rounded-lg text-lg flex items-center justify-center transition-all ${emojiTab === i ? 'bg-violet-600/40' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                        title={cat.name}>{cat.label}</button>
                    ))}
                  </div>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{EMOJI_CATEGORIES[emojiTab].name}</span>
                  </div>
                  <div className="grid grid-cols-8 gap-0.5 px-2 pb-3 overflow-y-auto scrollbar-hide" style={{ maxHeight: '180px' }}>
                    {EMOJI_CATEGORIES[emojiTab].emojis.map((emoji, i) => (
                      <button key={i} type="button" onClick={() => setNewMessage(prev => prev + emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-violet-500/20 hover:scale-125 transition-all duration-100">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input type="text" placeholder="Message…" value={newMessage} onChange={handleInputChange}
              className='flex-1 text-[14px] py-2.5 border-none outline-none bg-transparent text-white placeholder-white/25 font-light tracking-wide min-w-0' />
          </div>

          {/* Send button */}
          <button type="submit" disabled={!newMessage.trim() && !imagePreview}
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white disabled:opacity-40 disabled:bg-white/5 disabled:text-white/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 border border-transparent disabled:border-white/10">
            <svg className="w-[17px] h-[17px] translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

      {/* SCROLLBAR HIDING + NEON INPUT STYLES */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .neon-input-wrap {
          background: rgba(10, 5, 30, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.35);
          box-shadow:
            0 0 0 1px rgba(139, 92, 246, 0.08),
            0 0 12px rgba(139, 92, 246, 0.1),
            inset 0 1px 8px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
        }

        .neon-input-wrap:focus-within {
          border-color: rgba(167, 139, 250, 0.7);
          box-shadow:
            0 0 0 1px rgba(167, 139, 250, 0.15),
            0 0 20px rgba(139, 92, 246, 0.25),
            0 0 40px rgba(139, 92, 246, 0.1),
            inset 0 1px 8px rgba(0, 0, 0, 0.5);
          background: rgba(15, 8, 40, 0.75);
        }
      `}</style>

      {/* ── IMAGE LIGHTBOX */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="full" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors">✕</button>
        </div>
      )}
    </div>
  ) : (
    // On mobile, never show the welcome screen — sidebar handles this
    <div className='hidden md:flex flex-col items-center justify-center w-full h-full bg-white/[0.02] backdrop-blur-md relative overflow-hidden'>
      <div className="w-40 h-40 rounded-full bg-violet-600/10 blur-3xl absolute absolute-center" />
      <div className="flex flex-col items-center z-10 text-center px-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 sm:mb-6 shadow-xl rotation-animation">
          <img src={assets.chat} alt="EverLink" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_16px_rgba(139,92,246,0.8)]" />
        </div>
        <h2 className='text-2xl sm:text-3xl font-light tracking-tight text-white mb-2'>
          Welcome to <span className="font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">EverLink</span>
        </h2>
        <p className='text-[13px] sm:text-[15px] font-light text-white/40 max-w-xs sm:max-w-sm'>
          Select a conversation from the sidebar or search for a contact to start messaging.
        </p>
      </div>
    </div>
  )
}

export default ChatContainer

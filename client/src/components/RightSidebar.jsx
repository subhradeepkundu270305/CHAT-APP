import React, { useState } from 'react'
import assets from '../assets/assets'
import { useSocket } from '../context/SocketContext'
import api from '../lib/api'

const RightSidebar = ({ selectedUser, isInfoOpen, setIsInfoOpen, fetchContacts, setSelectedUser, messages = [] }) => {
  const { onlineUsers } = useSocket()
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [lightboxDownloadable, setLightboxDownloadable] = useState(false)

  const openLightbox = (src, downloadable = false) => {
    setLightboxSrc(src);
    setLightboxDownloadable(downloadable);
  };

  const closeLightbox = () => {
    setLightboxSrc(null);
    setLightboxDownloadable(false);
  };

  const handleDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `media_${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!selectedUser || !isInfoOpen) return null

  const isOnline = onlineUsers.includes(selectedUser._id)

  // Filter shared images (non-deleted only)
  const sharedImages = messages.filter(m => m.image && !m.deleted && !m._sending)

  const handleDeleteContact = async () => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/api/contacts/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsInfoOpen(false)
      setSelectedUser(null)
      fetchContacts()
    } catch (err) {
      console.error('Delete contact failed:', err)
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      {/* Mobile: full-screen overlay. Desktop: grid column */}
      <aside className="
        fixed inset-0 z-[60] flex flex-col
        md:relative md:inset-auto md:z-auto
        bg-[#0d0820] md:bg-black/40
        backdrop-blur-3xl border-l border-white/5
        text-white overflow-y-auto
        shadow-[-10px_0_30px_rgba(0,0,0,0.3)]
      ">

        {/* Close button & Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h3 className="text-sm font-medium tracking-wide text-white/90">Contact Info</h3>
          <button
            onClick={() => setIsInfoOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile section */}
        <div className="pt-8 pb-6 flex flex-col items-center text-center px-6 relative">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

          <div className="relative group cursor-pointer" onClick={() => openLightbox(selectedUser.avatar || assets.profile_martin, false)}>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500/40 to-fuchsia-500/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src={selectedUser.avatar || assets.profile_martin}
              alt="profile"
              className="relative w-28 h-28 rounded-full object-cover ring-[3px] ring-white/10 bg-black/40 z-10 shadow-xl group-hover:scale-[1.03] transition-transform duration-200"
            />
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <span className={`absolute bottom-1 right-2 w-4 h-4 rounded-full border-[3px] border-[#100a20] z-20 shadow-lg ${isOnline ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-500'}`} />
          </div>

          <div className="mt-5 flex flex-col items-center gap-1 justify-center">
            <h2 className="text-xl font-medium tracking-tight">{selectedUser.fullName}</h2>
            <span className={`text-xs font-medium tracking-wide ${isOnline ? 'text-green-400' : 'text-white/30'}`}>
              {isOnline ? 'Active Now' : 'Offline'}
            </span>
          </div>

          {selectedUser.bio && (
            <p className="mt-4 px-4 py-3 text-[13px] text-white/60 leading-relaxed bg-white/5 rounded-2xl border border-white/5 w-full text-center">
              {selectedUser.bio}
            </p>
          )}

          {selectedUser.phoneNumber && (
            <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 rounded-2xl px-5 py-3 border border-violet-500/20 w-full hover:border-violet-500/40 transition-colors">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="text-[14px] font-medium tracking-wide text-white/90">{selectedUser.phoneNumber}</span>
            </div>
          )}
        </div>

        <div className="h-[1px] bg-white/5 mx-6 my-2" />

        {/* ── SHARED MEDIA ─────────────────────────────────────────── */}
        <section className="px-6 py-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Shared Media</h3>
            <span className="text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)]">{sharedImages.length}</span>
          </div>

          {sharedImages.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 border-dashed">
              <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-[11px] text-white/30 tracking-wide">No media shared yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {sharedImages.map(msg => (
                <div key={msg._id} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all group/thumb">
                  <img
                    src={msg.image}
                    alt="media"
                    onClick={() => openLightbox(msg.image, true)}
                    className="w-full h-full object-cover group-hover/thumb:brightness-75 transition-all cursor-pointer"
                  />
                  {/* Download button on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(msg.image); }}
                    title="Download"
                    className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-violet-600/80 hover:border-violet-400/50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Delete contact */}
        <div className="px-6 pb-6 pt-2 mt-auto">
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-3.5 rounded-2xl text-[13px] font-medium flex items-center justify-center gap-2
                bg-red-500/10 border border-red-500/20
                hover:bg-red-500/20 hover:border-red-500/40
                text-red-400 hover:text-red-300 transition-all group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Remove Contact
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[13px] text-center text-red-100/80 leading-relaxed">
                Remove <strong className="text-white">{selectedUser.fullName}</strong> from contacts?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteContact}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-red-500 hover:bg-red-400 text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  {deleting ? '...' : 'Remove'}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <img
            src={lightboxSrc}
            alt="full"
            className={`object-contain shadow-2xl ${lightboxDownloadable ? 'max-w-[90vw] max-h-[80vh] rounded-2xl' : 'max-w-[60vw] max-h-[60vh] rounded-full ring-4 ring-white/10'}`}
            onClick={e => e.stopPropagation()}
          />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {lightboxDownloadable && (
              <button
                onClick={() => handleDownload(lightboxSrc)}
                title="Download image"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600/80 hover:bg-violet-500 border border-violet-400/30 text-white text-[12px] font-medium transition-all hover:shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
            <button
              onClick={closeLightbox}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-base transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default RightSidebar


import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';
import assets from '../assets/assets';

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Contacts State
  const [contacts, setContacts] = useState([]);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [chatError, setChatError] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Feature states
  const [unreadCounts, setUnreadCounts] = useState({});  // { userId: count }
  const [lastMessages, setLastMessages] = useState({});  // { userId: { text, image, createdAt } }
  const [isTyping, setIsTyping] = useState(false);       // is selected user typing?
  const [linkRequests, setLinkRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  const { socket } = useSocket();

  // ── Initial load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchContacts();
    fetchLinkRequests();
    fetchSentRequests();
  }, [token, navigate]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      markSeen(selectedUser._id);
      // Clear unread badge for this contact
      setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
    }
  }, [selectedUser]);

  // ── Socket event listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const currentUser = selectedUserRef.current;

      // Update last message preview for sidebar
      setLastMessages(prev => ({
        ...prev,
        [msg.senderId]: { text: msg.text, image: msg.image, createdAt: msg.createdAt }
      }));

      if (currentUser && msg.senderId === currentUser._id) {
        // Chat is open with this sender — append and mark seen immediately
        setMessages(prev => [...prev, msg]);
        markSeen(msg.senderId);
      } else {
        // Increment unread badge
        setUnreadCounts(prev => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1
        }));
      }
    };

    const handleMessagesSeen = ({ by }) => {
      // The other user opened our chat — mark all our sent messages to them as seen
      setMessages(prev =>
        prev.map(m => m.senderId === user._id && m.receiverId === by ? { ...m, seen: true } : m)
      );
    };

    const handleUserTyping = ({ from }) => {
      if (selectedUserRef.current?._id === from) setIsTyping(true);
    };
    const handleUserStopTyping = ({ from }) => {
      if (selectedUserRef.current?._id === from) setIsTyping(false);
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => {
        const updated = prev.map(m =>
          m._id === messageId ? { ...m, deleted: true, text: '', image: '' } : m
        );
        // If deleted msg is the last one, update sidebar preview
        if (updated.length > 0) {
          const last = updated[updated.length - 1];
          const otherId = last.senderId === user._id ? last.receiverId : last.senderId;
          if (last._id === messageId) {
            setLastMessages(lp => ({
              ...lp,
              [otherId]: { ...lp[otherId], deleted: true, text: '', image: '' }
            }));
          }
        }
        return updated;
      });
    };

    // Link request events
    const handleLinkRequest = (req) => {
      setLinkRequests(prev => [req, ...prev]);
    };
    const handleLinkRequestAccepted = () => {
      fetchContacts();
    };
    const handleLinkRequestDenied = (req) => {
      // Receiver side denied it. We could update UI, but for now just refresh sent requests
      fetchSentRequests();
    };
    const handleLinkRequestCancelled = (data) => {
      setLinkRequests(prev => prev.filter(r => r._id !== data.requestId));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('linkRequest', handleLinkRequest);
    socket.on('linkRequestAccepted', handleLinkRequestAccepted);
    socket.on('linkRequestDenied', handleLinkRequestDenied);
    socket.on('linkRequestCancelled', handleLinkRequestCancelled);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('linkRequest', handleLinkRequest);
      socket.off('linkRequestAccepted', handleLinkRequestAccepted);
      socket.off('linkRequestDenied', handleLinkRequestDenied);
      socket.off('linkRequestCancelled', handleLinkRequestCancelled);
    };
  }, [socket]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLinkRequests = async () => {
    try {
      const res = await api.get('/api/link-requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinkRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch link requests:', err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await api.get('/api/link-requests/sent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    }
  };

  const handleRespondLinkRequest = async (requestId, action) => {
    try {
      await api.put(`/api/link-requests/${requestId}/respond`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from local state
      setLinkRequests(prev => prev.filter(r => r._id !== requestId));
      if (action === 'accept') {
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to respond to link request:', err);
    }
  };

  const handleCancelLinkRequest = async (requestId) => {
    try {
      await api.delete(`/api/link-requests/${requestId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error('Failed to cancel link request:', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser?._id) return;
    setChatError("");
    try {
      const res = await api.get(`/api/messages/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);

      // Update last message preview from history
      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];
        const otherId = last.senderId === user._id ? last.receiverId : last.senderId;
        setLastMessages(prev => ({
          ...prev,
          [otherId === user._id ? last.senderId : otherId]:
            { text: last.text, image: last.image, createdAt: last.createdAt }
        }));
      }
    } catch (err) {
      console.error(err);
      setChatError("Failed to load messages.");
    }
  };

  const markSeen = async (senderId) => {
    try {
      await api.put(`/api/messages/seen/${senderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { /* silent fail */ }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !selectedUser?._id || isSending) return;
    if (socket) socket.emit('stopTyping', { to: selectedUser._id });

    const textToSend = newMessage;
    const imageToSend = imagePreview;

    // ── Optimistic update: show message immediately ──────────────────
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      _sending: true,
      senderId: user._id,
      receiverId: selectedUser._id,
      text: textToSend,
      image: imageToSend,  // local base64 preview
      seen: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");
    setImagePreview(null);
    setChatError("");

    try {
      setIsSending(true);
      const res = await api.post(`/api/messages/send/${selectedUser._id}`, {
        text: textToSend,
        image: imageToSend
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Replace the temp message with the real one from server
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
      setLastMessages(prev => ({
        ...prev,
        [selectedUser._id]: { text: textToSend, image: res.data.image, createdAt: res.data.createdAt }
      }));
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove the temp message on failure
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setChatError(error.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically update locally (socket event will sync the other side)
      setMessages(prev => {
        const updated = prev.map(m =>
          m._id === messageId ? { ...m, deleted: true, text: '', image: '' } : m
        );
        // If deleted msg is the last one, update the sidebar preview for this contact
        if (updated.length > 0) {
          const last = updated[updated.length - 1];
          if (last._id === messageId) {
            setLastMessages(lp => ({
              ...lp,
              [selectedUser._id]: { ...lp[selectedUser._id], deleted: true, text: '', image: '' }
            }));
          }
        }
        return updated;
      });
    } catch (error) {
      console.error("Delete message failed", error);
    }
  };

  return (
    <div
      className="w-full h-[100dvh] relative overflow-hidden"
      style={{ backgroundImage: `url(${assets.bg_chat})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0514]/80 via-[#100a20]/80 to-[#0a0514]/90 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto sm:px-4 sm:py-4 md:px-10 md:py-8 lg:p-12">
        <div
          className={`
            h-full relative overflow-hidden sm:rounded-3xl
            bg-white/[0.02] border-0 sm:border border-violet-500/25
            backdrop-blur-sm
            grid grid-cols-1
            ${selectedUser
              ? isInfoOpen
                ? 'md:grid-cols-[260px_1fr_260px] lg:grid-cols-[320px_1fr_300px]'
                : 'md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]'
              : 'md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]'}
          `}
          style={{
            boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.15),
              0 0 30px rgba(139, 92, 246, 0.2),
              0 0 70px rgba(192, 86, 246, 0.1),
              0 20px 60px rgba(0, 0, 0, 0.6),
              inset 0 0 60px rgba(139, 92, 246, 0.03)
            `
          }}
        >
          {/* LEFT SIDEBAR */}
          <Sidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            contacts={contacts}
            fetchContacts={fetchContacts}
            user={user}
            unreadCounts={unreadCounts}
            lastMessages={lastMessages}
            linkRequests={linkRequests}
            sentRequests={sentRequests}
            onRespondRequest={handleRespondLinkRequest}
            onCancelRequest={handleCancelLinkRequest}
            onLinkRequestSent={fetchSentRequests}
          />

          {/* CHAT */}
          <ChatContainer
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setIsInfoOpen={setIsInfoOpen}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            handleSendMessage={handleSendMessage}
            chatError={chatError}
            user={user}
            isTyping={isTyping}
            socket={socket}
            onDeleteMessage={handleDeleteMessage}
          />

          {/* RIGHT SIDEBAR (INFO PANEL) — only rendered when open */}
          {isInfoOpen && (
            <RightSidebar
              selectedUser={selectedUser}
              isInfoOpen={isInfoOpen}
              setIsInfoOpen={setIsInfoOpen}
              fetchContacts={fetchContacts}
              setSelectedUser={setSelectedUser}
              messages={messages}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useRef, useEffect } from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Search,
  Edit,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  Calendar,
  Smile,
  Send,
  CheckCircle2,
  BellOff,
  Ban
} from 'lucide-react';

const MessagesPage = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    startChatWithUser,
    setSelectedVenueId,
    setActiveTab,
    setReservationVenue,
    setIsReservationModalOpen
  } = useStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newUserIdInput, setNewUserIdInput] = useState('');
  const [newUserNameInput, setNewUserNameInput] = useState('');
  const messagesEndRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(activeChat.id, messageInput);
    setMessageInput('');
  };

  const handleStartNewChat = (e) => {
    e?.preventDefault();
    if (!newUserIdInput.trim()) return;
    startChatWithUser({
      id: newUserIdInput.trim(),
      name: newUserNameInput.trim() || newUserIdInput.trim()
    });
    setNewUserIdInput('');
    setNewUserNameInput('');
    setShowNewChatModal(false);
  };

  const handleReserve = () => {
    setReservationVenue({
      id: activeChat.id,
      name: activeChat.name,
      category: activeChat.category || 'Restaurant'
    });
    setIsReservationModalOpen(true);
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-screen flex bg-white overflow-hidden select-none">
      
      {/* 1. Left Column: Conversations List */}
      <div className="w-80 border-r border-zinc-200 flex flex-col justify-between h-full bg-white flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-zinc-900">Messages</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              title="Start chat with User ID"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>+ New Chat</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 focus:bg-white text-xs text-zinc-900 pl-9 pr-3 py-2 rounded-xl border border-transparent focus:border-zinc-300 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Chats Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
          {filteredChats.map((chat) => {
            const isActive = chat.id === activeChat.id;
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isActive ? 'bg-zinc-100/80' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-zinc-200"
                    />
                    {chat.unread && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#FF5A5F] rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-xs text-zinc-900 truncate">{chat.name}</h4>
                      {chat.verified && (
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 text-white flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{chat.lastMessage}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium flex-shrink-0 ml-2">
                  {chat.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Center Column: Active Conversation Chat Thread */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white">
        
        {/* Chat Thread Header */}
        <div className="p-4 border-b border-zinc-200/80 flex items-center justify-between bg-white/90 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-zinc-900">{activeChat.name}</h3>
                {activeChat.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                )}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600">
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Bubbles Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50">
          <div className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider my-2">
            Today, 6:04 PM
          </div>

          {activeChat.messages.map((m) => {
            const isMe = m.sender === 'me';
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200 mb-1"
                  />
                )}

                <div className="space-y-1.5 max-w-[70%]">
                  {/* Text Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#FF5A5F] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Optional Rich Card (e.g. Tonight's special) */}
                  {m.card && (
                    <div className="rounded-2xl overflow-hidden bg-white border border-zinc-200/80 shadow-md">
                      <img src={m.card.image} alt={m.card.title} className="w-full h-40 object-cover" />
                      <div className="p-3">
                        <h5 className="font-bold text-xs text-zinc-900">{m.card.title}</h5>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* AI Agent Quick Action Chips */}
        {activeChat.id === 'ai_assistant' && (
          <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider shrink-0">Agent Actions:</span>
            <button
              type="button"
              onClick={() => sendMessage('ai_assistant', 'book table at Copper Kettle Bistro')}
              className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1 rounded-full shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              📅 Book Table
            </button>
            <button
              type="button"
              onClick={() => sendMessage('ai_assistant', 'create post about delicious dinner')}
              className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1 rounded-full shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              ✍️ Create Post
            </button>
            <button
              type="button"
              onClick={() => sendMessage('ai_assistant', 'search hotels near me')}
              className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1 rounded-full shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              🗺️ Search Map
            </button>
            <button
              type="button"
              onClick={() => sendMessage('ai_assistant', 'info on Aura Boutique Hotel')}
              className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1 rounded-full shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              ℹ️ Venue Info
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 bg-white">
          <div className="flex items-center gap-3 bg-zinc-100 px-4 py-2.5 rounded-full border border-zinc-200/60 focus-within:border-zinc-400 focus-within:bg-white transition-all">
            <button type="button" className="text-zinc-400 hover:text-zinc-700">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" onClick={handleReserve} className="text-zinc-400 hover:text-[#FF5A5F]">
              <Calendar className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={`Message ${activeChat.name}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 text-xs text-zinc-900 placeholder-zinc-400 bg-transparent focus:outline-none"
            />

            <button type="button" className="text-zinc-400 hover:text-zinc-700">
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="submit"
              disabled={!messageInput.trim()}
              className={`text-xs font-bold transition-colors ${
                messageInput.trim() ? 'text-[#FF5A5F] hover:text-[#E0484D] cursor-pointer' : 'text-zinc-300'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* 3. Right Column: Venue Profile Summary & Shared Media */}
      <div className="w-72 border-l border-zinc-200 p-6 hidden lg:flex flex-col justify-between h-full bg-white flex-shrink-0">
        <div>
          {/* Avatar & Details */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-zinc-100 mb-3"
            />
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-zinc-900">{activeChat.name}</h4>
              {activeChat.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {activeChat.category || 'Restaurant'} · {activeChat.distance || '1.2 km away'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 w-full">
              <button
                onClick={() => {
                  setSelectedVenueId(activeChat.id);
                  setActiveTab('venue_profile');
                }}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={handleReserve}
                className="flex-1 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
              >
                Reserve
              </button>
            </div>
          </div>

          {/* Shared Media */}
          <div>
            <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
              Shared Media
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <img src={IMAGES.ramen} alt="Shared 1" className="aspect-square rounded-lg object-cover" />
              <img src={IMAGES.ribs} alt="Shared 2" className="aspect-square rounded-lg object-cover" />
              <img src={IMAGES.interior} alt="Shared 3" className="aspect-square rounded-lg object-cover" />
            </div>
          </div>
        </div>

        {/* Bottom Options */}
        <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs font-semibold text-zinc-600">
          <button className="w-full flex items-center gap-2 p-2 hover:bg-zinc-50 rounded-xl transition-colors">
            <BellOff className="w-4 h-4 text-zinc-400" />
            <span>Mute notifications</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 hover:bg-zinc-50 rounded-xl text-rose-600 transition-colors">
            <Ban className="w-4 h-4 text-rose-500" />
            <span>Block</span>
          </button>
        </div>
      </div>

      {/* 4. New Chat Modal (User ID / Handle Lookup) */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-950">Direct Message</h3>
                <p className="text-xs text-zinc-400 font-bold">Start chat with any User ID or Handle</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-zinc-400 hover:text-zinc-900 p-1 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">User ID / Handle / Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @mahir_hasan, diner@geodine.com, user_992"
                  value={newUserIdInput}
                  onChange={(e) => setNewUserIdInput(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#FF5A5F] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mahir Hasan"
                  value={newUserNameInput}
                  onChange={(e) => setNewUserNameInput(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#FF5A5F] transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md shadow-[#FF5A5F]/20 transition-all cursor-pointer"
                >
                  Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MessagesPage;

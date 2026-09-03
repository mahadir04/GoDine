import React, { useState, useRef, useEffect, useCallback } from 'react';
import useStore from '../../store/store';
import axios from 'axios';
import { Send, Sparkles, Compass, MessageSquare, Users, ArrowLeft } from 'lucide-react';

const SUGGESTIONS = [
  "Find a motel in Banani",
  "Where is the best mutton kacchi?",
  "Recommend a quiet cafe in Tejgaon",
  "Is there a resthouse in Gulshan?"
];

const ChatPage = () => {
  const { token, user } = useStore();
  const [mode, setMode] = useState<'ai' | 'chat'>('ai');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your GoDine AI Concierge. I analyze review aspects and geospatial distances to recommend the best spots. Ask me anything, e.g. 'find a motel in Banani'."
    }
  ]);
  const [input, setInput] = useState('');
  const [targetRecipient, setTargetRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [recipients, setRecipients] = useState([]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch recipients for chat (users of opposite role)
  useEffect(() => {
    const loadRecipients = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:8000/chat/recipients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecipients(res.data.recipients);
      } catch (err) {
        console.error("Error loading recipients:", err);
      }
    };
    loadRecipients();
  }, [token]);

  // Load chat history when recipient changes
  useEffect(() => {
    if (!targetRecipient) return;
    const loadHistory = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`http://localhost:8000/chat/history/${targetRecipient}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages.map(m => ({
          role: m.sender_id === user.id ? 'user' : 'assistant',
          content: m.content
        })));
        setTargetRecipient(res.data.recipient_id || targetRecipient);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };
    loadHistory();
  }, [targetRecipient, user?.id]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // User-to-user chat
    if (mode === 'chat' && targetRecipient) {
      const text = textToSend || input;
      if (!text.trim()) return;

      const msgText = text.trim();
      setMessages(prev => [...prev, { role: 'user', content: msgText }]);
      setInput('');

      try {
        const response = await axios.post('http://localhost:8000/chat/', {
          message: `/msg ${targetRecipient} ${msgText}`,
          history: messages.slice(-10)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const botMsg = { role: 'assistant', content: response.data.response };
        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        console.error("Error chatting: ", err);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Failed to connect to the chat API. Please ensure the backend server is running on port 8000."
          }]);
        }, 800);
      }
      setLoading(false);
      return;
    }

    // AI assistant mode
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/chat/', {
        message: text,
        history: messages.slice(-10)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const botMsg = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Error chatting: ", err);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Failed to connect to the recommendation API. Please ensure the backend server is running on port 8000."
        }]);
      }, 800);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Render message component
  const renderMessage = (msg, idx) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={idx}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed border ${
            isUser
              ? 'bg-blue-600/10 border-blue-500/30 text-zinc-100 rounded-br-none'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 rounded-bl-none'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold font-mono text-zinc-500 uppercase">
            <MessageSquare className="h-3 w-3" />
            <span>{isUser ? 'You' : 'AI Assistant'}</span>
          </div>
          <div>
            {msg.content.split('\n').map((line, i) => {
              const parts = line.split('**');
              return (
                <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                  {parts.map((part, index) => 
                    index % 2 === 1 ? <strong key={index} className="font-extrabold text-white">{part}</strong> : part
                  )}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Calculate if we can send user-to-user message
  canSendUserChat = () => {
    return mode === 'chat' && !!targetRecipient && !!token;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col justify-between bg-zinc-950">
      
      {/* Top Title Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          {mode === 'ai' ? (
            <>
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">AI Gastronomy Assistant</h2>
            </>
          ) : (
            <>
              <Users className="h-5 w-5 text-green-500" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">User Chat</h2>
            </>
          )}
        </div>
        <button
          onClick={() => setMode('ai')}
          className="text-[10px] text-zinc-500 font-mono hover:text-white transition-colors"
          title="Switch to AI Assistant"
        >
          AI
        </button>
        <button
          onClick={() => setMode('chat')}
          className="text-[10px] text-zinc-500 font-mono hover:text-white transition-colors"
          title="Switch to User Chat"
        >
          Chat
        </button>
      </div>

      {/* Mode indicator */}
      <div className="flex items-center gap-2 mb-2 text-[8px] text-zinc-400">
        {mode === 'ai' && <span>AI Recommendations</span>}
        {mode === 'chat' && <span>User Messages</span>}
      </div>

      {/* Message History List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
        {messages.map((msg, idx) => renderMessage(msg, idx))}

        {/* Loader Pulsing Bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none p-4 max-w-sm text-xs text-zinc-500 font-mono flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Scanning geospatial index aspects...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom suggestions & Input */}
      <div className="space-y-4">

        {/* Mode-specific instructions */}
        {mode === 'ai' && (
          <p className="text-[10px] text-zinc-500 italic">
            Type a request like: "find a budget hotel in Gulshan"
          </p>
        )}
        {mode === 'chat' && (
          <p className="text-[10px] text-zinc-500 italic">
            Type /msg username your message to chat with another user
          </p>
        )}

        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Text Input Row */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask me: 'find a budget hotel in Gulshan' or type /msg username your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-blue-500/80 transition-all shadow-lg"
          />
          <button
            onClick={() => handleSendMessage()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* User recipients selector (when in chat mode) */}
        {mode === 'chat' && recipients.length > 0 && (
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <h3 className="text-[10px] font-bold text-zinc-400 mb-2">Recent Users</h3>
            <div className="flex flex-col gap-1">
              {recipients.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setTargetRecipient(rec.id);
                    loadChatHistory(rec.id);
                  }}
                  className="text-[9px] text-zinc-300 hover:text-white bg-zinc-900 rounded px-2 py-1 transition-colors"
                >
                  {rec.full_name || rec.email}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default ChatPage;
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles } from 'lucide-react';
import axios from 'axios';

const FloatingRobot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI Assistant. How can I help you prepare for your interview today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, { messages: updatedMessages });
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'ai' }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm currently offline or having connection issues. Please try again later!", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-36 right-10 z-[60] w-80 md:w-96 h-[500px] bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-800/80 border-b border-indigo-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                  <Sparkles size={16} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-indigo-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1 items-center h-10 shadow-sm">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-slate-800/50 border-t border-slate-700/50">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-full py-2.5 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-colors shadow-md"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb */}
      <motion.div
        className="fixed bottom-10 right-10 z-50 pointer-events-none cursor-pointer"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative group pointer-events-auto" onClick={() => setIsOpen(!isOpen)}>
          {/* Outer Aura */}
          <motion.div 
            className="absolute -inset-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-30 blur-xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Core Body */}
          <div className="w-20 h-20 bg-slate-900/90 backdrop-blur-md rounded-full border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center relative z-10 overflow-hidden transition-transform hover:scale-105">
            
            {/* Rotating Ring */}
            <motion.div 
              className="absolute inset-1 rounded-full border-t-2 border-indigo-400 opacity-50"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-b-2 border-purple-400 opacity-50"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            {/* Eye / Core */}
            <div className="relative w-8 h-8 rounded-full bg-slate-800 border-2 border-indigo-500/80 flex items-center justify-center overflow-hidden">
              {/* Iris */}
              <motion.div 
                className={`w-4 h-4 rounded-full shadow-[0_0_15px_#22d3ee] transition-colors duration-500 ${isOpen ? 'bg-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-cyan-400'}`}
                animate={{ 
                  scale: isOpen ? [1, 1.1, 1] : [1, 1.3, 1], 
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Highlight Reflection */}
            <div className="absolute top-1 left-2 w-6 h-2 bg-white/20 rounded-full rotate-45 blur-[1px]"></div>
          </div>

          {/* Tooltip on Hover */}
          {!isOpen && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none">
              I'm here to help!
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default FloatingRobot;

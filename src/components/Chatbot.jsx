import React, { useState, useEffect, useRef } from 'react'; 
import { ArrowLeft, Send, Bot, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getBotResponse } from '../utils/chatLogic';

const Chatbot = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I am your Campus Assistant. I can help you with Attendance, Mess, PYQs, Jobs, and more! What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsTyping(true);

    const response = await getBotResponse(userText);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold mb-4 active:scale-95 transition-transform">
          <ArrowLeft size={20} /> Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Campus Bot</h2>
              <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> AI Online
              </span>
            </div>
          </div>
          <Sparkles className="text-indigo-100" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`p-4 rounded-[1.5rem] text-sm font-medium shadow-sm max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
              {msg.role === 'bot' && idx === messages.length - 1 && idx !== 0 && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-50 items-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Helpful?</span>
                  <button onClick={() => alert("Thanks!")} className="text-slate-300 hover:text-emerald-500 transition-colors"><ThumbsUp size={14}/></button>
                  <button onClick={() => alert("Noted!")} className="text-slate-300 hover:text-red-400 transition-colors"><ThumbsDown size={14}/></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask about Attendance, PYQs, Mess..." 
            className="flex-1 p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
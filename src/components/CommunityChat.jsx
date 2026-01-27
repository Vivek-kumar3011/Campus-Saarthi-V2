import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, ArrowLeft, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const CommunityChat = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const scrollRef = useRef();

  // 1. Real-time Message Listener (No Storage involved)
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Firestore Error:", error);
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Image Selection (Using the same logic as your BuySell.jsx)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; // Small size for fast chat
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to Base64 String (Just like your BuySell item photos)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          setPreviewImage(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Send Function (Saves string to Firestore 'messages' collection)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !previewImage) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName || "Scholar",
        text: newMessage.trim(),
        mediaUrl: previewImage || null, // Saving image data as a string
        mediaType: previewImage ? 'image' : null,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      setPreviewImage(null);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9]">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Campus Chat</h2>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-400 mb-1 px-2">{msg.senderName}</span>
            <div className={`max-w-[80%] rounded-2xl overflow-hidden shadow-sm ${
              msg.senderId === auth.currentUser?.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border'
            }`}>
              {msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="shared" className="w-full max-h-60 object-cover" />
              )}
              {msg.text && <p className="p-3 text-sm">{msg.text}</p>}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {previewImage && (
          <div className="relative inline-block mb-3">
            <img src={previewImage} className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500" />
            <button onClick={() => setPreviewImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
              <X size={12} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <label className="p-3 bg-slate-100 text-slate-500 rounded-2xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all">
            <ImageIcon size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
          </label>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-slate-100 rounded-2xl outline-none text-sm"
          />
          <button type="submit" disabled={isSending} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityChat;
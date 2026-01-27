import React, { useState, useEffect } from 'react';
import { ArrowLeft, Megaphone, Trash2, Plus, Calendar, MapPin, ShieldCheck, X, Camera } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const Notices = ({ onBack }) => {
  const [notices, setNotices] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', venue: '', date: '', poster: ''
  });

  const ADMIN_PASSWORD = "campusadmin123";

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(list);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          setFormData({ ...formData, poster: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    try {
      // 1. Write to 'notices' collection for the main list
      await addDoc(collection(db, "notices"), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Write to 'notifications' collection to trigger the Bell Icon
      // Dashboard.jsx listens to this specific collection
      await addDoc(collection(db, "notifications"), {
        title: "New Official Notice 📢",
        desc: formData.name, // e.g., "Holiday Announcement"
        time: serverTimestamp(),
        unread: true // This is the key for the red dot count
      });

      setFormData({ name: '', description: '', venue: '', date: '', poster: '' });
      setShowAddForm(false);
      fetchNotices();
      alert("Notice Posted Successfully!");
    } catch (error) { 
      console.error(error);
      alert("Error: " + error.message); 
    }
  };

  const removeNotice = async (id) => {
    if (window.confirm("Delete this notice?")) {
      await deleteDoc(doc(db, "notices", id));
      fetchNotices();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-4">
          <ArrowLeft size={20} /> Dashboard
        </button>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg">
              <Megaphone size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Notices</h2>
          </div>
          <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2 rounded-xl ${isAdmin ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldCheck size={20} />
          </button>
        </div>

        {isAdmin && !showAddForm && (
          <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
            <input type="password" placeholder="Admin Password" 
              className="w-full p-3 rounded-xl outline-none ring-1 ring-green-200"
              onChange={(e) => setPassword(e.target.value)} />
            {password === ADMIN_PASSWORD && (
              <button onClick={() => setShowAddForm(true)} className="w-full mt-3 bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Plus size={18} /> New Official Notice
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6">
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <form onSubmit={handleAddNotice} className="bg-white w-full max-w-md p-8 rounded-[3rem] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-slate-800 text-xl">New Notice</h3>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <input type="text" placeholder="Notice Title *" className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 outline-none font-bold" required
                onChange={e => setFormData({...formData, name: e.target.value})} />
              <textarea placeholder="Description..." className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 h-28 outline-none"
                onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Venue" className="p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 outline-none text-sm"
                  onChange={e => setFormData({...formData, venue: e.target.value})} />
                <input type="date" className="p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 outline-none text-sm"
                  onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>

              <label className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 cursor-pointer">
                <Camera size={20} />
                <span className="text-xs font-bold">{formData.poster ? "Poster Added ✅" : "Add Poster"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>

              <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black shadow-lg">Post Notice</button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400">Loading notices...</div>
          ) : notices.length > 0 ? notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative border-l-4 border-l-orange-500">
              {notice.poster && (
                <img src={notice.poster} alt="Poster" className="w-full h-48 object-cover border-b border-slate-50" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{notice.name}</h3>
                  {isAdmin && password === ADMIN_PASSWORD && (
                    <button onClick={() => removeNotice(notice.id)} className="text-slate-200 hover:text-red-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{notice.description}</p>
                <div className="flex flex-wrap gap-3">
                  {notice.date && <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black bg-slate-50 px-3 py-2 rounded-xl uppercase tracking-wider"><Calendar size={14} className="text-blue-500" /> {notice.date}</div>}
                  {notice.venue && <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black bg-slate-50 px-3 py-2 rounded-xl uppercase tracking-wider"><MapPin size={14} className="text-orange-500" /> {notice.venue}</div>}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">No official notices yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notices;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, ShieldCheck, GraduationCap, FileText, X, Loader2 } from 'lucide-react';
// Firebase Imports
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

const Resources = ({ onBack }) => {
  const [extraResources, setExtraResources] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', url: '', category: 'Notes' });
  const ADMIN_PASSWORD = "campusadmin123";

  // REAL-TIME SYNC LOGIC
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "resources"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExtraResources(list);
      setLoading(false);
    }, (error) => {
      console.error("Resource Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // ADD RESOURCE WITH NOTIFICATION
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return alert("All fields are required!");
    
    if (!formData.url.startsWith('http')) {
      return alert("Please enter a valid URL (http:// or https://)");
    }

    try {
      // 1. SAVE TO 'resources' COLLECTION
      await addDoc(collection(db, "resources"), {
        ...formData,
        createdAt: serverTimestamp() 
      });

      // 2. TRIGGER THE BELL ICON (notifications collection)
      await addDoc(collection(db, "notifications"), {
        title: "New Study Resource 📚",
        desc: `${formData.category}: ${formData.title}`,
        time: serverTimestamp(),
        unread: true
      });

      setFormData({ title: '', url: '', category: 'Notes' });
      setShowAddForm(false);
      alert("Resource added and students notified! ☁️");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const removeResource = async (id) => {
    if (window.confirm("Delete this resource?")) {
      try {
        await deleteDoc(doc(db, "resources", id));
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
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
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resources</h2>
          </div>
          <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2 rounded-xl transition-all ${isAdmin ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldCheck size={20} />
          </button>
        </div>

        {isAdmin && !showAddForm && (
          <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 animate-in slide-in-from-top duration-300">
            <input type="password" placeholder="Admin Password" 
              className="w-full p-3 rounded-xl border-none ring-1 ring-green-200 outline-none text-sm focus:ring-2 focus:ring-green-500"
              onChange={(e) => setPassword(e.target.value)} />
            {password === ADMIN_PASSWORD && (
              <button onClick={() => setShowAddForm(true)} className="w-full mt-3 bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Plus size={18} /> Add New Link
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6">
        {/* Featured Resources */}
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Featured</h3>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <a href="https://drive.google.com/drive/u/0/folders/1X3AEV93QzFJU531xGhjzTGuRuUYpjXcd" target="_blank" rel="noreferrer"
            className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={20}/></div>
              <div>
                <h4 className="font-bold text-slate-800">PYQ Papers</h4>
                <p className="text-xs text-slate-500">Previous Year Questions</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-200" />
          </a>

          <a href="https://gpa-calculator-gold.vercel.app/" target="_blank" rel="noreferrer"
            className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><GraduationCap size={20}/></div>
              <div>
                <h4 className="font-bold text-slate-800">GPA Calculator</h4>
                <p className="text-xs text-slate-500">Calculate your SGPA/CGPA</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-200" />
          </a>
        </div>

        {/* Dynamic Admin-added Resources */}
        {(extraResources.length > 0 || loading) && (
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Campus Contribution</h3>
        )}
        
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="animate-spin text-indigo-600 mb-2" size={28} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Syncing Cloud...</p>
            </div>
          ) : extraResources.map((res) => (
            <div key={res.id} className="group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
              <a href={res.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95">
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase whitespace-nowrap">{res.category}</div>
                <span className="font-bold text-slate-700 flex-1 truncate">{res.title}</span>
                <ExternalLink size={16} className="text-slate-200" />
              </a>
              {isAdmin && password === ADMIN_PASSWORD && (
                <button onClick={() => removeResource(res.id)} className="absolute -right-1 -top-1 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-10 transition-transform active:scale-90">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {!loading && extraResources.length === 0 && (
            <div className="text-center py-10 bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 text-sm font-bold">No extra links added yet.</p>
            </div>
          )}
        </div>

        {/* Add Form Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <form onSubmit={handleAdd} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl space-y-4 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-800">Add Resource</h3>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              </div>
              <input type="text" placeholder="Title (e.g. OS Notes)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold"
                onChange={e => setFormData({...formData, title: e.target.value})} required />
              <input type="url" placeholder="Paste Link (https://...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500"
                onChange={e => setFormData({...formData, url: e.target.value})} required />
              <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600"
                onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Notes</option>
                <option>E-Books</option>
                <option>Video Lectures</option>
                <option>Others</option>
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-lg shadow-indigo-100 mt-2 active:scale-95 transition-transform">Save to Campus Cloud</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
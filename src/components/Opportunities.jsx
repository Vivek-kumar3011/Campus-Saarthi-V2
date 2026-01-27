import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, ExternalLink, Plus, Trash2, ShieldCheck, Mail, Tag, X, Loader2 } from 'lucide-react';
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

const Opportunities = ({ onBack }) => {
  const [opps, setOpps] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'Internship', link: '', contact: ''
  });

  const ADMIN_PASSWORD = "campusadmin123";

  // REAL-TIME SYNC LOGIC
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "opportunities"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOpps(list);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // ADD OPPORTUNITY WITH NOTIFICATION TRIGGER
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Opportunity name is required!");
    
    try {
      // 1. SAVE TO 'opportunities' COLLECTION
      await addDoc(collection(db, "opportunities"), {
        ...formData,
        createdAt: serverTimestamp() 
      });

      // 2. TRIGGER THE BELL ICON (notifications collection)
      await addDoc(collection(db, "notifications"), {
        title: `New ${formData.category} Alert! 🚀`,
        desc: formData.name,
        time: serverTimestamp(),
        unread: true
      });

      setFormData({ name: '', description: '', category: 'Internship', link: '', contact: '' });
      setShowAddForm(false);
      alert("Posted to Career Board & Notifications sent! 🚀");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const removeOpp = async (id) => {
    if (window.confirm("Delete this opportunity?")) {
      try {
        await deleteDoc(doc(db, "opportunities", id));
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Internship: 'bg-blue-100 text-blue-700',
      Placement: 'bg-green-100 text-green-700',
      Scholarship: 'bg-purple-100 text-purple-700',
      'Open Source': 'bg-orange-100 text-orange-700',
      Quiz: 'bg-pink-100 text-pink-700',
      Other: 'bg-slate-100 text-slate-700'
    };
    return colors[cat] || colors.Other;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-4">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <Briefcase size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Career Portal</h2>
          </div>
          <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2 rounded-xl transition-all ${isAdmin ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldCheck size={20} />
          </button>
        </div>

        {isAdmin && !showAddForm && (
          <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 animate-in slide-in-from-top-2">
            <input type="password" placeholder="Admin Password" 
              className="w-full p-3 rounded-xl border-none ring-1 ring-green-200 outline-none text-sm focus:ring-2 focus:ring-green-500"
              onChange={(e) => setPassword(e.target.value)} />
            {password === ADMIN_PASSWORD && (
              <button onClick={() => setShowAddForm(true)} className="w-full mt-3 bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Plus size={18} /> Post New Opportunity
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6">
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <form onSubmit={handleAdd} className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-slate-800">New Opportunity</h3>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              </div>
              <input type="text" placeholder="Opportunity Title (e.g. Google Internship) *" className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 font-bold focus:ring-2 focus:ring-emerald-500"
                onChange={e => setFormData({...formData, name: e.target.value})} required />
              <textarea placeholder="Job description or requirements..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 h-24 focus:ring-2 focus:ring-emerald-500"
                onChange={e => setFormData({...formData, description: e.target.value})} />
              <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 font-bold text-slate-600"
                onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Internship</option>
                <option>Placement</option>
                <option>Open Source</option>
                <option>Scholarship</option>
                <option>Quiz</option>
                <option>Other</option>
              </select>
              <input type="url" placeholder="Apply Link (https://...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500"
                onChange={e => setFormData({...formData, link: e.target.value})} />
              <input type="text" placeholder="Contact Email/Info (Optional)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500"
                onChange={e => setFormData({...formData, contact: e.target.value})} />
              <button type="submit" className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black shadow-lg shadow-emerald-100 active:scale-95 transition-transform">Post to Board</button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20">
               <Loader2 className="animate-spin text-emerald-600 mb-2" size={30} />
               <p className="text-slate-400 font-bold">Scanning Career Board...</p>
            </div>
          ) : opps.length > 0 ? opps.map((opp) => (
            <div key={opp.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryColor(opp.category)}`}>
                  {opp.category}
                </span>
                {isAdmin && password === ADMIN_PASSWORD && (
                  <button onClick={() => removeOpp(opp.id)} className="text-slate-200 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-black text-slate-800 mb-2">{opp.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-4 whitespace-pre-wrap">{opp.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50">
                {opp.link && (
                  <a href={opp.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors active:scale-95">
                    Apply Now <ExternalLink size={14} />
                  </a>
                )}
                {opp.contact && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold px-2">
                    <Mail size={14} className="text-emerald-500" /> {opp.contact}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="inline-block p-6 bg-slate-50 rounded-full mb-4">
                <Tag size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">No opportunities listed right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
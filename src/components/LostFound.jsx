import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Plus, Trash2, Phone, Search, X, Camera } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const LostFound = ({ onBack }) => {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', contact: '', description: '', status: 'Lost', image: ''
  });

  const fetchFirebaseItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "lostfound"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString() || "Just now"
      }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFirebaseItems();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setFormData({ ...formData, image: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.contact) return alert("Description and Contact are required!");
    
    try {
      // 1. SAVE TO 'lostfound' COLLECTION
      await addDoc(collection(db, "lostfound"), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. TRIGGER THE BELL ICON (notifications collection)
      await addDoc(collection(db, "notifications"), {
        title: `Item ${formData.status} 🔍`,
        desc: formData.description,
        time: serverTimestamp(),
        unread: true
      });
      
      setFormData({ name: '', contact: '', description: '', status: 'Lost', image: '' });
      setShowAddForm(false);
      fetchFirebaseItems();
      alert("Success! The campus has been notified.");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Cloud Save Error: " + error.message);
    }
  };

  const deleteItem = async (id, contactInput) => {
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete.contact.toLowerCase() === contactInput.toLowerCase().trim()) {
      try {
        await deleteDoc(doc(db, "lostfound", id));
        fetchFirebaseItems();
        return true;
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    } else {
      alert("Contact info doesn't match!");
    }
    return false;
  };

  const filteredItems = items.filter(i => 
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-4">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg">
              <Package size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Lost & Found</h2>
          </div>
          <button onClick={() => setShowAddForm(true)} className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-95 transition-transform">
            <Plus size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Feed */}
      <div className="max-w-xl mx-auto px-6 space-y-4">
        {loading ? (
            <p className="text-center text-slate-400 font-bold animate-pulse">Checking the cloud...</p>
        ) : filteredItems.length > 0 ? filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
            {item.image && (
              <img src={item.image} alt="item" className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'Lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {item.status}
                </span>
                <button 
                  onClick={() => {
                    const pass = prompt("Enter contact info to confirm removal:");
                    if (pass) deleteItem(item.id, pass);
                  }}
                  className="text-slate-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-slate-800 font-bold text-lg mb-2">{item.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone size={14} className="text-orange-400" />
                  <span className="text-xs font-bold">{item.contact}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-center text-slate-400 py-10">No items reported yet.</p>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">Report Item</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                {['Lost', 'Found'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({...formData, status: s})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                      formData.status === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="Item Description (e.g. Black HP Laptop Bag)*" 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 h-24"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />

              <input 
                type="text" 
                placeholder="Your Contact (Phone/Email)*" 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-200"
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                required
              />

              <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 cursor-pointer">
                <Camera size={20} />
                <span className="text-xs font-bold">{formData.image ? "Image Ready ✅" : "Upload Photo"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>

              <button type="submit" className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black shadow-lg">
                Post Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
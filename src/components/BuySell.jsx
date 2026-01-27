import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Trash2, Phone, Search, Camera, X, Tag } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const BuySell = ({ onBack }) => {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    itemName: '', price: '', contact: '', description: '', image: ''
  });

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString() || "Just now"
      }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching marketplace: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMarketplaceItems();
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
          const MAX_WIDTH = 600; 
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
    if (!formData.itemName || !formData.price || !formData.contact) {
        return alert("Please fill in all required fields!");
    }
    
    try {
      // 1. SAVE TO PRODUCTS COLLECTION (For the Marketplace UI)
      await addDoc(collection(db, "products"), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. SAVE TO NOTIFICATIONS COLLECTION (For the Bell Icon)
      // This will automatically create the 'notifications' collection in your Firestore
      await addDoc(collection(db, "notifications"), {
        title: "New Item in Marketplace 🛍️",
        desc: `${formData.itemName} for ₹${formData.price}`,
        time: serverTimestamp(),
        unread: true 
      });
      
      setFormData({ itemName: '', price: '', contact: '', description: '', image: '' });
      setShowAddForm(false);
      fetchMarketplaceItems();
      alert("Success! Your item is live and students have been notified.");
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Error posting item: " + error.message);
    }
  };

  const deleteItem = async (id) => {
    const contactInput = prompt("Enter the contact info used for this listing to confirm removal:");
    if (!contactInput) return;

    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete.contact.toLowerCase() === contactInput.toLowerCase().trim()) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchMarketplaceItems();
      } catch (error) {
        alert("Removal failed: " + error.message);
      }
    } else {
      alert("Contact info mismatch! Removal denied.");
    }
  };

  const filteredItems = items.filter(i => 
    i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <ShoppingCart size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Marketplace</h2>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Item Grid */}
      <div className="max-w-xl mx-auto px-6 grid grid-cols-1 gap-6">
        {loading ? (
            <div className="text-center py-20 animate-pulse font-bold text-slate-400">Loading marketplace...</div>
        ) : filteredItems.length > 0 ? filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
            {item.image && (
              <img src={item.image} alt={item.itemName} className="w-full h-56 object-cover" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-slate-800">{item.itemName}</h3>
                <span className="text-indigo-600 font-black text-lg">₹{item.price}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold">{item.contact}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-xl">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )) : (
            <div className="text-center py-20 opacity-40 font-bold">No items found.</div>
        )}
      </div>

      {/* Add Item Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">List an Item</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="What are you selling?*" 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.itemName}
                onChange={e => setFormData({...formData, itemName: e.target.value})}
                required
              />
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="number" 
                    placeholder="Price (₹)*" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                />
              </div>
              <textarea 
                placeholder="Condition, age, or features..." 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 h-24 font-medium"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Your Contact (Phone/Email)*" 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                required
              />
              <label className="flex items-center justify-center gap-3 p-6 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-600 cursor-pointer">
                <Camera size={24} />
                <span className="text-sm font-black">{formData.image ? "Photo Added!" : "Add Item Photo"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-lg active:scale-95 transition-transform">
                Post Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuySell;
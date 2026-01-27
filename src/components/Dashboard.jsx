import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, onSnapshot, orderBy, 
  limit, doc, writeBatch, deleteDoc 
} from 'firebase/firestore';
import { 
  Utensils, Calendar, Bell, BookOpen, Briefcase, 
  Phone, CheckSquare, Search, ShoppingBag, MessageSquare,
  ChevronRight, LogOut, ArrowLeft, Bot, UserCircle, Trash2, CheckCircle
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-opacity-20`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">{description}</p>
    <div className="mt-4 flex items-center text-blue-600 text-[10px] font-bold uppercase tracking-wider">
      Open Feature <ChevronRight size={14} className="ml-1" />
    </div>
  </div>
);

const Dashboard = ({ onLogout, onFeatureClick, user }) => {
  const [view, setView] = useState('home'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Real-time user data listener
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setUserData(doc.data());
    });

    // Real-time notifications listener
    const qNotif = query(collection(db, "notifications"), orderBy("time", "desc"), limit(30));
    const unsubNotif = onSnapshot(qNotif, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(items);
      setUnreadCount(items.filter(n => n.unread === true).length);
    });

    return () => {
      unsubUser();
      unsubNotif();
    };
  }, [user]);

  const markAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach(n => {
      if (n.unread) {
        const ref = doc(db, "notifications", n.id);
        batch.update(ref, { unread: false });
      }
    });
    await batch.commit();
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    if (window.confirm("Clear all notifications?")) {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, "notifications", n.id));
      });
      await batch.commit();
    }
  };

  const features = [
  // 1. MORNING PREP (First thing a student checks)
  { id: 'mess', title: "Mess Menu", icon: Utensils, color: "bg-orange-500", description: "Check today's breakfast, lunch, and dinner." },
  { id: 'schedule', title: "Class Schedule", icon: Calendar, color: "bg-blue-600", description: "View your personal weekly timetable." },
  { id: 'notices', title: "Notices", icon: Bell, color: "bg-rose-500", description: "Official campus updates and news." },

  // 2. ACADEMIC FLOW (During and between classes)
  { id: 'attendance', title: "Attendance", icon: CheckSquare, color: "bg-teal-600", description: "Track your 75% criteria subject-wise." },
  { id: 'resources', title: "Academic Hub", icon: BookOpen, color: "bg-emerald-500", description: "Access PYQs, notes, and study material." },
  { id: 'tasks', title: "Task Manager", icon: CheckSquare, color: "bg-indigo-500", description: "Organize your assignments and deadlines." },

  // 3. SUPPORT & ASSISTANCE (When help is needed)
  { id: 'chatbot', title: "AI Chatbot", icon: Bot, color: "bg-slate-700", description: "AI assistance for campus queries." },
  { id: 'contacts', title: "Campus Directory", icon: Phone, color: "bg-cyan-500", description: "Important faculty and emergency contacts." },
  
  // 4. COMMUNITY & CAMPUS LIFE (Evening/Free time activities)
  { id: 'chat', title: "Community Chat", icon: MessageSquare, color: "bg-green-600", description: "Group chat for all IIITK students." },
  { id: 'buysell', title: "Buy & Sell", icon: ShoppingBag, color: "bg-pink-500", description: "Marketplace for campus essentials." },
  { id: 'lostfound', title: "Lost & Found", icon: Search, color: "bg-amber-500", description: "Report lost items or find found ones." },
  { id: 'opportunities', title: "Opportunities", icon: Briefcase, color: "bg-purple-500", description: "Latest internships and career placements." },
  ];

  const filteredFeatures = features.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32 bg-[#F8FAFC]">
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex justify-between items-start">
          <div className="flex-1">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Campus Saarthi</span>
            <div onClick={() => onFeatureClick('profile')} className="mt-3 flex items-center gap-3 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {userData?.profilePic ? (
                  <img src={userData.profilePic} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="text-blue-600" size={32} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 leading-tight">
                  Hello, <span className="text-blue-600">{userData?.fullName?.split(' ')[0] || "Scholar"}</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {userData?.branch || "Complete Profile"} • {userData?.year || "IIITK"}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all ml-4">
            <LogOut size={18} />
          </button>
        </div>

        {isSearchOpen && view === 'home' && (
          <div className="max-w-5xl mx-auto mt-6 animate-in slide-in-from-top-2">
            <div className="relative">
              <input 
                autoFocus 
                type="text" 
                placeholder="Search features..." 
                className="w-full p-4 pl-12 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'home' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((item) => (
              <FeatureCard key={item.id} {...item} onClick={() => onFeatureClick(item.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setView('home')} className="flex items-center gap-2 font-bold text-slate-600">
                <ArrowLeft size={20}/> Back
              </button>
              {notifications.length > 0 && (
                <button onClick={clearAllNotifications} className="text-[10px] font-black text-red-500 uppercase bg-red-50 px-4 py-2 rounded-xl">
                  Clear All
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className={`group p-5 rounded-3xl flex gap-4 border transition-all ${n.unread ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-800 truncate pr-2">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {n.time?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.desc}</p>
                  </div>
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <CheckCircle className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No new notifications</p>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-slate-900 text-white px-10 py-4 rounded-[2.5rem] shadow-2xl flex justify-between items-center z-50">
        <Search 
          size={22} 
          className={`${isSearchOpen ? 'text-blue-400' : 'opacity-50'} cursor-pointer`} 
          onClick={() => { setView('home'); setIsSearchOpen(!isSearchOpen); }} 
        />
        <div className="relative -mt-16">
          <button 
            onClick={() => onFeatureClick('chat')} 
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-[6px] border-[#F8FAFC] shadow-xl hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={28} />
          </button>
        </div>
        <div className="relative">
          <Bell 
            size={22} 
            className={`${view === 'notifications' ? 'text-blue-400' : 'opacity-50'} cursor-pointer`} 
            onClick={() => { 
              setView('notifications'); 
              setIsSearchOpen(false); 
              markAsRead(); 
            }} 
          />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
              {unreadCount}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
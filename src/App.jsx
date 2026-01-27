import React, { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MessMenu from './components/MessMenu';
import Schedule from './components/schedule';
import Resources from './components/Resources';
import Opportunities from './components/Opportunities';
import Contacts from './components/Contacts';
import TaskManager from './components/TaskManager';
import BuySell from './components/BuySell';
import Chatbot from './components/Chatbot';
import LostFound from './components/LostFound';
import CommunityChat from './components/CommunityChat';
import Notices from './components/Notices';
import ProfileSettings from './components/ProfileSettings';
import Attendance from './components/Attendance'; 
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActivePage('dashboard');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold tracking-wide">Syncing Session...</p>
      </div>
    );
  }

  if (!user) return <Auth onLogin={() => {}} />;

  const renderPage = () => {
    // The case IDs match the 'id' in the features array of Dashboard.jsx
    switch (activePage) {
      case 'profile': 
        return <ProfileSettings onBack={() => setActivePage('dashboard')} />;
      case 'attendance': 
        return <Attendance onBack={() => setActivePage('dashboard')} />;
      case 'mess': 
        return <MessMenu onBack={() => setActivePage('dashboard')} />;
      case 'schedule': 
        return <Schedule onBack={() => setActivePage('dashboard')} />;
      case 'resources': 
        return <Resources onBack={() => setActivePage('dashboard')} />;
      case 'opportunities': 
        return <Opportunities onBack={() => setActivePage('dashboard')} />;
      case 'contacts': 
        return <Contacts onBack={() => setActivePage('dashboard')} />;
      case 'tasks': 
        return <TaskManager onBack={() => setActivePage('dashboard')} />;
      case 'lostfound': 
        return <LostFound onBack={() => setActivePage('dashboard')} />;
      case 'buysell': 
        return <BuySell onBack={() => setActivePage('dashboard')} />;
      case 'chatbot': 
        return <Chatbot onBack={() => setActivePage('dashboard')} />;
      case 'chat': 
        return <CommunityChat onBack={() => setActivePage('dashboard')} />; 
      case 'notices': 
        return <Notices onBack={() => setActivePage('dashboard')} />; 
      default:
        return (
          <Dashboard 
            onLogout={handleLogout} 
            onFeatureClick={(id) => setActivePage(id)} 
            user={user} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {renderPage()}
    </div>
  );
}

export default App;
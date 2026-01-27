import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Camera, Loader2, Save, ArrowLeft, User, 
  GraduationCap, Building2, Home, Hash, IdCard 
} from 'lucide-react';

const ProfileSettings = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    regNo: '',
    rollNo: '', // Added Roll Number
    year: '',
    branch: '',
    residency: '',
    profilePic: ''
  });

  // Fetch existing data or initialize empty state
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle Profile Picture (Base64 compression)
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 300; 
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          setProfile({ ...profile, profilePic: canvas.toDataURL('image/jpeg', 0.7) });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // setDoc with merge: true creates the collection/document if missing
      await setDoc(userRef, {
        ...profile,
        fullName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        updatedAt: new Date()
      }, { merge: true });

      alert("Profile updated successfully! ✅");
      onBack(); // Return to dashboard
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving: " + err.message);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-slate-600 active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-black text-slate-800">Complete Profile</h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-8">
            <label className="relative cursor-pointer group">
              <div className="w-28 h-28 rounded-full border-4 border-blue-50 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-200">
                {profile.profilePic ? (
                  <img src={profile.profilePic} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="text-slate-300" size={40} />
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
              <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg border-4 border-white">
                <Camera size={16} />
              </div>
            </label>
            <p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">Profile Picture (Optional)</p>
          </div>

          <div className="space-y-6">
            {/* Registration & Roll Number Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase mb-1 block">Reg. Number</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={profile.regNo} 
                    onChange={e => setProfile({...profile, regNo: e.target.value})}
                    placeholder="1318"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase mb-1 block">Roll Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={profile.rollNo} 
                    onChange={e => setProfile({...profile, rollNo: e.target.value})}
                    placeholder="CSE24112"
                  />
                </div>
              </div>
            </div>

            {/* Year and Residency Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase mb-1 block">Academic Year</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none outline-none"
                    value={profile.year} 
                    onChange={e => setProfile({...profile, year: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>M.Tech</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase mb-1 block">Living Status</label>
                <div className="relative">
                  <Home className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none outline-none"
                    value={profile.residency} 
                    onChange={e => setProfile({...profile, residency: e.target.value})}
                  >
                    <option value="">Select Status</option>
                    <option value="Hosteller">Hosteller</option>
                    <option value="Outside (Rented)">Outside (Room/PG)</option>
                    <option value="Local (Daysholar)">Local (Daily Up-down)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase mb-1 block">Branch / Discipline</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <select 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none outline-none"
                  value={profile.branch} 
                  onChange={e => setProfile({...profile, branch: e.target.value})}
                >
                  <option value="">Select Branch</option>
                  <option>Computer Science (CSE)</option>
                  <option>Electronics (ECE)</option>
                  <option>Cybersecurity</option>
                  <option>AI & Data Science</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={saveProfile} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Update Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
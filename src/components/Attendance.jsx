import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Minus, Trash2, Loader2, AlertCircle, Info } from 'lucide-react';

const Attendance = ({ onBack }) => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [incrementValue, setIncrementValue] = useState(1); // Default is 1 class

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const docSnap = await getDoc(doc(db, "attendance", auth.currentUser.uid));
      if (docSnap.exists()) {
        setSubjects(docSnap.data().subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveToFirebase = async (updatedSubjects) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "attendance", auth.currentUser.uid), {
        subjects: updatedSubjects,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const updated = [...subjects, { name: newSubject, attended: 0, total: 0 }];
    setSubjects(updated);
    setNewSubject("");
    saveToFirebase(updated);
  };

  const updateAttendance = (index, type) => {
    const updated = [...subjects];
    const val = parseInt(incrementValue);
    
    if (type === 'present') {
      updated[index].attended += val;
      updated[index].total += val;
    } else if (type === 'absent') {
      updated[index].total += val;
    }
    setSubjects(updated);
    saveToFirebase(updated);
  };

  const deleteSubject = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
    saveToFirebase(updated);
  };

  const calculatePercent = (att, tot) => {
    if (tot === 0) return 0;
    return ((att / tot) * 100).toFixed(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm active:scale-90 transition-all"><ArrowLeft size={20}/></button>
          <h2 className="text-2xl font-black text-slate-800">Attendance</h2>
        </div>

        {/* Increment Selector (The fix for your 2-class/3-class issue) */}
        <div className="bg-blue-600 p-4 rounded-3xl shadow-lg mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Marking Mode</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((num) => (
              <button 
                key={num}
                onClick={() => setIncrementValue(num)}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${incrementValue === num ? 'bg-white text-blue-600 scale-105' : 'bg-blue-500 text-blue-100'}`}
              >
                {num} {num === 1 ? 'Period' : 'Periods'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm mb-6 flex gap-2 border border-slate-100">
          <input 
            className="flex-1 bg-transparent px-2 outline-none font-bold text-slate-700"
            placeholder="Subject (e.g. DBMS, OS)..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button onClick={addSubject} className="bg-blue-600 text-white p-3 rounded-2xl active:scale-95 transition-all">
            <Plus size={20}/>
          </button>
        </div>

        <div className="space-y-4">
          {subjects.map((sub, index) => {
            const percent = calculatePercent(sub.attended, sub.total);
            const isLow = percent < 75 && sub.total > 0;

            return (
              <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-slate-800 text-lg uppercase">{sub.name}</h3>
                  <button onClick={() => deleteSubject(index)} className="text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
                
                <p className="text-[10px] font-bold text-slate-400 mb-4">ATTENDED: {sub.attended} / TOTAL: {sub.total}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`text-4xl font-black ${isLow ? 'text-red-500' : 'text-emerald-500'}`}>
                    {percent}%
                  </div>
                  {isLow && (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold bg-red-50 px-3 py-1.5 rounded-full">
                      <AlertCircle size={12}/> {75 - percent}% SHORT
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateAttendance(index, 'present')}
                    className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 py-3 rounded-2xl font-bold active:scale-95 transition-all"
                  >
                    <Plus size={18}/>
                    <span className="text-[10px]">Present (+{incrementValue})</span>
                  </button>
                  <button 
                    onClick={() => updateAttendance(index, 'absent')}
                    className="flex flex-col items-center justify-center bg-red-50 text-red-600 py-3 rounded-2xl font-bold active:scale-95 transition-all"
                  >
                    <Minus size={18}/>
                    <span className="text-[10px]">Absent (+{incrementValue})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {saving && <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-bold animate-pulse">SYNCING...</div>}
    </div>
  );
};

export default Attendance;
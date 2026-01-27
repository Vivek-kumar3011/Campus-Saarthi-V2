import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, CheckCircle2, Circle, Trash2, Plus, Trophy, BarChart3, Loader2 } from 'lucide-react';
import { calculateScore, getBadge } from '../utils/taskLogic';

const TaskManager = ({ onBack }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- 1. FETCH DATA (LIKE ATTENDANCE) ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch document by current User UID
        const docSnap = await getDoc(doc(db, "tasks", auth.currentUser.uid));
        if (docSnap.exists()) {
          setTasks(docSnap.data().taskList || []);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- 2. SAVE DATA (LIKE ATTENDANCE) ---
  const saveToFirebase = async (updatedTasks) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "tasks", auth.currentUser.uid), {
        taskList: updatedTasks,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error("Save Error:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const addTask = (e) => {
    if (e) e.preventDefault();
    if (!newTaskDesc.trim()) return;

    const updated = [
      ...tasks, 
      { 
        id: Date.now().toString(), 
        description: newTaskDesc, 
        status: 'pending', 
        date: new Date().toLocaleDateString() 
      }
    ];
    setTasks(updated);
    setNewTaskDesc("");
    saveToFirebase(updated);
  };

  const toggleStatus = (index) => {
    const updated = [...tasks];
    updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed';
    setTasks(updated);
    saveToFirebase(updated);
  };

  const deleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
    saveToFirebase(updated);
  };

  const score = calculateScore(tasks);
  const badge = getBadge(score);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold mb-6">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Tasks</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Private Cloud Storage</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <BarChart3 size={16} /> <span className="text-[10px] font-black uppercase tracking-tighter">Completion</span>
            </div>
            <div className="text-2xl font-black text-slate-800">{score.toFixed(0)}%</div>
          </div>
          <div className={`p-5 rounded-[2rem] border border-slate-100 shadow-sm ${badge?.bg || 'bg-white'}`}>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Trophy size={16} /> <span className="text-[10px] font-black uppercase tracking-tighter">Badge</span>
            </div>
            <div className={`text-lg font-black ${badge?.color || 'text-slate-300'}`}>
              {badge?.label || 'Novice'}
            </div>
          </div>
        </div>

        {/* Add Task Input */}
        <form onSubmit={addTask} className="bg-white p-2 rounded-3xl shadow-sm flex gap-2 border border-slate-100">
          <input 
            className="flex-1 bg-transparent px-4 outline-none font-bold text-slate-700 placeholder:text-slate-300"
            placeholder="Add new task..."
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl active:scale-95 transition-all shadow-md">
            <Plus size={20}/>
          </button>
        </form>

        {/* List of Tasks */}
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={task.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                <button 
                  onClick={() => toggleStatus(index)}
                  className={`transition-all active:scale-125 ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-200'}`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                </button>
                
                <div className="flex-1">
                  <p className={`font-bold text-slate-700 leading-tight ${task.status === 'completed' ? 'text-slate-300 line-through font-medium' : ''}`}>
                    {task.description}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Added: {task.date}</p>
                </div>

                <button onClick={() => deleteTask(index)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold">No tasks yet!</p>
              <p className="text-[10px] text-slate-300 mt-1 uppercase">Start adding to sync to your ID</p>
            </div>
          )}
        </div>
      </div>

      {/* Syncing Indicator */}
      {saving && (
        <div className="fixed bottom-10 right-10 bg-slate-900/90 text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Loader2 size={12} className="animate-spin" /> SAVING TO CLOUD
        </div>
      )}
    </div>
  );
};

export default TaskManager;
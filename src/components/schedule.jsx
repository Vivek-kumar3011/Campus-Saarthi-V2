import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Search } from 'lucide-react';
import { CLASS_SCHEDULE_DATA, FACULTY_MAP } from '../data/classData';

const Schedule = ({ onBack }) => {
  // 1. Get list of branches from your data
  const branchList = Object.keys(CLASS_SCHEDULE_DATA);
  
  // 2. Set default to the first branch in the list (or a specific one if you prefer)
  const [selectedBranch, setSelectedBranch] = useState(branchList[0] || "");
  
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const [selectedDay, setSelectedDay] = useState(days.includes(todayName) ? todayName : "MON");

  // Helper to resolve faculty names
  const resolveFaculty = (codeStr) => {
    if (!codeStr) return "Not Assigned";
    return codeStr
      .replace(/[()]/g, '')
      .split(/[/,]/)
      .map(code => FACULTY_MAP[code.trim()] || code.trim())
      .join(", ");
  };

  // 3. Derived data: This will now update automatically whenever state changes
  const currentClasses = CLASS_SCHEDULE_DATA[selectedBranch]?.[selectedDay] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[3rem] shadow-sm border-b border-slate-100 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-6 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 text-white">
              <Calendar size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Time Table</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              {branchList.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-sm transition-all ${
                selectedDay === day 
                ? "bg-slate-900 text-white shadow-xl scale-105" 
                : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {currentClasses.length > 0 ? (
            currentClasses.map((cls, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                      {cls.time}
                    </span>
                    <h3 className="text-xl font-black text-slate-800 mt-2">{cls.course}</h3>
                  </div>
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-bold">
                    {cls.room}
                  </div>
                </div>
                <div className="h-[1px] bg-slate-100 w-full"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <User size={16} />
                  </div>
                  <p className="text-sm font-bold text-slate-600">
                    {resolveFaculty(cls.faculty)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <span className="text-4xl italic">☕</span>
              <p className="text-slate-400 font-bold mt-4">No classes for {selectedDay}. Enjoy!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
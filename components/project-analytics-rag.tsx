'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Users } from 'lucide-react';

interface Member {
  name: string;
  role: string;
}

interface Project {
  members: Member[];
  // ... other props
}

const TOTAL_DAYS = 28;
const EXPECTED_ACTIVE_DAYS = 8; // ~2 days a week

export default function ProjectAnalyticsRAG({ project }: { project: any }) {
  const [currentDay, setCurrentDay] = useState(TOTAL_DAYS);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation Loop for Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= TOTAL_DAYS) {
            setIsPlaying(false);
            return TOTAL_DAYS;
          }
          return prev + 1;
        });
      }, 250); // Speed of the simulation (250ms per day)
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (currentDay === TOTAL_DAYS) setCurrentDay(0);
    setIsPlaying(!isPlaying);
  };

  // Generate realistic-looking mock data patterns based on names
  const studentData = useMemo(() => {
    if (!project?.members) return [];
    return project.members.map((m: Member, index: number) => {
      const data = Array(TOTAL_DAYS).fill(0);
      
      // Assign different working styles based on role/name for the simulation
      if (m.name.includes("Akshit") || m.role.includes("ML")) {
        // The Crammer: does everything in the last 3 days
        data[25] = 8; data[26] = 18; data[27] = 24;
      } else if (index % 2 === 0) {
        // The Steady Worker: consistent small commits
        [2, 4, 5, 8, 11, 14, 15, 18, 21, 22, 25, 27].forEach(d => data[d-1] = Math.floor(Math.random() * 3) + 1);
      } else {
        // The Bursty Worker: works hard once a week
        [6, 7, 13, 14, 20, 21, 27].forEach(d => data[d-1] = Math.floor(Math.random() * 6) + 2);
      }
      return { name: m.name, role: m.role, data };
    });
  }, [project]);

  // Find max commits across all students to normalize the Y-axis of the mini-charts
  const maxCommits = useMemo(() => {
    const max = Math.max(...studentData.flatMap((s: any) => s.data));
    return max > 0 ? max : 10; // Fallback to 10 if no data
  }, [studentData]);

  // SVG Path Generator for the inline sparklines
  const generatePath = useCallback((data: number[], day: number, isArea: boolean) => {
    if (day === 0) return '';
    const points = data.slice(0, day).map((val, i) => {
      const x = (i / (TOTAL_DAYS - 1)) * 100; // Percentage based X
      const y = 40 - (val / maxCommits) * 38; // 40px height, leave 2px padding top
      return `${x},${y}`;
    });
    
    const path = `M ${points.join(' L ')}`;
    if (isArea) {
      const lastX = ((day - 1) / (TOTAL_DAYS - 1)) * 100;
      return `${path} L ${lastX},40 L 0,40 Z`;
    }
    return path;
  }, [maxCommits]);

  if (!project?.members) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header & Simulation Controls */}
      <div className="px-5 py-3 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Output Timeline Simulation</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">28-Day Phase Tracker</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
          <span className="text-xs font-mono font-bold text-slate-700 w-14 text-center">Day {currentDay}</span>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={handlePlayPause} 
            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded transition-colors flex items-center gap-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => { setIsPlaying(false); setCurrentDay(TOTAL_DAYS); }} 
            className="p-1.5 text-gray-400 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact List with Inline Sparklines */}
      <div className="divide-y divide-gray-100">
        {studentData.map((student: any) => {
          // Calculate live stats up to the current simulated day
          const sliced = student.data.slice(0, currentDay);
          const totalCommits = sliced.reduce((a: number, b: number) => a + b, 0);
          const activeDays = sliced.filter((v: number) => v > 0).length;
          const score = Math.min(Math.round((activeDays / EXPECTED_ACTIVE_DAYS) * 100), 100);
          
          // Determine risk logic
          const isRisk = score < 40 && totalCommits > 10 && currentDay > 20;
          const statusColor = isRisk ? 'red' : (score >= 80 ? 'emerald' : 'indigo');

          return (
            <div key={student.name} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row items-center gap-4">
              
              {/* 1. Name & Role */}
              <div className="w-full lg:w-40 shrink-0 flex justify-between lg:block">
                <div className="font-semibold text-gray-900 text-sm truncate">{student.name}</div>
                <div className="text-xs text-gray-500 truncate">{student.role}</div>
              </div>

              {/* 2. INLINE SPARKLINE (The Simulation) */}
              <div className="w-full lg:flex-1 h-10 relative bg-slate-50/50 rounded border border-gray-100/50 overflow-hidden">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {/* Baseline */}
                  <line x1="0" y1="39.5" x2="100" y2="39.5" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Data Paths */}
                  <path 
                    d={generatePath(student.data, currentDay, true)} 
                    fill={`var(--color-${statusColor}-500)`} fillOpacity="0.1" 
                  />
                  <path 
                    d={generatePath(student.data, currentDay, false)} 
                    fill="none" 
                    stroke={`var(--color-${statusColor}-500)`} 
                    strokeWidth="1.5" 
                    strokeLinejoin="round" 
                  />

                  {/* Playhead Indicator */}
                  {currentDay > 0 && currentDay < TOTAL_DAYS && (
                    <line 
                      x1={`${((currentDay - 1) / (TOTAL_DAYS - 1)) * 100}`} y1="0" 
                      x2={`${((currentDay - 1) / (TOTAL_DAYS - 1)) * 100}`} y2="40" 
                      stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" 
                    />
                  )}
                </svg>
              </div>

              {/* 3. Live Stats */}
              <div className="w-full lg:w-28 flex justify-between lg:justify-end gap-4 shrink-0 px-2">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Commits</div>
                  <div className="text-sm font-bold text-gray-700">{totalCommits}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Days</div>
                  <div className="text-sm font-bold text-gray-700">{activeDays}<span className="text-xs text-gray-400 font-normal">/8</span></div>
                </div>
              </div>

              {/* 4. Consistency & Badge */}
              <div className="w-full lg:w-48 flex items-center justify-between gap-3 shrink-0">
                <div className="flex-1">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${score}%`, 
                        backgroundColor: `var(--color-${statusColor}-500)` 
                      }}
                    />
                  </div>
                </div>

                <div className="w-24 flex justify-end">
                  {isRisk ? (
                    <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 shadow-sm">
                      <AlertTriangle className="w-3 h-3 mr-1" /> RISK
                    </span>
                  ) : score >= 80 ? (
                    <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> STEADY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200">
                      AVERAGE
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Define CSS variables for the dynamic stroke/fill colors inline */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-indigo-500: #6366f1;
          --color-emerald-500: #10b981;
          --color-red-500: #ef4444;
        }
      `}} />
    </div>
  );
}
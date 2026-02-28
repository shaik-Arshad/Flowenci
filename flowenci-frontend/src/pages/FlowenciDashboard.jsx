import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Play, CheckCircle, Circle, Sparkles, TrendingUp, 
  Flame, Zap, Award, ChevronDown, Bell, User, Layout, Target, Clock, Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/recordings';

// Circular Progress Component
const CircularProgress = ({ value, size = 120, strokeWidth = 8, label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-white">{Math.round(value)}</div>
        {label && <div className="text-xs text-cyan-400 mt-1">{label}</div>}
        {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
      </div>
    </div>
  );
};

// Skill Bar Component
const SkillBar = ({ skill, value, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">{skill}</span>
        <span className="text-sm font-semibold text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const FlowenciDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (token) {
      dashboardApi.stats(token)
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dashboard stats", err);
          setLoading(false);
        });
    }
  }, [token]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-sm">Gathering your performance data...</div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_recordings === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mic className="text-cyan-400 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Record your first mock interview to unlock personalized AI feedback and performance tracking.
          </p>
          <button 
            onClick={() => navigate('/library')} 
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/20"
          >
            Practice Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 pb-12">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">
                {stats.is_interview_ready ? "🎉 You're Ready for Success!" : `Hey, ${user?.name?.split(' ')[0]} 👋`}
            </h1>
            <p className="text-gray-400 text-lg">{stats.next_focus}</p>
          </div>
          <button onClick={() => navigate('/library')} className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center gap-3 transition-all hover:bg-slate-800 group">
            <Layout className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
            <span className="font-semibold text-gray-300 group-hover:text-white">Full Library</span>
          </button>
        </div>
        
        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Progress Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800/50 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Weekly Momentum</h3>
                <p className="text-sm text-gray-400">Your practice intensity this week</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-white">{stats.total_recordings}</div>
                <div className="text-xs text-teal-400 font-bold tracking-wider uppercase">Recordings Completed</div>
              </div>
            </div>
            
            {/* Action Center */}
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => navigate('/library')}
                className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-3xl text-white transition-all transform hover:scale-[1.03] shadow-xl shadow-cyan-500/20 group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Play className="w-8 h-8 fill-white" />
                </div>
                <div className="text-center">
                    <div className="font-black text-lg">Resume Practice</div>
                    <div className="text-white/70 text-sm">Next Round Waiting</div>
                </div>
              </button>
              
              <div className="space-y-4">
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-cyan-400 w-5 h-5" />
                    <span className="font-bold text-gray-200">Session Totals</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Minutes</div>
                        <div className="text-xl font-bold text-white">{stats.total_practice_minutes}m</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Questions</div>
                        <div className="text-xl font-bold text-white">{stats.questions_practiced}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Award className="text-amber-500 w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-amber-500/70 font-bold uppercase">Next Milestone</div>
                        <div className="text-sm font-bold text-white">Complete 10 Interviews</div>
                    </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Readiness Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl">
            <CircularProgress 
              value={stats.readiness_score} 
              size={180} 
              strokeWidth={14}
              label="Readiness"
              sublabel="Overall Score"
            />
            <h3 className="text-xl font-bold text-white mt-8 mb-2">Interview Preparedness</h3>
            <p className="text-gray-400 text-center text-sm px-4">
              {stats.readiness_score >= 75 ? "Your performance is elite! Ready to ace those top-tier roles." : "Keep sharpening your skills. You're making solid progress!"}
            </p>
          </div>
        </div>
        
        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-cyan-400 w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Advanced Skill Mapping</h3>
            </div>
            <div className="space-y-6">
              {(stats.skill_breakdown || []).map((skill, idx) => (
                <SkillBar key={idx} {...skill} />
              ))}
              {(!stats.skill_breakdown || stats.skill_breakdown.length === 0) && (
                <p className="text-gray-500 text-center py-10">Complete a session to see detailed mapping</p>
              )}
            </div>
          </div>
          
          {/* Last Session Intelligence */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 blur-[60px]" />
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-purple-400 w-6 h-6" />
                        <h3 className="text-xl font-bold text-white">A.I. Insights</h3>
                    </div>
                    <div className="px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-xs font-bold text-gray-400">LATEST SESSION</div>
                </div>
                
                {stats.last_session ? (
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <div className="text-5xl font-black text-white mb-1">{stats.last_session.score}</div>
                                <div className="text-sm font-bold text-teal-400">{stats.last_session.change} improvement</div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-teal-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>KEY STRENGTHS</span>
                                </div>
                                <ul className="space-y-3">
                                    {stats.last_session.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                            <span className="inline-block w-1.5 h-1.5 bg-teal-500/40 rounded-full mt-1.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="bg-slate-950/30 rounded-2xl p-6 border border-slate-800/50">
                            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-6 uppercase tracking-wider">
                                <Target className="w-4 h-4" />
                                <span>Growth Areas</span>
                            </div>
                            <ul className="space-y-4">
                                {stats.last_session.improvements.map((im, i) => (
                                    <li key={i} className="text-sm text-gray-400 italic bg-slate-900/50 p-3 rounded-lg border-l-2 border-amber-500/50">
                                        "{im}"
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 italic">No feedback data available yet</div>
                )}
            </div>
            
            {/* Rapid Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Personalized Focus</h3>
                <div className="flex flex-wrap gap-3">
                    {["STAR Structure", "Filler Word Control", "Technical Nuance", "Executive Presence"].map((tag, i) => (
                        <button key={i} className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/30 rounded-full text-sm font-bold text-gray-400 hover:text-cyan-400 transition-all">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
        
        {/* Performance Analytics Integration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-cyan-400 w-6 h-6" />
                    <h3 className="text-xl font-bold text-white">Performance Trajectory</h3>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score %</span>
                    </div>
                </div>
            </div>
            
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.readiness_trend}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="attempt" 
                          stroke="#475569" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0f172a', 
                                border: '1px solid #1e293b',
                                borderRadius: '16px',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#06b6d4" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Gamification Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 group hover:border-orange-500/30 transition-all">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Flame className="text-orange-500 w-8 h-8" />
                </div>
                <div>
                    <div className="text-3xl font-black text-white">7</div>
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Streak</div>
                </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 group hover:border-cyan-500/30 transition-all">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Zap className="text-cyan-500 w-8 h-8" />
                </div>
                <div>
                    <div className="text-3xl font-black text-white">2,847</div>
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Total XP</div>
                </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 group hover:border-amber-500/30 transition-all">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Award className="text-amber-500 w-8 h-8" />
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-black text-white">Level 12</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Master</div>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[73%]" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlowenciDashboard;

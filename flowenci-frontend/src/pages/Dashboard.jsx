import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardApi } from '../api/recordings'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Mic, BookOpen, Clock, Target, TrendingDown, ArrowRight, Trophy } from 'lucide-react'

function ScoreRing({ score, size = 120 }) {
    const r = 44
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f97c0a' : '#ef4444'
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2520" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="50" y="50" textAnchor="middle" dy="0.35em"
                fill={color} fontSize="18" fontWeight="bold" fontFamily="'Playfair Display', serif">
                {Math.round(score)}
            </text>
            <text x="50" y="64" textAnchor="middle" fill="#7a6e63" fontSize="8">READY</text>
        </svg>
    )
}

function StatCard({ icon: Icon, label, value, sub, color = '#f97c0a' }) {
    return (
        <div className="card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div>
                <p className="label">{label}</p>
                <p className="text-2xl font-bold font-display mt-0.5">{value}</p>
                {sub && <p className="text-xs text-[#7a6e63] mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="card px-3 py-2 text-xs">
                <p className="text-[#7a6e63]">Attempt {payload[0]?.payload?.attempt || label}</p>
                <p className="font-bold text-brand-400">{payload[0]?.value}</p>
            </div>
        )
    }
    return null
}

export default function Dashboard() {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dashboardApi.stats(token).then(setStats).finally(() => setLoading(false))
    }, [token])

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-screen">
            <div className="text-[#3a342d] animate-pulse font-display text-xl">Loading your progress…</div>
        </div>
    )

    const hasData = stats?.total_recordings > 0

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">
                        {stats?.is_interview_ready ? '🎉 You\'re Interview Ready!' : `Hey, ${user?.name?.split(' ')[0]} 👋`}
                    </h1>
                    <p className="text-[#7a6e63] mt-1">{stats?.next_focus || 'Start practicing to track your progress'}</p>
                </div>
                <button onClick={() => navigate('/library')} className="btn-primary flex items-center gap-2">
                    Practice Now <ArrowRight size={16} />
                </button>
            </div>

            {!hasData ? (
                <div className="card p-12 text-center">
                    <div className="text-6xl mb-4">🎙️</div>
                    <h2 className="font-display text-2xl font-bold mb-2">No practice yet</h2>
                    <p className="text-[#7a6e63] mb-6">Record your first answer to see your progress here.</p>
                    <button onClick={() => navigate('/library')} className="btn-primary">
                        Start with "Tell me about yourself" →
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
                        <StatCard icon={Mic} label="Recordings" value={stats.total_recordings} sub="total attempts" />
                        <StatCard icon={BookOpen} label="Questions" value={stats.questions_practiced} sub="practiced" color="#38bdf8" />
                        <StatCard icon={Clock} label="Practice Time" value={`${stats.total_practice_minutes}m`} sub="total" color="#a78bfa" />
                        <StatCard icon={Target} label="Readiness" value={`${stats.readiness_score}%`}
                            sub={stats.is_interview_ready ? '🟢 Ready!' : 'Keep going'}
                            color={stats.readiness_score >= 75 ? '#22c55e' : '#f97c0a'} />
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <div className="card p-6 col-span-3">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={16} className="text-brand-400" />
                                <h2 className="font-semibold text-sm">Filler Words Over Time</h2>
                            </div>
                            {stats.filler_trend.length > 1 ? (
                                <ResponsiveContainer width="100%" height={160}>
                                    <AreaChart data={stats.filler_trend}>
                                        <defs>
                                            <linearGradient id="fillerGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97c0a" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f97c0a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="attempt" tick={{ fill: '#3a342d', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#3a342d', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="filler_count" stroke="#f97c0a" fill="url(#fillerGrad)" strokeWidth={2} dot={{ fill: '#f97c0a', r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-[#3a342d] text-sm">Practice more to see your trend</div>
                            )}
                        </div>
                        <div className="card p-6 col-span-2 flex flex-col items-center justify-center gap-3">
                            <ScoreRing score={stats.readiness_score} />
                            <div className="text-center">
                                <p className="font-semibold text-sm">Interview Readiness</p>
                                <p className="text-[#7a6e63] text-xs mt-0.5">
                                    {stats.readiness_score >= 75 ? 'You\'re ready! 🚀' :
                                        stats.readiness_score >= 50 ? 'Almost there!' :
                                            'Practice daily!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {stats.readiness_trend.length > 1 && (
                        <div className="card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy size={16} className="text-brand-400" />
                                <h2 className="font-semibold text-sm">Readiness Score Trend</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={140}>
                                <AreaChart data={stats.readiness_trend}>
                                    <defs>
                                        <linearGradient id="readyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis tick={{ fill: '#3a342d', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#3a342d', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#readyGrad)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

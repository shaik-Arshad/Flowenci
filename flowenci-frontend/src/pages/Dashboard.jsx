import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
    RadialBarChart, RadialBar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/recordings';

/* ═══════════════════════════════════════════════════════
   SHARED STYLE TOKENS
═══════════════════════════════════════════════════════ */
const C = {
    bg: '#080d14',
    card: 'rgba(11,19,34,0.85)',
    border: 'rgba(255,255,255,0.06)',
    teal: '#22d3ee',
    tealDim: '#0891b2',
    amber: '#f59e0b',
    orange: '#f97316',
    green: '#10b981',
    purple: '#a78bfa',
    red: '#f87171',
    text: '#e2eaf5',
    muted: '#64748b',
    dim: '#4a6080',
};

const card = (extra = {}) => ({
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    ...extra,
});

/* ═══════════════════════════════════════════════════════
   FLOWENCI LOGO
═══════════════════════════════════════════════════════ */
function FlowenciF({ size = 34 }) {
    const r = Math.round(size * 0.26);
    return (
        <div style={{
            width: size, height: size, borderRadius: r, flexShrink: 0,
            background: 'linear-gradient(145deg,#1dd4f0 0%,#0891b2 55%,#0e6e8a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px 2px rgba(29,212,240,0.28)',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: `${r}px ${r}px 60% 60%`,
            }} />
            <svg width={size * 0.55} height={size * 0.58} viewBox="0 0 22 24" fill="none">
                <path d="M5 2 L16 2 L15 5 L8.5 5 L7.5 9 L14 9 L13 12 L6.5 12 L4.5 22 L1 22 Z"
                    fill="white" opacity="0.97" />
            </svg>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SVG HELPERS
═══════════════════════════════════════════════════════ */
function polarXY(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, a1, a2) {
    const s = polarXY(cx, cy, r, a2);
    const e = polarXY(cx, cy, r, a1);
    const large = a2 - a1 <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/* ═══════════════════════════════════════════════════════
   A. CIRCULAR GAUGE — Overall Readiness
═══════════════════════════════════════════════════════ */
function CircularGauge({ value = 82, sessionsCount = 12 }) {
    const SZ = 260, CX = 130, CY = 130, R = 100, SW = 15;
    const circ = 2 * Math.PI * R;
    const arcFrac = 0.75; // 270° arc
    const arcLen = circ * arcFrac;
    const fillLen = (value / 100) * arcLen;
    const trackOffset = -(circ * 0.375); // start at 135°

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: SZ + 60, height: SZ + 20 }}>
            <svg width={SZ + 60} height={SZ + 20} style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <filter id="gGlow">
                        <feGaussianBlur stdDeviation="5" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <path id="topArc" d={arcPath(CX + 30, CY + 15, R + 22, -210, -12)} fill="none" />
                    <path id="botArc" d={arcPath(CX + 30, CY + 15, R + 18, 16, 196)} fill="none" />
                </defs>

                {/* Top arching label */}
                <text fontSize="9" fontWeight="900" fill="rgba(156,163,175,0.85)"
                    letterSpacing="0.17em" fontFamily="'Inter',sans-serif">
                    <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                        OVERALL INTERVIEW READINESS
                    </textPath>
                </text>

                {/* Outer glow ring */}
                <circle cx={CX + 30} cy={CY + 15} r={R + 5} fill="none"
                    stroke="rgba(34,211,238,0.05)" strokeWidth={2} />

                {/* Track */}
                <circle cx={CX + 30} cy={CY + 15} r={R} fill="none"
                    stroke="#15263f" strokeWidth={SW}
                    strokeDasharray={`${arcLen} ${circ - arcLen}`}
                    strokeDashoffset={trackOffset} strokeLinecap="round" />

                {/* Fill */}
                <circle cx={CX + 30} cy={CY + 15} r={R} fill="none"
                    stroke="url(#gGrad)" strokeWidth={SW}
                    strokeDasharray={`${fillLen} ${circ - fillLen}`}
                    strokeDashoffset={trackOffset}
                    strokeLinecap="round" filter="url(#gGlow)" />

                {/* Dark center */}
                <circle cx={CX + 30} cy={CY + 15} r={R - SW - 5}
                    fill="rgba(8,13,20,0.9)" />

                {/* Value */}
                <text x={CX + 30} y={CY + 15 + 18} textAnchor="middle"
                    fontSize="52" fontWeight="900" fill="white"
                    fontFamily="'Inter',sans-serif" letterSpacing="-0.03em">
                    {value}%
                </text>

                {/* Bottom arching label */}
                <text fontSize="8.5" fontWeight="700" fill="rgba(100,116,139,0.9)"
                    letterSpacing="0.07em" fontFamily="'Inter',sans-serif">
                    <textPath href="#botArc" startOffset="50%" textAnchor="middle">
                        Based on AI Analysis of {sessionsCount} Sessions
                    </textPath>
                </text>
            </svg>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MINI STAT CHIP
═══════════════════════════════════════════════════════ */
function StatChip({ label, value, color = C.teal, icon }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.06)`,
        }}>
            {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
            <div>
                <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.dim, letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   B. SKILL BAR
═══════════════════════════════════════════════════════ */
const SKILL_META = {
    'Communication Clarity': { grad: 'linear-gradient(90deg,#0ea5e9,#22d3ee)', glow: 'rgba(34,211,238,0.35)', icon: '💬', pctColor: '#22d3ee' },
    'Fluency': { grad: 'linear-gradient(90deg,#0d9488,#2dd4bf)', glow: 'rgba(45,212,191,0.3)', icon: '🌊', pctColor: '#2dd4bf' },
    'Grammar Accuracy': { grad: 'linear-gradient(90deg,#7c3aed,#a78bfa)', glow: 'rgba(167,139,250,0.3)', icon: '📝', pctColor: '#a78bfa' },
    'Vocabulary Range': { grad: 'linear-gradient(90deg,#0d9488,#f59e0b)', glow: 'rgba(245,158,11,0.3)', icon: '📚', pctColor: '#f59e0b' },
    'Confidence Score': { grad: 'linear-gradient(90deg,#be185d,#f472b6)', glow: 'rgba(244,114,182,0.3)', icon: '⚡', pctColor: '#f472b6' },
    'Interview Readiness': { grad: 'linear-gradient(90deg,#065f46,#10b981)', glow: 'rgba(16,185,129,0.3)', icon: '🎯', pctColor: '#10b981' },
};

function SkillBar({ skill, value }) {
    const m = SKILL_META[skill] || SKILL_META['Communication Clarity'];
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 12,
            background: 'rgba(8,13,20,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
        }}>
            <span style={{ fontSize: 15 }}>{m.icon}</span>
            <span style={{ width: 130, fontSize: 12.5, fontWeight: 700, color: '#cbd5e1', flexShrink: 0 }}>{skill}</span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: m.pctColor, width: 38, flexShrink: 0 }}>{value}%</span>
            <div style={{ flex: 1, height: 9, background: '#080d14', borderRadius: 100, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{
                    height: '100%', width: `${value}%`,
                    background: m.grad, borderRadius: 100,
                    boxShadow: `0 0 8px 1px ${m.glow}`,
                }} />
            </div>
            {/* Trend indicator */}
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', minWidth: 28 }}>↑{Math.floor(Math.random() * 8) + 2}%</span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TOOLTIP
═══════════════════════════════════════════════════════ */
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0f1d2e', border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700,
        }}>
            <div style={{ color: C.dim, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}: {p.value}{p.name === 'WPM' ? '' : '%'}
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════ */
function SectionTitle({ children, sub }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.01em' }}>{children}</h2>
            {sub && <p style={{ margin: '3px 0 0', fontSize: 11, color: C.muted, fontWeight: 600 }}>{sub}</p>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════ */
const MOCK = {
    readiness_score: 82,
    total_recordings: 12,
    current_level: 'Intermediate',
    skills_covered: 8,
    skills_total: 12,
    weekly_change: '+12%',
    overall_progress: 67,
    avg_speaking_speed: 138,
    avg_filler_words: 6,
    pause_frequency: 3.2,
    sentence_complexity: 74,
    profile_completion: 78,
    rank_percentile: 84,
    target_role: 'Data Analyst',
    target_role_readiness: 76,
    company_targets: ['Google', 'Microsoft', 'Amazon'],

    skill_breakdown: [
        { skill: 'Communication Clarity', value: 88 },
        { skill: 'Fluency', value: 75 },
        { skill: 'Grammar Accuracy', value: 82 },
        { skill: 'Vocabulary Range', value: 70 },
        { skill: 'Confidence Score', value: 79 },
        { skill: 'Interview Readiness', value: 82 },
    ],

    last_session: {
        score: 87,
        change: '+5%',
        strengths: ['Clear pronunciation', 'Strong executive presence', 'No filler words', 'Good answer structure'],
        improvements: ['Structure technical answers better', 'Be more concise in behavioral rounds', 'Reduce speaking speed slightly'],
        suggested_exercises: ['STAR method drill', 'Mock behavioral round', 'Vocabulary flashcards — 10 min'],
    },

    ai_suggestions: [
        { text: 'Practice filler word reduction', icon: '🎤', color: '#22d3ee' },
        { text: 'Improve structured answers (STAR)', icon: '⭐', color: '#f59e0b' },
        { text: 'Try mock interview round 2', icon: '🎯', color: '#10b981' },
        { text: 'Vocabulary challenge — 15 words', icon: '📚', color: '#a78bfa' },
    ],

    today_tasks: [
        { text: '10-min speaking drill', done: true, icon: '🎤', duration: '10 min' },
        { text: '1 Mock interview question', done: false, icon: '❓', duration: '15 min' },
        { text: 'Vocabulary revision', done: false, icon: '📝', duration: '8 min' },
    ],

    milestones: [
        { label: 'Mock Interview Scheduled', date: 'Mar 3', icon: '📅', done: false },
        { label: 'Weekly Evaluation', date: 'Mar 5', icon: '📊', done: false },
        { label: 'Certification Unlock', date: 'Mar 12', icon: '🏆', done: false },
    ],

    achievements: [
        { label: '7-Day Streak', icon: '🔥', unlocked: true },
        { label: 'First Mock', icon: '🎬', unlocked: true },
        { label: 'Top 20%', icon: '📈', unlocked: true },
        { label: 'Vocab Pro', icon: '📚', unlocked: false },
        { label: 'Perfect Score', icon: '💯', unlocked: false },
    ],

    readiness_trend: [
        { label: '9 Dec', confidence: 30, fluency: 28, score: 22 },
        { label: '17 Dec', confidence: 45, fluency: 40, score: 40 },
        { label: '18 Dec', confidence: 55, fluency: 52, score: 58 },
        { label: '27 Dec', confidence: 70, fluency: 65, score: 75 },
        { label: '30 Day', confidence: 84, fluency: 78, score: 86 },
    ],

    gamification: {
        streak: 15,
        xp: 4250,
        level: 8,
        level_label: 'MASTER INTERVIEWEE',
        next_level_progress: 65,
        rank_percentile: 84,
    },
};

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(false);
    const [taskChecked, setTaskChecked] = useState({});

    useEffect(() => {
        if (!token) return;
        dashboardApi.stats(token)
            .then(d => {
                if (!d || d.total_recordings === 0) { setStats(MOCK); setPreview(true); }
                else setStats({ ...MOCK, ...d });
                setLoading(false);
            })
            .catch(() => { setStats(MOCK); setPreview(true); setLoading(false); });
    }, [token]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 44, height: 44, border: '3.5px solid rgba(34,211,238,0.15)',
                    borderTop: '3.5px solid #22d3ee', borderRadius: '50%',
                    animation: 'spin 0.9s linear infinite', margin: '0 auto 14px',
                }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Loading your dashboard…
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const s = stats || MOCK;
    const g = s.gamification || MOCK.gamification;
    const ls = s.last_session || MOCK.last_session;

    return (
        <div style={{
            minHeight: '100vh', background: C.bg,
            padding: '20px 24px 40px',
            fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
            color: C.text,
        }}>

            {/* Preview badge */}
            {preview && (
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{
                        padding: '4px 14px', borderRadius: 100,
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                        fontSize: 9, fontWeight: 900, color: C.amber,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}>Preview Mode — Sample Data</span>
                </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* ROW 1 — Gauge + Mini Stats + Skill Breakdown */}
            {/* ════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, marginBottom: 20 }}>

                {/* ── A. Overall Progress Card ── */}
                <div style={{ ...card({ padding: '20px 16px 20px 10px' }) }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularGauge value={s.readiness_score} sessionsCount={s.total_recordings} />

                        {/* Level badge */}
                        <div style={{
                            marginTop: 6, padding: '5px 16px', borderRadius: 100,
                            background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
                            fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: '0.08em',
                        }}>
                            {s.current_level || 'Intermediate'} Level
                        </div>

                        {/* Mini stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, width: '100%', padding: '0 8px' }}>
                            <StatChip label="Skills Covered" value={`${s.skills_covered}/${s.skills_total}`} color={C.teal} icon="✅" />
                            <StatChip label="Weekly Trend" value={s.weekly_change || '+12%'} color={C.green} icon="📈" />
                            <StatChip label="Sessions Done" value={s.total_recordings} color={C.purple} icon="🎤" />
                            <StatChip label="Progress" value={`${s.overall_progress || 67}%`} color={C.amber} icon="🗺️" />
                        </div>

                        {/* Profile completion bar */}
                        <div style={{ width: '100%', padding: '12px 8px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.dim }}>Profile Completion</span>
                                <span style={{ fontSize: 10, fontWeight: 900, color: C.teal }}>{s.profile_completion || 78}%</span>
                            </div>
                            <div style={{ height: 5, background: '#0a0f18', borderRadius: 100, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ height: '100%', width: `${s.profile_completion || 78}%`, background: 'linear-gradient(90deg,#22d3ee,#0891b2)', borderRadius: 100 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── B. Skill Breakdown ── */}
                <div style={{ ...card({ padding: '18px 18px' }) }}>
                    <SectionTitle sub="Detailed skill performance scores">Skill Breakdown</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {(s.skill_breakdown || MOCK.skill_breakdown).map((sk, i) => (
                            <SkillBar key={i} skill={sk.skill} value={sk.value} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════ */}
            {/* ROW 2 — AI Insights + Action Center */}
            {/* ════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, marginBottom: 20 }}>

                {/* ── C. AI Performance Insights ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Last session feedback */}
                    <div style={{ ...card({ padding: '18px' }) }}>
                        <SectionTitle sub="From your last practice session">AI Performance Insights</SectionTitle>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                            <div style={{
                                textAlign: 'center', padding: '10px 16px', borderRadius: 12,
                                background: 'linear-gradient(135deg,rgba(34,211,238,0.1),rgba(8,145,178,0.1))',
                                border: '1px solid rgba(34,211,238,0.2)', minWidth: 80,
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{ls.score}</div>
                                <div style={{ fontSize: 9, fontWeight: 900, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginTop: 2 }}>{ls.change}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>✅ Strengths</div>
                                {ls.strengths.slice(0, 3).map((s2, i) => (
                                    <div key={i} style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ color: C.green, fontSize: 10 }}>●</span>{s2}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Weak areas */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Areas to Improve</div>
                            {ls.improvements.map((imp, i) => (
                                <div key={i} style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: C.amber, fontSize: 10 }}>●</span>{imp}
                                </div>
                            ))}
                        </div>
                        {/* Suggested exercises */}
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggested Exercises</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {ls.suggested_exercises.map((ex, i) => (
                                    <span key={i} style={{
                                        padding: '4px 10px', borderRadius: 100,
                                        background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)',
                                        fontSize: 10.5, fontWeight: 700, color: C.teal,
                                    }}>{ex}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div style={{ ...card({ padding: '16px 18px' }) }}>
                        <SectionTitle sub="Personalized for your performance">AI Suggestions</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(s.ai_suggestions || MOCK.ai_suggestions).map((sug, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 13px', borderRadius: 11,
                                    background: 'rgba(8,13,20,0.7)',
                                    border: `1px solid rgba(255,255,255,0.05)`,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}>
                                    <span style={{ fontSize: 17 }}>{sug.icon}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', flex: 1 }}>{sug.text}</span>
                                    <span style={{ fontSize: 11, color: sug.color, fontWeight: 700 }}>Start →</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── D. Action Center ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Continue Learning */}
                    <div style={{ ...card({ padding: '18px' }) }}>
                        <SectionTitle sub="Pick up where you left off">Action Center</SectionTitle>
                        <button
                            onClick={() => navigate('/practice')}
                            style={{
                                width: '100%', padding: '13px 0', borderRadius: 13,
                                background: 'linear-gradient(135deg,#0891b2,#22d3ee)',
                                border: 'none', color: 'white', fontSize: 13.5, fontWeight: 900,
                                cursor: 'pointer', letterSpacing: '0.02em',
                                boxShadow: '0 4px 20px rgba(34,211,238,0.3)',
                                transition: 'all 0.15s',
                                marginBottom: 14,
                            }}
                        >
                            ▶ Continue Learning
                        </button>

                        {/* Today's tasks */}
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                            Today's Recommended Tasks
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {(s.today_tasks || MOCK.today_tasks).map((task, i) => {
                                const isChecked = taskChecked[i] ?? task.done;
                                return (
                                    <div key={i}
                                        onClick={() => setTaskChecked(p => ({ ...p, [i]: !isChecked }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '9px 12px', borderRadius: 10,
                                            background: isChecked ? 'rgba(16,185,129,0.07)' : 'rgba(8,13,20,0.7)',
                                            border: `1px solid ${isChecked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)'}`,
                                            cursor: 'pointer', transition: 'all 0.15s',
                                        }}>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                            background: isChecked ? '#10b981' : 'transparent',
                                            border: `2px solid ${isChecked ? '#10b981' : '#334155'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {isChecked && <span style={{ fontSize: 10, color: 'white', lineHeight: 1 }}>✓</span>}
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: isChecked ? '#64748b' : '#cbd5e1', flex: 1, textDecoration: isChecked ? 'line-through' : 'none' }}>
                                            {task.icon} {task.text}
                                        </span>
                                        <span style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>{task.duration}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Milestones */}
                    <div style={{ ...card({ padding: '16px 18px' }) }}>
                        <SectionTitle sub="What's coming up">Upcoming Milestones</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {MOCK.milestones.map((m, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 12px', borderRadius: 10,
                                    background: 'rgba(8,13,20,0.7)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                }}>
                                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                                    <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>{m.label}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.amber, padding: '2px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: 100 }}>{m.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Career Tracker */}
                    <div style={{ ...card({ padding: '16px 18px' }) }}>
                        <SectionTitle sub="Interview readiness for your target role">Career Tracker</SectionTitle>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                background: 'rgba(167,139,250,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20,
                            }}>💼</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9' }}>{s.target_role || 'Data Analyst'}</div>
                                <div style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>Target Role</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: C.purple }}>{s.target_role_readiness || 76}%</div>
                                <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase' }}>Ready</div>
                            </div>
                        </div>
                        {/* Readiness bar */}
                        <div style={{ height: 7, background: '#0a0f18', borderRadius: 100, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 10 }}>
                            <div style={{
                                height: '100%', width: `${s.target_role_readiness || 76}%`,
                                background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                                borderRadius: 100, boxShadow: '0 0 8px rgba(167,139,250,0.4)',
                            }} />
                        </div>
                        {/* Company targets */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {MOCK.company_targets.map((co, i) => (
                                <span key={i} style={{
                                    padding: '3px 10px', borderRadius: 100,
                                    background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)',
                                    fontSize: 10.5, fontWeight: 700, color: '#a78bfa',
                                }}>{co}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════ */}
            {/* ROW 3 — Speaking Metrics + Historical Trend */}
            {/* ════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 20 }}>

                {/* ── E1. Speaking Metrics ── */}
                <div style={{ ...card({ padding: '18px' }) }}>
                    <SectionTitle sub="From your latest session">Speaking Metrics</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { label: 'Avg WPM', value: s.avg_speaking_speed || 138, color: C.teal, icon: '🗣️', unit: 'wpm' },
                            { label: 'Filler Words', value: s.avg_filler_words || 6, color: C.orange, icon: '🔇', unit: 'per min' },
                            { label: 'Pause Rate', value: s.pause_frequency || 3.2, color: C.purple, icon: '⏸️', unit: '/min' },
                            { label: 'Complexity', value: `${s.sentence_complexity || 74}%`, color: C.green, icon: '🧠', unit: '' },
                        ].map((m, i) => (
                            <div key={i} style={{
                                padding: '14px 12px', borderRadius: 13,
                                background: 'rgba(8,13,20,0.7)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
                                <div style={{ fontSize: 9.5, color: C.dim, fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                                {m.unit && <div style={{ fontSize: 9, color: '#334155', fontWeight: 600 }}>{m.unit}</div>}
                            </div>
                        ))}
                    </div>

                    {/* WPM gauge bar */}
                    <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.dim }}>Speaking Speed</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: s.avg_speaking_speed > 160 ? C.orange : C.green }}>
                                {(s.avg_speaking_speed || 138) < 130 ? 'Too Slow' : (s.avg_speaking_speed || 138) > 160 ? 'Too Fast' : '✓ Ideal'}
                            </span>
                        </div>
                        <div style={{ height: 7, background: '#0a0f18', borderRadius: 100, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(100, ((s.avg_speaking_speed || 138) / 200) * 100)}%`,
                                background: 'linear-gradient(90deg,#22d3ee,#06b6d4)',
                                borderRadius: 100,
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                            <span style={{ fontSize: 8.5, color: '#334155' }}>0</span>
                            <span style={{ fontSize: 8.5, color: '#10b981' }}>Ideal (130–160)</span>
                            <span style={{ fontSize: 8.5, color: '#334155' }}>200+</span>
                        </div>
                    </div>
                </div>

                {/* ── E2. Historical Trend Graph ── */}
                <div style={{ ...card({ padding: '18px' }) }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                        <SectionTitle sub="Confidence · Fluency · Interview Score over time">Historical Performance Trends</SectionTitle>
                        <div style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: 'rgba(8,13,20,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                            fontSize: 10, fontWeight: 700, color: C.dim,
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            Last 30 Days
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4l4 4 4-4" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={s.readiness_trend || MOCK.readiness_trend} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="fluGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="scGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="label" stroke="#334155" fontSize={9} fontWeight={700}
                                    tickLine={false} axisLine={false} dy={6} tick={{ fill: '#4a6080' }} />
                                <YAxis stroke="#334155" fontSize={9} fontWeight={700}
                                    tickLine={false} axisLine={false} domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#4a6080' }} />
                                <Tooltip content={<ChartTip />} />
                                <Legend
                                    iconType="circle" iconSize={7}
                                    wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }}
                                />
                                <Area type="monotone" dataKey="confidence" name="Confidence"
                                    stroke="#22d3ee" strokeWidth={2.5} fill="url(#confGrad)"
                                    dot={{ r: 3, fill: '#22d3ee', stroke: '#080d14', strokeWidth: 1.5 }} />
                                <Area type="monotone" dataKey="fluency" name="Fluency"
                                    stroke="#a78bfa" strokeWidth={2.5} fill="url(#fluGrad)"
                                    dot={{ r: 3, fill: '#a78bfa', stroke: '#080d14', strokeWidth: 1.5 }} />
                                <Area type="monotone" dataKey="score" name="Interview Score"
                                    stroke="#10b981" strokeWidth={2.5} fill="url(#scGrad)"
                                    dot={{ r: 3, fill: '#10b981', stroke: '#080d14', strokeWidth: 1.5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════ */}
            {/* ROW 4 — Gamification Strip */}
            {/* ════════════════════════════════════════ */}
            <div style={{ marginBottom: 0 }}>
                <SectionTitle sub="Keep the momentum going">Gamification</SectionTitle>
                <div style={{
                    ...card({ padding: '18px 24px' }),
                    display: 'grid',
                    gridTemplateColumns: 'auto 1px auto 1px auto 1px auto 1px auto',
                    alignItems: 'center',
                    gap: '0 0',
                }}>
                    {/* Streak */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 0 0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔥</div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                <span style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{g.streak}</span>
                                <span style={{ fontSize: 11, fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase' }}>DAY</span>
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 900, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>STREAK</div>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)' }} />

                    {/* XP */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,211,238,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⚡</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                            <span style={{ fontSize: 30, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{g.xp.toLocaleString()}</span>
                            <span style={{ fontSize: 14, fontWeight: 900, color: 'rgba(226,234,245,0.6)', textTransform: 'uppercase' }}>XP</span>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)' }} />

                    {/* Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏆</div>
                        <div style={{ flex: 1, minWidth: 100 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase' }}>Level {g.level}:</span>
                                <span style={{ fontSize: 9.5, fontWeight: 900, color: C.amber, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{g.level_label}</span>
                            </div>
                            <div style={{ height: 5, background: '#0a0f18', borderRadius: 100, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', marginTop: 6 }}>
                                <div style={{ height: '100%', width: `${g.next_level_progress}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 100 }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)' }} />

                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(167,139,250,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📊</div>
                        <div>
                            <div style={{ fontSize: 30, fontWeight: 900, color: C.purple, lineHeight: 1 }}>Top {100 - (g.rank_percentile || 84)}%</div>
                            <div style={{ fontSize: 9, fontWeight: 900, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>vs all users</div>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.06)' }} />

                    {/* Achievements */}
                    <div style={{ padding: '0 0 0 20px' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>Achievements</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {MOCK.achievements.map((a, i) => (
                                <div key={i} title={a.label} style={{
                                    padding: '5px 8px', borderRadius: 9, fontSize: 14,
                                    background: a.unlocked ? 'rgba(34,211,238,0.09)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${a.unlocked ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    filter: a.unlocked ? 'none' : 'grayscale(1) opacity(0.35)',
                                    cursor: 'pointer',
                                }}>
                                    {a.icon}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* "Enhanced Dashboard v2" badge */}
            <div style={{ position: 'fixed', bottom: 16, right: 20, zIndex: 50 }}>
                <span style={{
                    padding: '4px 13px', background: 'rgba(10,18,30,0.92)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100,
                    fontSize: 9.5, fontWeight: 700, color: '#4a6080', letterSpacing: '0.05em',
                    backdropFilter: 'blur(8px)',
                }}>Enhanced Dashboard v2</span>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
}

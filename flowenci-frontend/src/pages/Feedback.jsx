import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { recordingsApi } from '../api/recordings'
import { RotateCcw, TrendingDown, Zap, Target, ChevronDown, ChevronUp } from 'lucide-react'

function MetricBar({ label, value, max, color, unit = '' }) {
    const pct = Math.min((value / max) * 100, 100)
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold">{label}</span>
                <span className="font-mono text-sm font-bold" style={{ color }}>{value}{unit}</span>
            </div>
            <div className="h-2 rounded-full bg-[#2a2520]">
                <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}

function CoachingTipCard({ tip, index }) {
    const [open, setOpen] = useState(index === 0)
    const colors = ['#f97c0a', '#38bdf8', '#a78bfa']
    const color = colors[index % 3]
    return (
        <div className="card overflow-hidden" style={{ borderColor: open ? `${color}40` : '#2a2520' }}>
            <button onClick={() => setOpen(o => !o)} className="w-full p-5 flex items-start gap-4 text-left">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: `${color}20`, color }}>{index + 1}</div>
                <div className="flex-1">
                    <p className="font-semibold text-[#f0ebe4]">{tip.metric}</p>
                    <p className="text-sm text-[#7a6e63] mt-0.5">{tip.value}</p>
                </div>
                {open ? <ChevronUp size={16} className="text-[#7a6e63] mt-1" /> : <ChevronDown size={16} className="text-[#7a6e63] mt-1" />}
            </button>
            {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#2a2520] pt-4 animate-fade-up">
                    <div>
                        <p className="label mb-1">Why it matters</p>
                        <p className="text-sm text-[#f0ebe4]">{tip.why_it_matters}</p>
                    </div>
                    <div>
                        <p className="label mb-1">Root cause</p>
                        <p className="text-sm text-[#7a6e63]">{tip.root_cause}</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ background: `${color}08`, borderColor: `${color}30` }}>
                        <p className="label mb-1" style={{ color }}>Technique</p>
                        <p className="text-sm text-[#f0ebe4]">{tip.technique}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target size={14} style={{ color }} />
                        <p className="text-sm font-semibold" style={{ color }}>Target: {tip.target}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Feedback() {
    const { recordingId } = useParams()
    const { token } = useAuth()
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState(null)
    const [loading, setLoading] = useState(true)
    const [polling, setPolling] = useState(true)

    useEffect(() => {
        let attempts = 0
        const poll = async () => {
            try {
                const data = await recordingsApi.getFeedback(token, recordingId)
                if (data?.feedback?.readiness_score !== null && data?.feedback?.readiness_score !== undefined) {
                    setFeedback(data.feedback)
                    setPolling(false)
                    setLoading(false)
                } else if (attempts < 15) {
                    attempts++; setTimeout(poll, 2500)
                } else { setPolling(false); setLoading(false) }
            } catch {
                if (attempts < 15) { attempts++; setTimeout(poll, 2500) }
                else { setPolling(false); setLoading(false) }
            }
        }
        poll()
    }, [token, recordingId])

    if (loading || polling) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-2 border-[#2a2520] rounded-full" />
                <div className="w-16 h-16 border-2 border-brand-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-[#7a6e63] font-body">Analysing your answer…</p>
            <p className="text-[#3a342d] text-xs">Whisper is transcribing · GPT-4o-mini is coaching</p>
        </div>
    )

    if (!feedback) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-[#7a6e63]">Could not load feedback. Please try again.</p>
            <button className="btn-ghost" onClick={() => navigate(-1)}>← Go back</button>
        </div>
    )

    const wpm = feedback.words_per_minute
    const wpmColor = wpm < 120 ? '#38bdf8' : wpm <= 160 ? '#22c55e' : '#ef4444'
    const wpmLabel = wpm < 120 ? 'Too slow' : wpm <= 160 ? 'Good pace' : 'Too fast'
    const readinessColor = feedback.readiness_score >= 75 ? '#22c55e' : feedback.readiness_score >= 50 ? '#f97c0a' : '#ef4444'

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">Your Feedback</h1>
                    <p className="text-[#7a6e63] mt-1">Here's what the AI found</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold font-display" style={{ color: readinessColor }}>
                        {Math.round(feedback.readiness_score)}
                    </div>
                    <p className="text-xs text-[#7a6e63]">readiness score</p>
                </div>
            </div>

            <div className="card p-6 mb-4 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                    <TrendingDown size={16} className="text-brand-400" /> Delivery Metrics
                </h2>
                <MetricBar label="Filler Words" value={feedback.filler_word_count} max={30}
                    color={feedback.filler_word_count <= 5 ? '#22c55e' : feedback.filler_word_count <= 12 ? '#f97c0a' : '#ef4444'}
                    unit=" words" />
                {wpm && (
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-semibold">Speaking Pace</span>
                            <span className="font-mono text-sm font-bold" style={{ color: wpmColor }}>
                                {Math.round(wpm)} WPM · {wpmLabel}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#2a2520]">
                            <div className="h-2 rounded-full transition-all duration-700"
                                style={{ width: `${Math.min((wpm / 250) * 100, 100)}%`, background: wpmColor }} />
                        </div>
                        <div className="flex justify-between text-xs text-[#3a342d] mt-1">
                            <span>Slow (80)</span><span className="text-[#22c55e]">Ideal (130–160)</span><span>Fast (200+)</span>
                        </div>
                    </div>
                )}
                {feedback.star_score !== null && feedback.star_score !== undefined && (
                    <MetricBar label="STAR Structure" value={feedback.star_score} max={100} color="#a78bfa" unit="%" />
                )}
                <MetricBar label="Confidence" value={feedback.confidence_score || 0} max={100} color="#38bdf8" unit="%" />
            </div>

            {Object.keys(feedback.filler_words_detail || {}).length > 0 && (
                <div className="card p-5 mb-4">
                    <p className="label mb-3">Filler word breakdown</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(feedback.filler_words_detail).map(([word, count]) => (
                            <span key={word} className="badge bg-[#f97c0a18] text-brand-400">
                                "{word}" × {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {feedback.coaching_tips?.length > 0 && (
                <div className="mb-6">
                    <h2 className="font-semibold flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-brand-400" /> Top {feedback.coaching_tips.length} Things to Work On
                    </h2>
                    <div className="space-y-3 stagger">
                        {feedback.coaching_tips.map((tip, i) => (
                            <CoachingTipCard key={i} tip={tip} index={i} />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                    <RotateCcw size={15} /> Try Again
                </button>
                <button onClick={() => navigate('/library')} className="btn-primary flex-1">
                    Next Question →
                </button>
            </div>
        </div>
    )
}

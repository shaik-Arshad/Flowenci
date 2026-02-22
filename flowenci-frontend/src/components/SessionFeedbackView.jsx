import { CheckCircle, Target, ArrowRight, User as UserIcon, Clock, Award } from 'lucide-react'

function ScoreRing({ score }) {
    const r = 44
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f97c0a' : '#ef4444'
    return (
        <div className="relative flex justify-center mb-6">
            <svg width={120} height={120} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2520" strokeWidth="8" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dy="0.35em"
                    fill={color} fontSize="22" fontWeight="bold" fontFamily="'Playfair Display', serif">
                    {Math.round(score)}
                </text>
                <text x="50" y="66" textAnchor="middle" fill="#7a6e63" fontSize="8" letterSpacing="0.1em">SCORE</text>
            </svg>
        </div>
    )
}

export default function SessionFeedbackView({ feedback, onRetry }) {
    if (!feedback) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                    <h2 className="font-display font-bold text-2xl mb-2">Generating Report</h2>
                    <p className="text-[#7a6e63]">The AI interviewer is evaluating your performance…</p>
                </div>
            </div>
        )
    }

    const score = feedback.overall_score || 0

    return (
        <div className="p-8 max-w-3xl mx-auto pb-24">
            <div className="text-center mb-10">
                <ScoreRing score={score} />
                <h1 className="font-display text-4xl font-bold mb-3">Interview Complete</h1>
                {feedback.interview_ready && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-bold mb-4 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <CheckCircle size={16} /> You're Interview Ready!
                    </div>
                )}
                <p className="text-[#e0d6cb] text-lg max-w-xl mx-auto leading-relaxed">{feedback.summary}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="card p-5 text-center bg-[#141210]">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3"><UserIcon size={18} /></div>
                    <div className="text-2xl font-bold font-mono">{feedback.total_turns}</div>
                    <div className="text-[10px] text-[#7a6e63] uppercase tracking-widest mt-1">Questions</div>
                </div>
                <div className="card p-5 text-center bg-[#141210]">
                    <div className="w-10 h-10 rounded-full bg-[#a78bfa10] text-[#a78bfa] flex items-center justify-center mx-auto mb-3"><Clock size={18} /></div>
                    <div className="text-2xl font-bold font-mono">{Math.round((feedback.duration_seconds || 0) / 60)}m</div>
                    <div className="text-[10px] text-[#7a6e63] uppercase tracking-widest mt-1">Duration</div>
                </div>
                <div className="card p-5 text-center bg-[#141210]">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-3"><Award size={18} /></div>
                    <div className="text-2xl font-bold font-mono">{Math.round(score)}</div>
                    <div className="text-[10px] text-[#7a6e63] uppercase tracking-widest mt-1">Rating</div>
                </div>
            </div>

            {feedback.top_wins?.length > 0 && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 font-bold text-green-400 mb-4 uppercase tracking-wider text-xs">
                        <CheckCircle size={16} /> What You Did Well
                    </h3>
                    <div className="space-y-3 stagger">
                        {feedback.top_wins.map((w, i) => (
                            <div key={i} className="card p-5 border-green-900/50 bg-[#0a1f11] shadow-none">
                                <p className="font-bold text-green-400 mb-1.5">{w.point}</p>
                                <p className="text-sm text-[#94a3b8]">{w.example}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {feedback.top_improvements?.length > 0 && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 font-bold text-[#f59e0b] mb-4 uppercase tracking-wider text-xs">
                        <Target size={16} /> Areas to Improve
                    </h3>
                    <div className="space-y-3 stagger">
                        {feedback.top_improvements.map((imp, i) => (
                            <div key={i} className="card p-5 border-[#78350f50] bg-[#291c0a] shadow-none">
                                <p className="font-bold text-[#f59e0b] mb-1.5">{imp.point}</p>
                                <p className="text-sm text-[#94a3b8]">{imp.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {feedback.delivery_notes && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 font-bold text-[#38bdf8] mb-4 uppercase tracking-wider text-xs">
                        🎙️ Delivery Feedback
                    </h3>
                    <div className="card p-6 border-[#0c4a6e50] bg-[#082f4940] shadow-none">
                        <p className="text-sm text-[#bae6fd] leading-relaxed">{feedback.delivery_notes}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-center pt-4">
                <button onClick={onRetry} className="btn-primary flex items-center gap-2 px-10 py-4 text-lg">
                    Practice Again <ArrowRight size={20} />
                </button>
            </div>
        </div>
    )
}

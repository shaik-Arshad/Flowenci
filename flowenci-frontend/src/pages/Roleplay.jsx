import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleplayApi } from '../api/roleplay'
import { useInterviewWebSocket } from '../hooks/useInterviewWebSocket'
import { useAudioRecorder, formatDuration } from '../hooks/useAudioRecorder'
import SessionFeedbackView from '../components/SessionFeedbackView'
import { Bot, User as UserIcon, Mic, Square, Play, Send, CheckCircle, Settings, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const COMPANIES = ['Amazon', 'Google', 'Startup', 'Infosys', 'Generic']
const INTERVIEW_TYPES = ['Behavioral', 'Technical', 'Mixed']

// ─── Setup Screen ───────────────────────────────────────────────────────────
function RoleplaySetup({ onStart, loading }) {
    const [company, setCompany] = useState('Generic')
    const [type, setType] = useState('Behavioral')
    const [role, setRole] = useState('Software Engineer')
    const [turns, setTurns] = useState(8)

    return (
        <div className="max-w-xl mx-auto p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#a78bfa20] border border-[#a78bfa40] flex items-center justify-center mx-auto mb-4">
                    <Bot size={32} className="text-[#a78bfa]" />
                </div>
                <h1 className="font-display text-3xl font-bold">AI Interviewer</h1>
                <p className="text-[#7a6e63] mt-2">Simulate real interviews with adaptive full-voice AI.</p>
            </div>

            <div className="card p-6 space-y-6">
                <div>
                    <label className="label mb-3 block">Target Company Style</label>
                    <div className="flex flex-wrap gap-2">
                        {COMPANIES.map(c => (
                            <button key={c} onClick={() => setCompany(c)}
                                className={clsx('px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
                                    company === c ? 'border-[#a78bfa] bg-[#a78bfa15] text-[#a78bfa]' : 'border-[#2a2520] text-[#7a6e63] hover:border-[#3a342d]')}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label mb-3 block">Interview Type</label>
                    <div className="flex flex-wrap gap-2">
                        {INTERVIEW_TYPES.map(t => (
                            <button key={t} onClick={() => setType(t)}
                                className={clsx('px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
                                    type === t ? 'border-[#a78bfa] bg-[#a78bfa15] text-[#a78bfa]' : 'border-[#2a2520] text-[#7a6e63] hover:border-[#3a342d]')}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label mb-2 block">Target Role</label>
                    <input type="text" className="input-field" value={role} onChange={e => setRole(e.target.value)} />
                </div>

                <div>
                    <label className="label mb-2 flex justify-between">
                        <span>Interview Length (Questions)</span>
                        <span className="text-[#a78bfa]">{turns}</span>
                    </label>
                    <input type="range" min="3" max="15" value={turns} onChange={e => setTurns(parseInt(e.target.value))}
                        className="w-full accent-[#a78bfa]" />
                </div>

                <button onClick={() => onStart({ company, interviewType: type.toLowerCase(), role, maxTurns: turns })} disabled={loading}
                    className="w-full py-4 bg-[#a78bfa] hover:bg-[#9333ea] text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                    {loading ? 'Starting Session…' : 'Start Interview →'}
                </button>
            </div>
        </div>
    )
}

// ─── Active Session Screen ──────────────────────────────────────────────────
function ActiveSession({ sessionInfo, onShowFeedback }) {
    const { token, user } = useAuth()
    const [textAnswer, setTextAnswer] = useState('')
    const scrollRef = useRef(null)

    const {
        messages, status, currentTurn, maxTurns, audioRef,
        connect, sendAnswer, endSession
    } = useInterviewWebSocket(sessionInfo.session_id)

    const recorder = useAudioRecorder()

    useEffect(() => { connect() }, [connect])

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages])

    const handleEnd = async () => {
        endSession()
        try {
            const fb = await roleplayApi.endSession(token, sessionInfo.db_session_id)
            onShowFeedback(fb)
        } catch {
            // Allow parent to handle fallback if needed
        }
    }

    const handleSendText = () => {
        if (!textAnswer.trim() || status !== 'connected') return
        sendAnswer(textAnswer.trim())
        setTextAnswer('')
    }

    const handleVoiceSubmit = () => {
        if (!recorder.audioBlob) return
        alert('Voice answers coming soon! Please type your answer for now.')
        recorder.reset()
    }

    // Auto-terminate when WS says ended
    useEffect(() => {
        if (status === 'ended') {
            roleplayApi.endSession(token, sessionInfo.db_session_id)
                .then(fb => onShowFeedback(fb))
                .catch(() => { })
        }
    }, [status, token, sessionInfo, onShowFeedback])

    return (
        <div className="flex flex-col h-full bg-[#0a0806]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2a2520] flex items-center justify-between bg-[#141210]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#a78bfa20] flex items-center justify-center">
                        <Bot size={20} className="text-[#a78bfa]" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[#f0ebe4]">{sessionInfo.config.company} Interviewer</h2>
                        <p className="text-xs text-[#7a6e63]">
                            {status === 'connecting' ? 'Connecting…' : status === 'connected' ? '🟢 Online' : 'Session Ended'}
                            {' · '}{currentTurn} / {maxTurns} questions
                        </p>
                    </div>
                </div>
                <button onClick={handleEnd} className="btn-ghost py-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
                    Leave
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={clsx('flex gap-4 max-w-3xl', m.role === 'candidate' ? 'ml-auto flex-row-reverse' : '')}>
                        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                            m.role === 'candidate' ? 'bg-brand-500/20 text-brand-400' :
                                m.role === 'system' ? 'bg-red-500/20 text-red-400' : 'bg-[#a78bfa20] text-[#a78bfa]')}>
                            {m.role === 'candidate' ? <UserIcon size={14} /> : m.role === 'system' ? '!' : <Bot size={14} />}
                        </div>
                        <div className={clsx('px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                            m.role === 'candidate' ? 'bg-brand-500/10 text-[#f0ebe4] rounded-tr-sm border border-brand-500/20' :
                                m.role === 'system' ? 'bg-red-500/10 text-red-300 rounded-tl-sm border border-red-500/20' :
                                    'bg-[#1a1612] text-[#e0d6cb] rounded-tl-sm border border-[#2a2520]')}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {status === 'connecting' && (
                    <div className="flex gap-4 max-w-3xl">
                        <div className="w-8 h-8 rounded-full bg-[#a78bfa20] flex items-center justify-center animate-pulse" />
                        <div className="px-5 py-4 rounded-2xl bg-[#1a1612] border border-[#2a2520] text-[#7a6e63] text-sm animate-pulse">
                            Interviewer is joining…
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#141210] border-t border-[#2a2520]">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    {recorder.status !== 'idle' ? (
                        <div className="flex items-center gap-4 bg-[#1a1612] border border-[#f97c0a50] p-3 rounded-2xl">
                            <div className="w-3 h-3 rounded-full bg-[#f97c0a] animate-pulse" />
                            <div className="font-mono font-bold text-[#f97c0a]">{formatDuration(recorder.duration)}</div>
                            <div className="flex-1 px-4"><div className="wave-bar w-full h-2 bg-brand-500/30 rounded-full" /></div>
                            {recorder.status === 'recording' ? (
                                <button onClick={recorder.stopRecording} className="p-3 bg-[#1a1612] rounded-xl hover:bg-[#2a2520] text-red-400">
                                    <Square size={20} className="fill-current" />
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => { const a = new Audio(recorder.audioUrl); a.play() }} className="p-3 bg-[#1a1612] rounded-xl hover:bg-[#2a2520]">
                                        <Play size={20} />
                                    </button>
                                    <button onClick={handleVoiceSubmit} className="btn-primary py-2 px-6">Send Voice</button>
                                    <button onClick={recorder.reset} className="btn-ghost py-2">Cancel</button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="relative flex items-end gap-2">
                            <button disabled className="p-3.5 rounded-xl bg-[#1a1612] border border-[#2a2520] text-[#7a6e63] cursor-not-allowed opacity-50" title="Voice coming soon">
                                <Mic size={20} />
                            </button>
                            <textarea
                                className="input-field min-h-[52px] max-h-32 resize-none py-3.5"
                                placeholder="Type your answer here…"
                                value={textAnswer}
                                onChange={e => setTextAnswer(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                                disabled={status !== 'connected'}
                            />
                            <button onClick={handleSendText} disabled={!textAnswer.trim() || status !== 'connected'}
                                className="p-3.5 rounded-xl bg-[#a78bfa] text-white hover:bg-[#9333ea] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <audio ref={audioRef} className="hidden" />
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Roleplay() {
    const { token } = useAuth()
    const [sessionInfo, setSessionInfo] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleStart = async (config) => {
        setLoading(true)
        try {
            const data = await roleplayApi.startSession(token, config)
            setSessionInfo({ ...data, config })
        } catch (err) {
            alert('Failed to start session.')
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setSessionInfo(null)
        setFeedback(null)
    }

    if (feedback) {
        return <SessionFeedbackView feedback={feedback} onRetry={reset} />
    }

    if (sessionInfo) {
        return <ActiveSession sessionInfo={sessionInfo} onShowFeedback={setFeedback} />
    }

    return <RoleplaySetup onStart={handleStart} loading={loading} />
}

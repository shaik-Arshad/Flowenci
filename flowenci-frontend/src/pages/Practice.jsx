import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { questionsApi } from '../api/questions'
import { recordingsApi } from '../api/recordings'
import { useAudioRecorder, formatDuration } from '../hooks/useAudioRecorder'
import { Mic, Square, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function Waveform({ active }) {
    const bars = 24
    return (
        <div className="flex items-center gap-1 h-12">
            {[...Array(bars)].map((_, i) => (
                <div key={i}
                    className={clsx('w-1 rounded-full transition-all', active ? 'wave-bar' : 'bg-[#2a2520]')}
                    style={{
                        height: active ? `${20 + Math.random() * 60}%` : '20%',
                        background: active ? '#f97c0a' : '#2a2520',
                        animationDelay: active ? `${i * 0.05}s` : '0s',
                    }}
                />
            ))}
        </div>
    )
}

export default function Practice() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const questionId = searchParams.get('question')

    const [question, setQuestion] = useState(null)
    const [phase, setPhase] = useState('ready')
    const [playback, setPlayback] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [recordingId, setRecordingId] = useState(null)
    const recorder = useAudioRecorder()

    useEffect(() => {
        if (questionId) questionsApi.get(token, questionId).then(setQuestion).catch(() => { })
    }, [token, questionId])

    useEffect(() => {
        if (recorder.audioUrl) {
            const audio = new Audio(recorder.audioUrl)
            audio.onended = () => setIsPlaying(false)
            setPlayback(audio)
            setPhase('reviewing')
        }
    }, [recorder.audioUrl])

    const handleRecord = async () => { setPhase('recording'); await recorder.startRecording() }
    const handleStop = () => { recorder.stopRecording() }
    const handlePlayback = () => {
        if (!playback) return
        if (isPlaying) { playback.pause(); setIsPlaying(false) }
        else { playback.play(); setIsPlaying(true) }
    }
    const handleReRecord = () => { playback?.pause(); recorder.reset(); setPhase('ready'); setIsPlaying(false) }

    const handleSubmit = async () => {
        if (!recorder.audioBlob) return
        setPhase('uploading')
        try {
            const result = await recordingsApi.upload(token, recorder.audioBlob, questionId)
            const { recording_id } = result
            await recordingsApi.analyze(token, recording_id)
            setRecordingId(recording_id)
            setPhase('done')
            toast.success('Answer submitted! AI is analysing…')
        } catch (err) {
            toast.error('Upload failed. Please try again.')
            setPhase('reviewing')
        }
    }

    const tooShort = recorder.duration > 0 && recorder.duration < 20
    const tooLong = question && recorder.duration > question.target_duration_max + 30

    return (
        <div className="p-8 max-w-2xl mx-auto">
            {question ? (
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="badge bg-brand-500/15 text-brand-400">{question.category?.replace('_', ' ')}</span>
                        {question.use_star && <span className="badge bg-[#38bdf818] text-[#38bdf8]">⭐ STAR</span>}
                        <span className="text-[#7a6e63] text-xs ml-auto">🎯 {question.target_duration_min}–{question.target_duration_max}s</span>
                    </div>
                    <h2 className="font-display text-xl font-bold leading-snug">{question.text}</h2>
                    {question.guidance && (
                        <div className="mt-4 p-3 rounded-xl bg-[#1e1b18] border border-[#2a2520]">
                            <div className="flex gap-2 items-start">
                                <Lightbulb size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#7a6e63] leading-relaxed">{question.guidance}</p>
                            </div>
                        </div>
                    )}
                    {question.use_star && (
                        <div className="mt-3 flex gap-2">
                            {['Situation', 'Task', 'Action', 'Result'].map(s => (
                                <span key={s} className="badge bg-[#2a2520] text-[#7a6e63] text-xs">{s[0]}</span>
                            ))}
                            <span className="text-[#3a342d] text-xs flex items-center">← structure your answer</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card p-6 mb-6 animate-pulse h-32" />
            )}

            <div className="card p-8 flex flex-col items-center gap-6">
                <div className="text-center">
                    <div className="font-mono text-5xl font-bold tracking-tight"
                        style={{ color: tooShort ? '#f59e0b' : tooLong ? '#ef4444' : '#f0ebe4' }}>
                        {formatDuration(recorder.duration)}
                    </div>
                    {tooShort && recorder.status === 'recording' && (
                        <p className="text-xs text-[#f59e0b] mt-1">Keep going, answer seems short…</p>
                    )}
                    {tooLong && <p className="text-xs text-[#ef4444] mt-1">Answer is getting long, try wrapping up</p>}
                </div>

                <Waveform active={recorder.status === 'recording'} />

                {recorder.error && (
                    <div className="flex items-center gap-2 text-[#ef4444] text-sm bg-[#ef444415] px-4 py-2 rounded-xl">
                        <AlertCircle size={15} /> {recorder.error}
                    </div>
                )}

                {phase === 'ready' && (
                    <button id="start-recording" onClick={handleRecord}
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-brand-500 hover:bg-brand-400 active:scale-95 transition-all shadow-lg shadow-brand-500/30">
                        <Mic size={32} className="text-white" />
                    </button>
                )}
                {phase === 'recording' && (
                    <button id="stop-recording" onClick={handleStop}
                        className="w-20 h-20 rounded-full flex items-center justify-center recording-pulse bg-[#ef4444] hover:bg-red-400 active:scale-95 transition-all">
                        <Square size={28} className="text-white fill-white" />
                    </button>
                )}
                {phase === 'reviewing' && (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex gap-3">
                            <button onClick={handlePlayback} className="flex items-center gap-2 btn-ghost px-5">
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                {isPlaying ? 'Pause' : 'Play back'}
                            </button>
                            <button onClick={handleReRecord} className="flex items-center gap-2 btn-ghost px-5">
                                <RotateCcw size={15} /> Re-record
                            </button>
                        </div>
                        <button id="submit-answer" onClick={handleSubmit} className="btn-primary px-10 text-base">
                            Submit for AI Feedback →
                        </button>
                    </div>
                )}
                {phase === 'uploading' && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[#7a6e63] text-sm">Uploading & analysing…</p>
                    </div>
                )}
                {phase === 'done' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle size={48} className="text-green-500" />
                        <p className="text-[#7a6e63] text-sm text-center">
                            AI is processing your answer.<br />Results ready in ~10 seconds.
                        </p>
                        <button id="view-feedback" onClick={() => navigate(`/feedback/${recordingId}`)} className="btn-primary">
                            View Feedback →
                        </button>
                    </div>
                )}
            </div>

            {phase === 'ready' && (
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {['Speak clearly', 'No rush', 'It\'s private'].map(tip => (
                        <div key={tip} className="p-3 rounded-xl bg-[#141210] border border-[#2a2520] text-xs text-[#7a6e63]">
                            {tip}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

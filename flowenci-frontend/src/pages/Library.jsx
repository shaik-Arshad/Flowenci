import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { questionsApi } from '../api/questions'
import { Search, Filter, ChevronRight, BookOpen, Zap, Star } from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = [
    { key: '', label: 'All', emoji: '🎯' },
    { key: 'behavioral', label: 'Behavioral', emoji: '🧠' },
    { key: 'technical', label: 'Technical', emoji: '💻' },
    { key: 'situational', label: 'Situational', emoji: '💡' },
    { key: 'culture_fit', label: 'Culture Fit', emoji: '💼' },
]

const DIFFICULTIES = ['', 'easy', 'medium', 'hard']

function QuestionCard({ q, onClick }) {
    return (
        <button onClick={onClick}
            className="card p-5 w-full text-left group hover:border-brand-500/40 hover:bg-brand-500/5 transition-all">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={clsx('badge', {
                            'bg-green-500/15 text-green-400': q.difficulty === 'easy',
                            'bg-brand-500/15 text-brand-400': q.difficulty === 'medium',
                            'bg-red-500/15 text-red-400': q.difficulty === 'hard',
                        })}>{q.difficulty}</span>
                        {q.use_star && (
                            <span className="badge bg-[#a78bfa18] text-[#a78bfa] flex items-center gap-1">
                                <Star size={10} /> STAR
                            </span>
                        )}
                        <span className="text-[#3a342d] text-xs ml-auto">
                            🎯 {q.target_duration_min}–{q.target_duration_max}s
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-[#f0ebe4] group-hover:text-white transition-colors leading-relaxed">
                        {q.text}
                    </p>
                    {q.guidance && (
                        <p className="text-xs text-[#3a342d] mt-1.5 line-clamp-1">{q.guidance}</p>
                    )}
                </div>
                <ChevronRight size={16} className="text-[#3a342d] group-hover:text-brand-400 transition-colors flex-shrink-0 mt-0.5" />
            </div>
        </button>
    )
}

export default function Library() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [questions, setQs] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [starOnly, setStarOnly] = useState(false)

    useEffect(() => {
        setLoading(true)
        const params = { limit: 50, offset: 0 }
        if (category) params.category = category
        if (difficulty) params.difficulty = difficulty
        if (starOnly) params.use_star = true
        if (search) params.search = search

        questionsApi.list(token, params)
            .then(data => { setQs(data.questions || []); setTotal(data.total || 0) })
            .catch(() => setQs([]))
            .finally(() => setLoading(false))
    }, [token, category, difficulty, starOnly, search])

    const handlePractice = (q) => {
        navigate(`/practice?question=${q.id}`)
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-1">Question Library</h1>
                <p className="text-[#7a6e63] text-sm">{total} questions across all categories</p>
            </div>

            {/* Search + Filters */}
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a342d]" />
                    <input
                        id="question-search"
                        type="search"
                        className="input-field pl-10 w-full"
                        placeholder="Search questions…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(c => (
                        <button key={c.key} onClick={() => setCategory(c.key)}
                            className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all', {
                                'border-brand-500 bg-brand-500/10 text-brand-400': category === c.key,
                                'border-[#2a2520] text-[#7a6e63] hover:border-[#3a342d]': category !== c.key,
                            })}>
                            <span>{c.emoji}</span> {c.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                    <span className="label mr-1">Difficulty:</span>
                    {DIFFICULTIES.map(d => (
                        <button key={d || 'all'} onClick={() => setDifficulty(d)}
                            className={clsx('px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all capitalize', {
                                'border-brand-500 bg-brand-500/10 text-brand-400': difficulty === d,
                                'border-[#2a2520] text-[#7a6e63]': difficulty !== d,
                            })}>
                            {d || 'All'}
                        </button>
                    ))}

                    <div className="ml-3 flex items-center gap-2">
                        <button onClick={() => setStarOnly(s => !s)}
                            className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all', {
                                'border-[#a78bfa] bg-[#a78bfa18] text-[#a78bfa]': starOnly,
                                'border-[#2a2520] text-[#7a6e63]': !starOnly,
                            })}>
                            <Star size={11} /> STAR only
                        </button>
                    </div>
                </div>
            </div>

            {/* Question list */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-5 h-20 animate-pulse" />
                    ))}
                </div>
            ) : questions.length === 0 ? (
                <div className="card p-12 text-center">
                    <BookOpen size={40} className="text-[#2a2520] mx-auto mb-3" />
                    <p className="text-[#7a6e63]">No questions match your filters.</p>
                    <button className="btn-ghost mt-4 text-sm" onClick={() => { setCategory(''); setDifficulty(''); setStarOnly(false); setSearch('') }}>
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-3 stagger">
                    {questions.map(q => (
                        <QuestionCard key={q.id} q={q} onClick={() => handlePractice(q)} />
                    ))}
                </div>
            )}
        </div>
    )
}

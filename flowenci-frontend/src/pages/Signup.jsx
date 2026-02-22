import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import { Mic, ChevronRight, ChevronLeft } from 'lucide-react'

const TIMELINES = ['This week', '2 weeks', '1 month', '3 months', 'Just exploring']
const LEVELS = ['Student', 'Fresher (0-1 year)', 'Early professional (1-2 years)']

export default function Signup() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        interview_timeline: '', experience_level: 'student',
        target_companies: '',
    })
    const { login } = useAuth()
    const navigate = useNavigate()

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                interview_timeline: form.interview_timeline,
                experience_level: form.experience_level.toLowerCase().split(' ')[0],
                target_companies: form.target_companies,
            }
            const data = await authApi.signup(payload)
            login(data)
            toast.success(`Welcome to Flowenci, ${data.user.name.split(' ')[0]}! 🎙️`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0e0c0a]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                        <Mic size={26} className="text-brand-400" />
                    </div>
                    <h1 className="font-display text-3xl font-bold">
                        {step === 1 ? 'Create your account' : 'Set your goals'}
                    </h1>
                    <p className="text-[#7a6e63] mt-1 text-sm">
                        {step === 1 ? 'Free forever. No credit card.' : 'Help us personalize your coaching.'}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-6">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-brand-500' : 'bg-[#2a2520]'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-500' : 'bg-[#2a2520]'}`} />
                </div>

                <div className="card p-8">
                    {step === 1 ? (
                        <div className="space-y-5">
                            <div>
                                <label className="label mb-2 block">Full Name</label>
                                <input id="name" type="text" className="input-field" placeholder="Priya Sharma"
                                    value={form.name} onChange={e => update('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label mb-2 block">Email</label>
                                <input id="signup-email" type="email" className="input-field" placeholder="you@example.com"
                                    value={form.email} onChange={e => update('email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label mb-2 block">Password</label>
                                <input id="signup-password" type="password" className="input-field" placeholder="At least 8 characters"
                                    value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
                            </div>
                            <button id="next-step-btn"
                                onClick={() => { if (form.name && form.email && form.password.length >= 8) setStep(2); else toast.error('Please fill all fields (min 8 char password)') }}
                                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="label mb-3 block">Interview timeline</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TIMELINES.map(t => (
                                        <button key={t} onClick={() => update('interview_timeline', t)}
                                            className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all text-left ${form.interview_timeline === t
                                                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                                                    : 'border-[#2a2520] text-[#7a6e63] hover:border-[#3a342d]'
                                                }`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label mb-3 block">Experience level</label>
                                <div className="space-y-2">
                                    {LEVELS.map(l => (
                                        <button key={l} onClick={() => update('experience_level', l)}
                                            className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all text-left ${form.experience_level === l
                                                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                                                    : 'border-[#2a2520] text-[#7a6e63] hover:border-[#3a342d]'
                                                }`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label mb-2 block">Target companies (optional)</label>
                                <input type="text" className="input-field" placeholder="Google, Amazon, Infosys…"
                                    value={form.target_companies} onChange={e => update('target_companies', e.target.value)} />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-ghost px-5 flex items-center gap-1">
                                    <ChevronLeft size={16} /> Back
                                </button>
                                <button id="create-account-btn" onClick={handleSubmit} disabled={loading}
                                    className="btn-primary flex-1 py-3.5">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating account…
                                        </span>
                                    ) : 'Start Practicing →'}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-sm text-[#7a6e63] mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

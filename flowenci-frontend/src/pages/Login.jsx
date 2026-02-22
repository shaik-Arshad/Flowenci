import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import { Mic, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await authApi.login({ email, password })
            login(data)
            toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 🎙️`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0e0c0a]">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                        <Mic size={26} className="text-brand-400" />
                    </div>
                    <h1 className="font-display text-3xl font-bold">Welcome back</h1>
                    <p className="text-[#7a6e63] mt-1 text-sm">Sign in to continue your practice</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label mb-2 block">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPw ? 'text' : 'password'}
                                    className="input-field pr-12"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a342d] hover:text-[#7a6e63] transition-colors">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" id="login-btn" disabled={loading}
                            className="btn-primary w-full py-3.5 text-base mt-2">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#7a6e63] mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
                            Sign up free
                        </Link>
                    </p>
                </div>

                {/* Demo creds hint */}
                <p className="text-center text-xs text-[#3a342d] mt-4">
                    New here? Create a free account — no credit card needed.
                </p>
            </div>
        </div>
    )
}

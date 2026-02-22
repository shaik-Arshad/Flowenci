import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, Mic, Bot, LogOut, Zap } from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/library', icon: BookOpen, label: 'Question Library' },
    { to: '/practice', icon: Mic, label: 'Practice' },
    { to: '/roleplay', icon: Bot, label: 'AI Interviewer' },
]

export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="flex h-screen bg-[#0e0c0a] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#2a2520] flex flex-col bg-[#0a0806] flex-shrink-0">
                {/* Brand */}
                <div className="px-6 py-6 border-b border-[#2a2520]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg">🎙️</div>
                        <div>
                            <p className="font-display font-bold text-[#f0ebe4]">Flowenci</p>
                            <p className="text-[10px] text-[#7a6e63] uppercase tracking-widest">Interview Coach</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                    : 'text-[#7a6e63] hover:text-[#f0ebe4] hover:bg-[#1a1612]'
                                }`
                            }>
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Upgrade */}
                <div className="p-4 border-t border-[#2a2520] space-y-3">
                    {!user?.is_paid && (
                        <div className="card p-4 bg-brand-500/5 border-brand-500/20">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Zap size={14} className="text-brand-400" />
                                <p className="text-xs font-bold text-brand-400">Upgrade to Pro</p>
                            </div>
                            <p className="text-[10px] text-[#7a6e63] leading-relaxed">
                                Unlock unlimited practice, AI roleplay, and detailed analytics.
                            </p>
                            <button className="mt-2 w-full py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-400 transition-colors">
                                Get Pro — ₹999
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{user?.name}</p>
                            <p className="text-[10px] text-[#7a6e63] truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-[#1a1612] text-[#3a342d] hover:text-[#ef4444] transition-colors">
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

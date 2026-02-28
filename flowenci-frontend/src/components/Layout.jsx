import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, LogOut, ChevronDown } from 'lucide-react'

/* ── Flowenci "F" logo ─────────────────────────────── */
function FlowenciF({ size = 38 }) {
    const r = Math.round(size * 0.26)
    return (
        <div style={{
            width: size, height: size, borderRadius: r, flexShrink: 0,
            background: 'linear-gradient(145deg,#1dd4f0 0%,#0891b2 55%,#0e6e8a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px 3px rgba(29,212,240,0.30)',
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
    )
}

/* ── Nav icons ─────────────────────────────────────── */
const Ic = {
    Dashboard: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill={a ? '#22d3ee' : '#4a6080'} />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill={a ? '#22d3ee' : '#4a6080'} />
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill={a ? '#22d3ee' : '#4a6080'} />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill={a ? '#22d3ee' : '#4a6080'} />
        </svg>
    ),
    Practice: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.7" />
            <path d="M8 7l5 3-5 3V7z" fill={a ? '#22d3ee' : '#4a6080'} />
        </svg>
    ),
    MockInterviews: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="11" rx="2" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.7" />
            <path d="M7 17h6M10 14v3" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    ),
    Analytics: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <path d="M2 16L6 10l4 3 4-6 4 4" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Vocabulary: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="2" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.7" />
            <path d="M6 7h8M6 10h6M6 13h4" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Settings: ({ a }) => (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2.8" stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.6" />
            <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4"
                stroke={a ? '#22d3ee' : '#4a6080'} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
}

const NAV = [
    { to: '/dashboard', label: 'Dashboard', Ico: Ic.Dashboard },
    { to: '/practice', label: 'Practice', Ico: Ic.Practice },
    { to: '/roleplay', label: 'Mock Interviews', Ico: Ic.MockInterviews },
    { to: '/library', label: 'Analytics', Ico: Ic.Analytics },
    { to: '/feedback/0', label: 'Vocabulary', Ico: Ic.Vocabulary },
]

/* ── Layout ────────────────────────────────────────── */
export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <div style={{
            display: 'flex', height: '100vh', overflow: 'hidden',
            background: '#080d14', color: '#e2eaf5',
            fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
        }}>
            {/* ── Sidebar ── */}
            <aside style={{
                width: 94, background: '#0a1322',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 20, paddingBottom: 16,
                flexShrink: 0, zIndex: 10,
            }}>
                {/* Logo */}
                <div style={{ marginBottom: 20 }}>
                    <FlowenciF size={42} />
                </div>
                <div style={{ width: 46, height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 14 }} />

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', padding: '0 8px', overflowY: 'auto' }}>
                    {NAV.map(({ to, label, Ico }) => (
                        <NavLink key={to} to={to} style={{ textDecoration: 'none', width: '100%' }}>
                            {({ isActive }) => (
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    padding: '9px 4px 7px', borderRadius: 13,
                                    background: isActive ? 'rgba(34,211,238,0.12)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(34,211,238,0.22)' : 'transparent'}`,
                                    cursor: 'pointer', gap: 5,
                                    transition: 'all 0.15s',
                                }}>
                                    <Ico a={isActive} />
                                    <span style={{
                                        fontSize: 8.5, fontWeight: 700,
                                        color: isActive ? '#22d3ee' : '#4a6080',
                                        textAlign: 'center', lineHeight: 1.3,
                                        letterSpacing: '0.01em',
                                    }}>{label}</span>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ width: '100%', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <NavLink to="/settings" style={{ textDecoration: 'none', width: '100%' }}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '9px 4px 7px', borderRadius: 13, gap: 5, cursor: 'pointer',
                                background: isActive ? 'rgba(34,211,238,0.12)' : 'transparent',
                                border: `1px solid ${isActive ? 'rgba(34,211,238,0.22)' : 'transparent'}`,
                            }}>
                                <Ic.Settings a={isActive} />
                                <span style={{ fontSize: 8.5, fontWeight: 700, color: isActive ? '#22d3ee' : '#4a6080' }}>Settings</span>
                            </div>
                        )}
                    </NavLink>
                    <button onClick={() => { logout(); navigate('/login') }}
                        style={{
                            width: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', padding: '9px 4px 7px',
                            borderRadius: 13, background: 'transparent',
                            border: '1px solid transparent', cursor: 'pointer', gap: 4,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.09)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={17} color="#4a6080" />
                        <span style={{ fontSize: 8.5, fontWeight: 700, color: '#4a6080' }}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top bar */}
                <header style={{
                    height: 56, background: '#080d14',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center',
                    padding: '0 24px', gap: 16, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <FlowenciF size={30} />
                        <span style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                            Flowenci
                        </span>
                        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 10px', background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee' }}>AI Interview Track</span>
                            <ChevronDown size={12} color="#22d3ee" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Notification bell */}
                        <div style={{
                            width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <Bell size={16} color="#4a6080" />
                            <div style={{
                                position: 'absolute', top: 7, right: 8, width: 7, height: 7,
                                borderRadius: '50%', background: '#22d3ee',
                                border: '1.5px solid #080d14',
                            }} />
                        </div>
                        {/* Profile avatar */}
                        <div style={{
                            width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
                            background: 'linear-gradient(135deg,#22d3ee,#0891b2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 900, color: 'white',
                            boxShadow: '0 0 10px rgba(34,211,238,0.25)',
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#e2eaf5', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: 9.5, color: '#4a6080', fontWeight: 600 }}>Pro Member</div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflowY: 'auto', background: '#080d14' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}

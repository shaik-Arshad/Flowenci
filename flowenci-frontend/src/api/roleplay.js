import client from './client'

const WS_BASE = 'ws://localhost:8000'

export const roleplayApi = {
    startSession: (token, config) => client.post('/roleplay/start', {
        company_key: config.company?.toLowerCase() || 'generic',
        interview_type: config.interviewType || 'behavioral',
        role: config.role || 'Software Engineer',
        max_turns: config.maxTurns || 8,
    }, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),

    endSession: (token, dbSessionId) => client.post(
        `/roleplay/session/${dbSessionId}/end`, {},
        { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.data),

    getFeedback: (token, dbSessionId) => client.get(
        `/roleplay/session/${dbSessionId}/feedback`,
        { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.data),

    listSessions: (token) => client.get('/roleplay/sessions', {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),

    wsUrl: (sessionId) => `${WS_BASE}/roleplay/session/${sessionId}`,
}

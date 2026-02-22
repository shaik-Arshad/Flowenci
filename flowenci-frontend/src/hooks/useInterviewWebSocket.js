import { useState, useRef, useEffect, useCallback } from 'react'
import { roleplayApi } from '../api/roleplay'

export function useInterviewWebSocket(sessionId) {
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState('idle')   // idle | connecting | connected | ended
    const [currentTurn, setCurrentTurn] = useState(0)
    const [maxTurns, setMaxTurns] = useState(8)
    const wsRef = useRef(null)
    const audioRef = useRef(null)

    const connect = useCallback(() => {
        if (!sessionId) return
        setStatus('connecting')
        const ws = new WebSocket(roleplayApi.wsUrl(sessionId))
        wsRef.current = ws

        ws.onopen = () => setStatus('connected')

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)

            if (msg.type === 'error') {
                setMessages(m => [...m, { role: 'system', content: `⚠️ ${msg.content}` }])
                return
            }
            if (msg.type === 'pong') return

            if (msg.type === 'question' || msg.type === 'follow_up') {
                setMessages(m => [...m, { role: 'interviewer', content: msg.content }])
                setCurrentTurn(msg.turn || 0)
                setMaxTurns(msg.max_turns || 8)
                if (msg.audio_b64 && audioRef.current) {
                    audioRef.current.src = `data:audio/mp3;base64,${msg.audio_b64}`
                    audioRef.current.play().catch(() => { })
                }
            }
            if (msg.type === 'session_end') {
                setMessages(m => [...m, { role: 'interviewer', content: msg.content }])
                setStatus('ended')
            }
        }

        ws.onclose = () => { if (status !== 'ended') setStatus('ended') }
        ws.onerror = () => setStatus('ended')
    }, [sessionId])

    const sendAnswer = useCallback((content) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            setMessages(m => [...m, { role: 'candidate', content }])
            wsRef.current.send(JSON.stringify({ type: 'answer', content }))
        }
    }, [])

    const endSession = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'end_session', content: '' }))
        }
        setStatus('ended')
    }, [])

    useEffect(() => () => { wsRef.current?.close() }, [])

    return { messages, status, currentTurn, maxTurns, audioRef, connect, sendAnswer, endSession }
}

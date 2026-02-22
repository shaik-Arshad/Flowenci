import { useState, useRef, useEffect } from 'react'

export function formatDuration(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function useAudioRecorder() {
    const [status, setStatus] = useState('idle')   // idle | recording | stopped
    const [duration, setDuration] = useState(0)
    const [audioUrl, setAudioUrl] = useState(null)
    const [audioBlob, setAudioBlob] = useState(null)
    const [error, setError] = useState(null)

    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)

    const startRecording = async () => {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mr = new MediaRecorder(stream)
            mediaRecorderRef.current = mr
            chunksRef.current = []

            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                setStatus('stopped')
                stream.getTracks().forEach(t => t.stop())
            }

            mr.start(250)
            setStatus('recording')
            setDuration(0)

            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access.')
            setStatus('idle')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
        clearInterval(timerRef.current)
    }

    const reset = () => {
        stopRecording()
        setStatus('idle')
        setDuration(0)
        setAudioUrl(null)
        setAudioBlob(null)
        setError(null)
        chunksRef.current = []
    }

    useEffect(() => () => { clearInterval(timerRef.current) }, [])

    return { status, duration, audioUrl, audioBlob, error, startRecording, stopRecording, reset }
}

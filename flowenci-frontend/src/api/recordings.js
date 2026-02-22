import client from './client'
import axios from 'axios'

export const recordingsApi = {
    upload: async (token, audioBlob, questionId, attemptNumber = 1) => {
        const form = new FormData()
        form.append('file', audioBlob, 'recording.webm')
        if (questionId) form.append('question_id', questionId)
        form.append('attempt_number', String(attemptNumber))
        return client.post('/recordings/upload', form, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data)
    },

    analyze: (token, recordingId) => client.post('/feedback/analyze', null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { recording_id: recordingId },
    }).then(r => r.data),

    getFeedback: (token, recordingId) => client.get(`/feedback/${recordingId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),
}

export const dashboardApi = {
    stats: (token) => client.get('/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),
}

import client from './client'

export const authApi = {
    signup: (data) => client.post('/auth/signup', data).then(r => r.data),
    login: (data) => client.post('/auth/login', data).then(r => r.data),
    me: (token) => client.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),
    logout: (token) => client.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),
}

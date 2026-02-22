import client from './client'

export const questionsApi = {
    list: (token, params = {}) => client.get('/questions', {
        headers: { Authorization: `Bearer ${token}` },
        params,
    }).then(r => r.data),

    categories: (token) => client.get('/questions/categories', {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),

    get: (token, id) => client.get(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),
}

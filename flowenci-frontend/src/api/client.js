import axios from 'axios'

const API_BASE = 'http://localhost:8000'

const client = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

export function authHeader(token) {
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export default client

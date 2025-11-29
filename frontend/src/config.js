const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Auto-determine WebSocket protocol based on API URL (ws:// for http://, wss:// for https://)
const WS_PROTOCOL = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
const WS_BASE_URL = API_BASE_URL.replace(/^http(s)?/, WS_PROTOCOL);

export const API_URL = API_BASE_URL;

export const endpoints = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    reports: `${API_BASE_URL}/reports`,
    grade: `${API_BASE_URL}/grade`,
    wsInterview: (clientId, type) => `${WS_BASE_URL}/ws/interview/${clientId}?type=${type}`
};

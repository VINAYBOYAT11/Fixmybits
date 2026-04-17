import { CONFIG } from '../utils/config';

export const Storage = {
    get(key) { return localStorage.getItem(key); },
    set(key, val) { localStorage.setItem(key, val); },
    remove(key) { localStorage.removeItem(key); }
};

export const API = {
    async request(endpoint, options = {}) {
        const url   = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = Storage.get('access_token');

        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        let response;
        try {
            response = await fetch(url, { ...options, headers, signal: controller.signal });
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('Server took too long to respond. Please check if the backend is running.');
            }
            throw new Error(`Network Error: ${err.message}`);
        } finally {
            clearTimeout(timeoutId);
        }

        if (response.status === 401 && token) {
            // Dispatch a custom event so the AuthContext can log the user out
            window.dispatchEvent(new CustomEvent('auth-error'));
        }

        if (response.status === 204) return null;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error  = new Error(data.detail || data.error || data.message || 'Request failed');
            error.status = response.status;
            error.data   = data;
            throw error;
        }

        return data;
    },

    get(endpoint)        { return this.request(endpoint, { method: 'GET' }); },
    delete(endpoint)     { return this.request(endpoint, { method: 'DELETE' }); },
    post(endpoint, body) {
        const isForm = body instanceof FormData;
        return this.request(endpoint, { method: 'POST',  body: isForm ? body : JSON.stringify(body) });
    },
    put(endpoint, body) {
        const isForm = body instanceof FormData;
        return this.request(endpoint, { method: 'PUT',   body: isForm ? body : JSON.stringify(body) });
    },
    patch(endpoint, body) {
        const isForm = body instanceof FormData;
        return this.request(endpoint, { method: 'PATCH', body: isForm ? body : JSON.stringify(body) });
    },
};

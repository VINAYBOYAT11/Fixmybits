/**
 * FixMyBits API Client
 * Wraps Fetch API with JWT handling and centralized error management.
 */

import { CONFIG } from './config.js';
import { Storage } from './utils.js';

export const API = {
    async request(endpoint, options = {}) {
        const url   = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = Storage.get('access_token');

        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // FormData uploads must NOT set Content-Type (browser sets it with boundary)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        // Add 5 second timeout to prevent infinite hanging
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

        // 401 with an existing token = token has expired
        if (response.status === 401 && token) {
            window.dispatchEvent(new CustomEvent('auth-error'));
        }

        if (response.status === 204) return null;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error     = new Error(data.detail || data.error || data.message || 'Request failed');
            error.status    = response.status;
            error.data      = data;
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

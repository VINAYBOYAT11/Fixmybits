/**
 * FixMyBits Auth Module
 * Handles Login, Registration, and Session lifecycle.
 */

import { API } from './api.js';
import { Storage } from './utils.js';
import { state, setState } from './config.js';

export const Auth = {
    async login(email, password) {
        const data = await API.post('/auth/login/', { email, password });
        Storage.set('access_token',  data.access);
        Storage.set('refresh_token', data.refresh);
        setState({ user: data.user, isAuthenticated: true });
        return data.user;
    },

    async register(userData) {
        return await API.post('/auth/register/', userData);
    },

    async logout() {
        try {
            const refresh = Storage.get('refresh_token');
            if (refresh) {
                await API.post('/auth/logout/', { refresh });
            }
        } catch (err) {
            console.warn('Logout API call failed (clearing session anyway):', err.message);
        } finally {
            this.clearSession();
            window.location.hash = '#/login';
        }
    },

    async restoreSession() {
        const token = Storage.get('access_token');
        if (!token) {
            // No stored token — not logged in, nothing to do
            return null;
        }

        try {
            const user = await API.get('/auth/me/');
            setState({ user, isAuthenticated: true });
            return user;
        } catch (err) {
            // Token expired / invalid / backend unreachable — clear and continue
            console.warn('Session restore failed:', err.message);
            this.clearSession();
            return null;   // ← never re-throw; caller just gets null
        }
    },

    clearSession() {
        Storage.remove('access_token');
        Storage.remove('refresh_token');
        setState({ user: null, isAuthenticated: false });
    }
};

// Global listener: expired token during an API call → force logout
window.addEventListener('auth-error', () => {
    Auth.clearSession();
    window.location.hash = '#/login';
});

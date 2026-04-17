/**
 * FixMyBits Main Application Entry Point
 * Bootstraps auth, state, and router.
 */

import { Auth }   from './auth.js';
import { Router } from './router.js';
import { UI }     from './ui.js';
import { state }  from './config.js';

// Import Dashboards
import { Tester }  from './dashboards/tester.js';
import { Startup } from './dashboards/startup.js';
import { Admin }   from './dashboards/admin.js';

// Expose to global scope for inline onclick handlers
window.app = { tester: Tester, startup: Startup, admin: Admin, auth: Auth, router: Router, ui: UI, state };

async function initApp() {
    console.log('🚀 FixMyBits initializing…');

    const loader = document.querySelector('.initial-loader');

    function removeLoader() {
        if (!loader) return;
        loader.style.transition = 'opacity 0.3s';
        loader.style.opacity    = '0';
        setTimeout(() => loader.remove(), 350);
    }

    // 1. Try to restore an existing session — NEVER throws
    await Auth.restoreSession();

    // 2. Always remove the spinner, no matter what
    removeLoader();

    // 3. Boot the router
    try {
        Router.init();
        if (state.isAuthenticated) {
            console.log(`✅ Logged in as ${state.user.email} (${state.user.role})`);
        } else {
            console.log('🔓 No session — showing login');
        }
    } catch (err) {
        console.error('❌ Router failed to start:', err);
        // Fallback error screen so the user isn't left with a black page
        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                            color:#fff;font-family:Inter,sans-serif;background:#0f0f0f;">
                    <div style="text-align:center;max-width:400px">
                        <h2 style="margin-bottom:12px">⚠️ App failed to load</h2>
                        <p style="opacity:0.6;margin-bottom:24px">
                            Make sure the backend is running at
                            <a href="http://127.0.0.1:8000" style="color:#60a5fa">127.0.0.1:8000</a>
                        </p>
                        <button onclick="location.reload()"
                            style="padding:10px 28px;background:#3b82f6;border:none;color:#fff;
                                   border-radius:8px;cursor:pointer;font-size:1rem">
                            Retry
                        </button>
                    </div>
                </div>`;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

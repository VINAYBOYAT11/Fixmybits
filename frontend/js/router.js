/**
 * FixMyBits Router
 * Handles hash-based routing and role-based view swapping.
 */

import { $ } from './utils.js';
import { state } from './config.js';
import { Templates, UI } from './ui.js';
import { Auth } from './auth.js';

export const Router = {
    routes: {
        '#/login':     { title: 'Login',     auth: false, render: () => renderAuth('login') },
        '#/register':  { title: 'Register',  auth: false, render: () => renderAuth('register') },
        '#/dashboard': { title: 'Dashboard', auth: true,  render: () => renderDashboard() },
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    async handleRoute() {
        const hash  = window.location.hash || '#/login';
        const route = this.routes[hash] || null;

        // Unknown route — redirect based on auth state
        if (!route) {
            window.location.hash = state.isAuthenticated ? '#/dashboard' : '#/login';
            return;
        }

        // Auth guard: protected route but not logged in
        if (route.auth && !state.isAuthenticated) {
            window.location.hash = '#/login';
            return;
        }

        // Already logged in but visiting login/register
        if (!route.auth && state.isAuthenticated) {
            window.location.hash = '#/dashboard';
            return;
        }

        document.title = `${route.title} | FixMyBits`;
        await route.render();

        // Wire up logout button after every render
        const logoutBtn = $('#logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => Auth.logout();
        }
    }
};

// ─────────────────────────────────────────────
//  Auth Pages (Login / Register)
// ─────────────────────────────────────────────

async function renderAuth(type) {
    const isLogin = type === 'login';

    const loginContent = `
        <h1 class="text-center">Welcome Back</h1>
        <p class="text-secondary text-center" style="margin-bottom:var(--spacing-xl)">Sign in to your security workspace</p>
        <form id="auth-form" novalidate>
            <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="login-email" name="email" class="form-control" placeholder="name@company.com" required autocomplete="email">
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" id="login-password" name="password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
            </div>
            <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width:100%">Sign In</button>
        </form>
        <p class="text-center" style="margin-top:var(--spacing-lg)">
            Don't have an account? <a href="#/register">Create one</a>
        </p>
    `;

    const registerContent = `
        <h1 class="text-center">Join FixMyBits</h1>
        <p class="text-secondary text-center" style="margin-bottom:var(--spacing-xl)">Create your security workspace account</p>
        <form id="auth-form" novalidate>
            <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="reg-email" name="email" class="form-control" placeholder="name@company.com" required autocomplete="email">
            </div>
            <div class="form-group">
                <label class="form-label">Role</label>
                <select name="role" id="reg-role" class="form-control" required>
                    <option value="tester">Security Tester</option>
                    <option value="startup">Startup Owner</option>
                </select>
            </div>
            <div class="form-group" id="company-name-group" style="display:none">
                <label class="form-label">Company Name <span style="color:var(--danger)">*</span></label>
                <input type="text" name="company_name" id="reg-company" class="form-control" placeholder="Acme Corp">
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" name="password" id="reg-password" class="form-control" placeholder="Min 8 characters" required minlength="8" autocomplete="new-password">
            </div>
            <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" name="confirm_password" id="reg-confirm" class="form-control" placeholder="Repeat your password" required minlength="8" autocomplete="new-password">
            </div>
            <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width:100%">Create Account</button>
        </form>
        <p class="text-center" style="margin-top:var(--spacing-lg)">
            Already have an account? <a href="#/login">Sign in</a>
        </p>
    `;

    UI.renderPage(Templates.authLayout, isLogin ? loginContent : registerContent);

    // ── Register: toggle company field based on role ──
    if (!isLogin) {
        const roleSelect    = $('#reg-role');
        const companyGroup  = $('#company-name-group');
        const companyInput  = $('#reg-company');

        if (roleSelect) {
            roleSelect.addEventListener('change', () => {
                const isStartup = roleSelect.value === 'startup';
                companyGroup.style.display = isStartup ? 'block' : 'none';
                companyInput.required = isStartup;
            });
        }
    }

    // ── Form submit handler ──
    const form = $('#auth-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();

        const btn          = $('#auth-submit-btn');
        const originalText = btn.textContent;
        btn.disabled       = true;
        btn.textContent    = 'Please wait…';

        const formData = new FormData(form);
        const data     = Object.fromEntries(formData);

        try {
            if (isLogin) {
                await Auth.login(data.email, data.password);
                UI.toast('Welcome to FixMyBits! 🎉', 'success');
                window.location.hash = '#/dashboard';
            } else {
                await Auth.register(data);
                UI.toast('Account created successfully! You can now sign in.', 'success');
                window.location.hash = '#/login';
            }
        } catch (err) {
            // Extract clearest error message from backend response
            let msg = err.message || 'Something went wrong.';
            const errData = err.data;
            if (errData && typeof errData === 'object') {
                const firstKey = Object.keys(errData)[0];
                if (firstKey) {
                    const val = errData[firstKey];
                    msg = Array.isArray(val) ? val[0] : String(val);
                }
            }
            UI.toast(msg, 'danger');
            btn.disabled    = false;
            btn.textContent = originalText;
        }
    };
}

// ─────────────────────────────────────────────
//  Dashboard Page
// ─────────────────────────────────────────────

async function renderDashboard() {
    const user = state.user;
    if (!user) {
        window.location.hash = '#/login';
        return;
    }

    let nav = '';
    if (user.role === 'admin') {
        nav = `
            <a href="#/dashboard" class="nav-item active"><i class="ph-chart-pie"></i><span>Overview</span></a>
            <a href="#/users"     class="nav-item"><i class="ph-users"></i><span>Approve Users</span></a>
            <a href="#/projects"  class="nav-item"><i class="ph-briefcase"></i><span>Approve Projects</span></a>
            <a href="#/reports"   class="nav-item"><i class="ph-file-search"></i><span>Review Reports</span></a>
        `;
    } else if (user.role === 'tester') {
        nav = `
            <a href="#/dashboard"   class="nav-item active"><i class="ph-house"></i><span>Home</span></a>
            <a href="#/browse"      class="nav-item"><i class="ph-magnifying-glass"></i><span>Browse Projects</span></a>
            <a href="#/my-projects" class="nav-item"><i class="ph-briefcase"></i><span>My Work</span></a>
            <a href="#/my-reports"  class="nav-item"><i class="ph-file-text"></i><span>My Reports</span></a>
        `;
    } else {
        nav = `
            <a href="#/dashboard"      class="nav-item active"><i class="ph-chart-line"></i><span>Overview</span></a>
            <a href="#/create-project" class="nav-item"><i class="ph-plus-circle"></i><span>Post Project</span></a>
            <a href="#/my-projects"    class="nav-item"><i class="ph-folder"></i><span>Manage Projects</span></a>
            <a href="#/reports"        class="nav-item"><i class="ph-file-text"></i><span>View Reports</span></a>
        `;
    }

    const layout  = Templates.dashboardLayout(user, nav);
    const content = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-label">Welcome</span>
                <span class="stat-value">${user.email.split('@')[0]}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Role</span>
                <span class="stat-value" style="text-transform:capitalize">${user.role}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Account Status</span>
                <span class="stat-value" style="font-size:1.1rem;color:${user.is_approved ? 'var(--success)' : 'var(--warning)'}">
                    ${user.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                </span>
            </div>
        </div>
        <div class="card" style="margin-top:var(--spacing-lg)">
            <h3>Getting Started</h3>
            <p class="text-secondary" style="margin-top:var(--spacing-sm)">
                ${user.role === 'admin'
                    ? 'Use the sidebar to approve users and projects, and review security reports.'
                    : user.role === 'tester'
                    ? 'Browse open projects, apply to test them, and submit security reports.'
                    : 'Post your project for admin review, then testers will apply to help secure it.'}
            </p>
        </div>
    `;

    UI.renderPage(layout, content);
}

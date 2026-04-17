/**
 * FixMyBits UI Components
 * UX enhancements like toasts, loading indicators, and layout helpers.
 */

import { $ } from './utils.js';
import { state } from './config.js';

export const UI = {
    toast(message, type = 'info') {
        let container = $('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = {
            success: 'ph-check-circle',
            danger: 'ph-warning-circle',
            warning: 'ph-warning',
            info: 'ph-info'
        }[type] || 'ph-info';

        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    showLoader() {
        const app = $('#app');
        if (app) app.classList.add('loading');
    },

    hideLoader() {
        const app = $('#app');
        if (app) app.classList.remove('loading');
    },

    renderPage(layout, content) {
        const app = $('#app');
        if (!app) return;
        
        app.innerHTML = layout;
        const main = $('.content-body');
        if (main) {
            main.innerHTML = content;
        }
    }
};

/**
 * Common Layout Templates
 */
export const Templates = {
    authLayout: `
        <div class="auth-layout fade-in">
            <div class="card auth-card content-body">
                <!-- Auth content goes here -->
            </div>
        </div>
    `,

    dashboardLayout: (user, sidebarNav) => `
        <div class="app-container fade-in">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="logo-text">
                        <i class="ph-shield-check-fill"></i>
                        <span>FixMyBits</span>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    ${sidebarNav}
                </nav>
                <div class="sidebar-footer">
                    <button id="logout-btn" class="btn btn-ghost" style="width: 100%; justify-content: flex-start;">
                        <i class="ph-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main class="main-content">
                <header class="main-header">
                    <div class="header-left">
                        <h2 id="page-title" style="margin: 0">Dashboard</h2>
                    </div>
                    <div class="header-right flex items-center gap-md">
                        <div class="user-pill flex items-center gap-md">
                            <span class="text-secondary">${user.email}</span>
                            <span class="badge badge-status-open" style="font-size: 0.65rem">${user.role}</span>
                        </div>
                    </div>
                </header>
                <div class="content-body">
                    <!-- Dashboard content goes here -->
                </div>
            </main>
        </div>
    `
};

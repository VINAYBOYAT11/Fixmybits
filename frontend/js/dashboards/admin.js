/**
 * FixMyBits Admin Dashboard
 * Global management of users, projects, and reports.
 */

import { API } from '../api.js';
import { UI } from '../ui.js';
import { $, fmtDate, renderBadge, renderSeverity } from '../utils.js';

export const Admin = {
    async fetchStats() {
        try {
            return await API.get('/admin/stats/');
        } catch (err) {
            UI.toast('Failed to load stats', 'danger');
            return null;
        }
    },

    async fetchPendingUsers() {
        try {
            return await API.get('/admin/pending-users/');
        } catch (err) {
            UI.toast('Failed to load pending users', 'danger');
            return [];
        }
    },

    async approveUser(userId) {
        try {
            await API.post(`/admin/users/${userId}/approve/`);
            UI.toast('User approved successfully!', 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    async fetchPendingProjects() {
        try {
            return await API.get('/admin/pending-projects/');
        } catch (err) {
            UI.toast('Failed to load pending projects', 'danger');
            return [];
        }
    },

    async reviewProject(projectId, action, reason = "") {
        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            await API.post(`/admin/projects/${projectId}/${endpoint}/`, { reason });
            UI.toast(`Project ${action}d successfully`, 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    renderUserList(users) {
        if (!users || users.length === 0) {
            return '<p class="text-secondary">No pending users to review.</p>';
        }

        return `
            <div class="list-container">
                ${users.map(u => `
                    <div class="list-item card fade-in">
                        <div class="item-main">
                            <span class="item-title">${u.email}</span>
                            <div class="item-meta">
                                <span><i class="ph-user-focus"></i> Role: ${u.role}</span>
                                <span><i class="ph-clock"></i> Joined: ${fmtDate(u.date_joined)}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-primary btn-sm" onclick="app.admin.approveUser('${u.id}')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="app.admin.banUser('${u.id}')">Ban</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderStatsCards(stats) {
        if (!stats) return '';
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Total Users</span>
                    <span class="stat-value">${stats.total_users || 0}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Active Projects</span>
                    <span class="stat-value">${stats.active_projects || 0}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Reports Submitted</span>
                    <span class="stat-value">${stats.total_reports || 0}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Pending Reviews</span>
                    <span class="stat-value text-warning">${stats.pending_reviews || 0}</span>
                </div>
            </div>
        `;
    }
};

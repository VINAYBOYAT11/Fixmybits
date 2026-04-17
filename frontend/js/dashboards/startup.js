/**
 * FixMyBits Startup Dashboard
 * Handles all startup/company workflows.
 */

import { API } from '../api.js';
import { UI } from '../ui.js';
import { $, fmtDate, renderBadge, renderSeverity } from '../utils.js';

export const Startup = {
    async fetchMyProjects() {
        try {
            return await API.get('/startup/projects/');
        } catch (err) {
            UI.toast('Failed to load your projects', 'danger');
            return [];
        }
    },

    async createProject(projectData) {
        try {
            const project = await API.post('/startup/projects/', projectData);
            UI.toast('Project draft created!', 'success');
            return project;
        } catch (err) {
            UI.toast('Creation failed: ' + err.message, 'danger');
            return null;
        }
    },

    async submitForApproval(projectId) {
        try {
            await API.post(`/startup/projects/${projectId}/submit/`);
            UI.toast('Project submitted for admin approval', 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    async markReportFixed(reportId) {
        try {
            await API.post(`/startup/reports/${reportId}/mark_fixed/`);
            UI.toast('Report marked as fixed!', 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    renderProjectTable(projects) {
        if (!projects || projects.length === 0) {
            return `
                <div class="card text-center" style="padding: var(--spacing-xl)">
                    <p class="text-secondary">You haven't posted any projects yet.</p>
                    <button class="btn btn-primary" style="margin-top: var(--spacing-md)" onclick="window.location.hash='#/create-project'">
                        <i class="ph-plus-circle"></i> Create My First Project
                    </button>
                </div>
            `;
        }

        return `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background-color: var(--bg-tertiary);">
                        <tr>
                            <th style="padding: var(--spacing-md) var(--spacing-lg);">Project Name</th>
                            <th style="padding: var(--spacing-md) var(--spacing-lg);">Created</th>
                            <th style="padding: var(--spacing-md) var(--spacing-lg);">Status</th>
                            <th style="padding: var(--spacing-md) var(--spacing-lg);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projects.map(p => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: var(--spacing-md) var(--spacing-lg); font-weight: 500;">${p.name}</td>
                                <td style="padding: var(--spacing-md) var(--spacing-lg); color: var(--text-secondary);">${fmtDate(p.created_at)}</td>
                                <td style="padding: var(--spacing-md) var(--spacing-lg);">${renderBadge(p.status)}</td>
                                <td style="padding: var(--spacing-md) var(--spacing-lg);">
                                    <div class="flex gap-md">
                                        <button class="btn btn-secondary btn-sm" onclick="app.startup.viewDetail('${p.id}')">View</button>
                                        ${p.status === 'draft' ? `<button class="btn btn-primary btn-sm" onclick="app.startup.submit('${p.id}')">Submit</button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

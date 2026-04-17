/**
 * FixMyBits Tester Dashboard
 * Handles all security tester workflows.
 */

import { API } from '../api.js';
import { UI } from '../ui.js';
import { $, fmtDate, renderBadge, renderSeverity } from '../utils.js';

export const Tester = {
    async init() {
        // This is called when the tester dashboard view is rendered
    },

    async fetchOpenProjects() {
        try {
            return await API.get('/tester/projects/open/');
        } catch (err) {
            UI.toast('Failed to load projects', 'danger');
            return [];
        }
    },

    async applyForProject(projectId) {
        try {
            await API.post(`/tester/projects/${projectId}/apply/`);
            UI.toast('Application submitted successfully!', 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    async fetchMyReports() {
        try {
            return await API.get('/tester/reports/');
        } catch (err) {
            UI.toast('Failed to load reports', 'danger');
            return [];
        }
    },

    async submitReport(projectId, reportData) {
        try {
            // Check if reportData is FormData (for screenshot)
            await API.post(`/tester/projects/${projectId}/reports/`, reportData);
            UI.toast('Report submitted for review!', 'success');
            return true;
        } catch (err) {
            UI.toast(err.message, 'danger');
            return false;
        }
    },

    renderProjectList(projects) {
        if (!projects || projects.length === 0) {
            return '<p class="text-secondary">No open projects found. Check back later!</p>';
        }

        return `
            <div class="list-container">
                ${projects.map(p => `
                    <div class="list-item card fade-in">
                        <div class="item-main">
                            <span class="item-title">${p.name}</span>
                            <div class="item-meta">
                                <span><i class="ph-buildings"></i> ${p.startup_company}</span>
                                <span><i class="ph-calendar"></i> ${fmtDate(p.created_at)}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            ${p.has_applied ? 
                                `<span class="badge badge-status-pending">Applied</span>` : 
                                `<button class="btn btn-primary btn-sm" onclick="app.tester.apply('${p.id}')">Apply</button>`
                            }
                        </div>
                    </div>
                    <div class="project-details" style="margin-top: 10px; font-size: 0.875rem; color: var(--text-secondary)">
                        <strong>In Scope:</strong> ${p.in_scope.substring(0, 100)}...
                    </div>
                    <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 15px 0;">
                `).join('')}
            </div>
        `;
    }
};

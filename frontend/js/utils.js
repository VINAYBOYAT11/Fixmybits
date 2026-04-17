/**
 * FixMyBits Utilities
 * DOM helpers and formatting tools.
 */

// DOM Selectors
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

// HTML Escaping
export const esc = (str) => {
    if (!str) return "";
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
};

// Date Formatting
export const fmtDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
};

// Badge Generator
export const renderBadge = (status) => {
    const labelMapping = {
        draft: "Draft",
        pending_approval: "Pending Approval",
        open: "Open",
        in_progress: "In Progress",
        completed: "Completed",
        rejected: "Rejected",
        pending_admin_review: "Pending Review",
        approved: "Approved",
        spam: "Spam",
        duplicate: "Duplicate",
        fixed: "Fixed"
    };
    
    const label = labelMapping[status] || status;
    return `<span class="badge badge-status-${status}">${esc(label)}</span>`;
};

// Severity Badge
export const renderSeverity = (severity) => {
    const colorMapping = {
        Low: "text-success",
        Medium: "text-warning",
        High: "#f97316", // Orange
        Critical: "var(--danger)"
    };
    const color = colorMapping[severity] || "inherit";
    return `<span style="font-weight: 600; color: ${color}">${esc(severity)}</span>`;
};

// LocalStorage Helpers
export const Storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => {
        const item = localStorage.getItem(key);
        try { return item ? JSON.parse(item) : null; } catch { return null; }
    },
    remove: (key) => localStorage.removeItem(key)
};

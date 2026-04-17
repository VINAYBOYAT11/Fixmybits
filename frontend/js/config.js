/**
 * FixMyBits Frontend Configuration
 * Holds environment variables, constants, and global state.
 */

export const CONFIG = {
    API_BASE_URL: "http://127.0.0.1:8000/api",
    WS_URL: "ws://127.0.0.1:8000/ws", // Reserved for real-time features
    APP_NAME: "FixMyBits",
    VERSION: "1.0.0",
    ROLES: {
        ADMIN: "admin",
        TESTER: "tester",
        STARTUP: "startup"
    }
};

/**
 * Global reactive state.
 * For this vanilla implementation, we'll use a proxy or just manual updates.
 */
export const state = {
    user: null,         // { id, email, role, is_approved, profile: {} }
    isAuthenticated: false,
    currentPath: "/",
    isLoading: false,
    
    // UI state
    toasts: [],
    
    // Data cache
    projects: [],
    reports: [],
    applications: []
};

// Helper to set state and trigger re-renders if needed
export function setState(newState) {
    Object.assign(state, newState);
    // In a real app, we might trigger a CustomEvent here for the UI to listen to
    window.dispatchEvent(new CustomEvent('statechange', { detail: state }));
}

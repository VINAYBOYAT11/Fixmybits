export const CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
    WS_URL: "ws://127.0.0.1:8000/ws",
    APP_NAME: "FixMyBits",
    VERSION: "2.0.0 (React)",
    ROLES: {
        ADMIN: "admin",
        TESTER: "tester",
        STARTUP: "startup"
    }
};

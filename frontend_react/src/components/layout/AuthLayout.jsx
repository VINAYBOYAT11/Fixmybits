import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AuthLayout() {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className="auth-layout">
            <div className="auth-shell">
                <section className="auth-brand-panel">
                    <div className="auth-brand-chip">FixMyBits</div>
                    <h2>Security collaboration, built for trust.</h2>
                    <p>
                        A polished workspace for startups, security testers, and admins to collaborate
                        on vulnerability reports and project workflows.
                    </p>
                    <div className="auth-brand-actions">
                        <Link className={`btn btn-ghost ${isLogin ? 'active-auth-link' : ''}`} to="/login">Sign In</Link>
                        <Link className={`btn btn-ghost ${!isLogin ? 'active-auth-link' : ''}`} to="/register">Create Account</Link>
                    </div>
                </section>
                <section className="auth-form-panel">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}

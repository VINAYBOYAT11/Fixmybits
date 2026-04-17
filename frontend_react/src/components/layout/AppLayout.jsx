import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { gsap } from 'gsap';
import {
    SignOut, List, X,
    ChartPie, Users, Briefcase, FileMagnifyingGlass,
    House, MagnifyingGlass, FileText, ChartLine, PlusCircle
} from '@phosphor-icons/react';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);
    const mainRef = useRef(null);

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (sidebarRef.current) {
            gsap.fromTo(sidebarRef.current, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
        }
        if (mainRef.current) {
            gsap.fromTo(mainRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.06, ease: 'power3.out' });
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const renderNavItems = () => {
        const path = location.pathname;

        const NavItem = ({ to, icon: Icon, label }) => (
            <Link to={to} className={`nav-item ${path === to ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={20} weight={path === to ? 'fill' : 'regular'} />
                <span>{label}</span>
            </Link>
        );

        if (user.role === 'admin') {
            return (
                <>
                    <NavItem to="/dashboard" icon={ChartPie} label="Overview" />
                    <NavItem to="/users" icon={Users} label="Approve Users" />
                    <NavItem to="/projects" icon={Briefcase} label="Approve Projects" />
                    <NavItem to="/reports" icon={FileMagnifyingGlass} label="Review Reports" />
                </>
            );
        } else if (user.role === 'tester') {
            return (
                <>
                    <NavItem to="/dashboard" icon={House} label="Home" />
                    <NavItem to="/projects" icon={MagnifyingGlass} label="Browse Projects" />
                    <NavItem to="/reports" icon={FileText} label="My Reports" />
                </>
            );
        } else {
            return (
                <>
                    <NavItem to="/dashboard" icon={ChartLine} label="Overview" />
                    <NavItem to="/projects" icon={PlusCircle} label="Manage Projects" />
                    <NavItem to="/reports" icon={FileText} label="View Reports" />
                </>
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="sidebar-header">
                    <h2>FixMyBits</h2>
                    <button className="mobile-only sidebar-toggle" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {renderNavItems()}
                </nav>
            </aside>

            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

            <div className="main-wrapper" ref={mainRef}>
                <header className="top-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="mobile-only sidebar-toggle" onClick={() => setSidebarOpen(true)}>
                            <List size={24} />
                        </button>
                        <div className="header-breadcrumbs">
                            <span>{location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}</span>
                        </div>
                    </div>
                    <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="user-email text-secondary" style={{ display: 'none' }}>
                            {user.email}
                        </span>
                        <div className="avatar">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 12px' }}>
                            <SignOut size={16} /> <span>Logout</span>
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

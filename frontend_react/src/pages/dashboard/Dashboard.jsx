import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API } from '../../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine endpoint based on role
                let endpoint = '/tester/stats/';
                if (user.role === 'admin') endpoint = '/admin/stats/';
                else if (user.role === 'startup') endpoint = '/startup/stats/';

                const data = await API.get(endpoint);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                // Don't toast on every 404 for stats if they don't exist yet
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

    if (loading) return <div className="loader-spinner" style={{ margin: '2rem auto' }}></div>;

    return (
        <div className="fade-in">
            <h1 className="page-title">Dashboard Overview</h1>
            
            <div className="stats-grid">
                {user.role === 'admin' ? (
                    <>
                        <div className="stat-card">
                            <span className="stat-label">Total Users</span>
                            <span className="stat-value">{stats?.users?.total || 0}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Active Projects</span>
                            <span className="stat-value">{stats?.projects?.in_progress || 0}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Reports Submitted</span>
                            <span className="stat-value">{stats?.reports?.total || 0}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Pending Reviews</span>
                            <span className="stat-value text-warning">{stats?.reports?.pending || 0}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <span className="stat-label">Welcome</span>
                            <span className="stat-value">{user.email.split('@')[0]}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Role</span>
                            <span className="stat-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Account Status</span>
                            <span className="stat-value" style={{ fontSize: '1.1rem', color: user.is_approved ? 'var(--success)' : 'var(--warning)' }}>
                                {user.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                            </span>
                        </div>
                    </>
                )}
            </div>
            
            <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3>Next Steps</h3>
                <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                    {user.role === 'admin'
                        ? 'You have full access to the platform. Use the sidebar to moderate users, projects, and security findings.'
                        : user.role === 'tester'
                        ? 'Explore the project marketplace to find security testing opportunities and earn rewards.'
                        : 'Post a project to get security feedback from independent security testers.'}
                </p>
            </div>
        </div>
    );
}

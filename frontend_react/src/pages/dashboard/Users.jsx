import React, { useEffect, useState } from 'react';
import { API } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Users() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (user?.role !== 'admin') {
                setLoading(false);
                return;
            }
            try {
                const response = await API.get('/admin/pending-users/');
                setUsers(response.results || response || []);
            } catch (err) {
                addToast(err.message || 'Failed to load users', 'danger');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, addToast]);

    if (user?.role !== 'admin') {
        return (
            <div className="fade-in">
                <h1 className="page-title">Users</h1>
                <div className="card">
                    <p className="text-secondary">This page is only available for admins.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h1 className="page-title">User Approvals</h1>
            <div className="card">
                <p className="text-secondary">Manage and approve new security testers and startup owners.</p>
                {loading ? (
                    <div className="loader-spinner" style={{ margin: '2rem auto' }}></div>
                ) : users.length === 0 ? (
                    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                        <p>No pending users at the moment.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((pendingUser) => (
                                    <tr key={pendingUser.id}>
                                        <td style={{ padding: '0.75rem' }}>{pendingUser.email}</td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{pendingUser.role}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {pendingUser.is_approved ? 'Approved' : 'Pending approval'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

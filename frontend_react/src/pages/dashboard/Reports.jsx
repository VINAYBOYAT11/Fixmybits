import React, { useEffect, useState } from 'react';
import { API } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Reports() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user?.role) return;

            let endpoint = '/admin/pending-reports/';
            if (user.role === 'tester') endpoint = '/tester/reports/';
            if (user.role === 'startup') endpoint = '/startup/reports/';

            try {
                const response = await API.get(endpoint);
                setReports(response.results || response || []);
            } catch (err) {
                addToast(err.message || 'Failed to load reports', 'danger');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user, addToast]);

    const title =
        user?.role === 'admin'
            ? 'Security Reports'
            : user?.role === 'tester'
            ? 'My Reports'
            : 'Project Reports';

    const subtitle =
        user?.role === 'admin'
            ? 'Review security findings submitted by testers.'
            : user?.role === 'tester'
            ? 'Reports you have submitted for assigned projects.'
            : 'Security findings reported against your projects.';

    return (
        <div className="fade-in">
            <h1 className="page-title">{title}</h1>
            <div className="card">
                <p className="text-secondary">{subtitle}</p>
                {loading ? (
                    <div className="loader-spinner" style={{ margin: '2rem auto' }}></div>
                ) : reports.length === 0 ? (
                    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                        <p>No security reports found.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Title</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Severity</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td style={{ padding: '0.75rem' }}>{report.title}</td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{report.severity}</td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{report.status}</td>
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

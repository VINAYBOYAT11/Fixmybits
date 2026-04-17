import React, { useEffect, useState } from 'react';
import { API } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Projects() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user?.role) return;

            let endpoint = '/admin/pending-projects/';
            if (user.role === 'tester') endpoint = '/tester/projects/open/';
            if (user.role === 'startup') endpoint = '/startup/projects/';

            try {
                const response = await API.get(endpoint);
                setProjects(response.results || response || []);
            } catch (err) {
                addToast(err.message || 'Failed to load projects', 'danger');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user, addToast]);

    const title =
        user?.role === 'admin'
            ? 'Project Approvals'
            : user?.role === 'tester'
            ? 'Browse Projects'
            : 'My Projects';

    const subtitle =
        user?.role === 'admin'
            ? 'Review and approve new security project listings.'
            : user?.role === 'tester'
            ? 'Open projects available for security testing.'
            : 'Manage projects created by your startup.';

    return (
        <div className="fade-in">
            <h1 className="page-title">{title}</h1>
            <div className="card">
                <p className="text-secondary">{subtitle}</p>
                {loading ? (
                    <div className="loader-spinner" style={{ margin: '2rem auto' }}></div>
                ) : projects.length === 0 ? (
                    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                        <p>No projects found.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Project</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id}>
                                        <td style={{ padding: '0.75rem' }}>{project.name}</td>
                                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{project.status}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
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

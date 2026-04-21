import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { projectsAPI, reportsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isStartup, isTester, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    reports: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load data based on user role
      if (isStartup) {
        const projectsRes = await projectsAPI.getMyProjects();
        setStats({
          projects: projectsRes.data.count || projectsRes.data.length || 0,
          reports: 0,
          completed: projectsRes.data.results?.filter(p => p.status === 'completed').length || 0,
          pending: projectsRes.data.results?.filter(p => p.status === 'pending_approval').length || 0
        });
      } else if (isTester) {
        const projectsRes = await projectsAPI.getAssignedProjects();
        const reportsRes = await reportsAPI.getMyReports();
        setStats({
          projects: projectsRes.data.count || projectsRes.data.length || 0,
          reports: reportsRes.data.count || reportsRes.data.length || 0,
          completed: reportsRes.data.results?.filter(r => r.status === 'fixed').length || 0,
          pending: reportsRes.data.results?.filter(r => r.status === 'pending_admin_review').length || 0
        });
      } else if (isAdmin) {
        const projectsRes = await projectsAPI.getAllProjects();
        const reportsRes = await reportsAPI.getAllReports();
        setStats({
          projects: projectsRes.data.count || projectsRes.data.length || 0,
          reports: reportsRes.data.count || reportsRes.data.length || 0,
          completed: reportsRes.data.results?.filter(r => r.status === 'approved').length || 0,
          pending: projectsRes.data.results?.filter(p => p.status === 'pending_approval').length || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: FolderOpen,
      color: 'primary',
      gradient: 'var(--gradient-primary)'
    },
    {
      title: 'Reports',
      value: stats.reports,
      icon: FileText,
      color: 'secondary',
      gradient: 'var(--gradient-secondary)'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'success',
      gradient: 'var(--gradient-ocean)'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'warning',
      gradient: 'var(--gradient-sunset)'
    }
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      
      <div className="dashboard-main">
        <div className="dashboard-container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="dashboard-title">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="dashboard-subtitle">
              {isStartup && 'Manage your security projects and monitor bug reports'}
              {isTester && 'View your assigned projects and submit security findings'}
              {isAdmin && 'Oversee platform operations and approve submissions'}
            </p>
          </div>
          <div className="dashboard-badge">
            <Shield size={24} />
            <span>
              {isStartup && 'Startup'}
              {isTester && 'Security Tester'}
              {isAdmin && 'Administrator'}
            </span>
          </div>
        </motion.div>

        <div className="dashboard-stats">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hoverable className="stat-card">
                <div className="stat-card-icon" style={{ background: stat.gradient }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-card-content">
                  <p className="stat-card-title">{stat.title}</p>
                  <h3 className="stat-card-value">
                    {loading ? '...' : stat.value}
                  </h3>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <h2 className="card-title">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="quick-actions">
                  {isStartup && (
                    <>
                      <Button fullWidth variant="primary" leftIcon={<FolderOpen size={18} />}>
                        Create New Project
                      </Button>
                      <Button fullWidth variant="outline" leftIcon={<FileText size={18} />}>
                        View All Reports
                      </Button>
                    </>
                  )}
                  {isTester && (
                    <>
                      <Button fullWidth variant="primary" leftIcon={<FolderOpen size={18} />}>
                        Browse Open Projects
                      </Button>
                      <Button fullWidth variant="outline" leftIcon={<FileText size={18} />}>
                        Submit Bug Report
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Button fullWidth variant="primary" leftIcon={<CheckCircle size={18} />}>
                        Review Pending Projects
                      </Button>
                      <Button fullWidth variant="outline" leftIcon={<Users size={18} />}>
                        Manage Users
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card variant="gradient">
              <CardContent>
                <div className="dashboard-highlight">
                  <TrendingUp size={48} />
                  <h3>Platform Activity</h3>
                  <p>Your account is active and in good standing</p>
                  <div className="dashboard-highlight-stats">
                    <div>
                      <span className="highlight-value">{stats.projects + stats.reports}</span>
                      <span className="highlight-label">Total Activity</span>
                    </div>
                    <div>
                      <span className="highlight-value">{stats.completed}</span>
                      <span className="highlight-label">Resolved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

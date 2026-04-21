import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Card, { CardContent } from '../components/ui/Card';

const Projects = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px', maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-lg)' }}>Projects</h1>
        <Card>
          <CardContent>
            <p>Projects page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;

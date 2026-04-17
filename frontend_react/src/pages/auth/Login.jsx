import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Login() {
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const cardRef = useRef(null);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    useEffect(() => {
        if (!cardRef.current) return;
        gsap.fromTo(
            cardRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
        );
    }, []);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            addToast('Welcome to FixMyBits! 🎉', 'success');
            navigate('/dashboard');
        } catch (err) {
            addToast(err.message || 'Login failed', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card" ref={cardRef}>
            <h1 className="text-center">Welcome Back</h1>
            <p className="text-secondary text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                Sign in to your security workspace
            </p>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        className="form-control" 
                        placeholder="name@company.com" 
                        onChange={handleChange}
                        required 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        className="form-control" 
                        placeholder="••••••••" 
                        onChange={handleChange}
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Please wait...' : 'Sign In'}
                </button>
            </form>
            <p className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
                Don't have an account? <Link to="/register">Create one</Link>
            </p>
        </div>
    );
}

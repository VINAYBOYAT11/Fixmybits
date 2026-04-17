import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Register() {
    const { register } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const cardRef = useRef(null);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        role: 'tester',
        company_name: '',
        password: '',
        confirm_password: ''
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    useEffect(() => {
        if (!cardRef.current) return;
        gsap.fromTo(
            cardRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            addToast('Account created successfully! You can now sign in.', 'success');
            navigate('/login');
        } catch (err) {
            // Extract clearest error message
            let msg = err.message || 'Registration failed';
            if (err.data && typeof err.data === 'object') {
                const firstKey = Object.keys(err.data)[0];
                if (firstKey) {
                    const val = err.data[firstKey];
                    msg = Array.isArray(val) ? val[0] : String(val);
                }
            }
            addToast(msg, 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card" ref={cardRef}>
            <h1 className="text-center">Join FixMyBits</h1>
            <p className="text-secondary text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                Create your security workspace account
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
                    <label className="form-label">Role</label>
                    <select name="role" className="form-control" value={formData.role} onChange={handleChange} required>
                        <option value="tester">Security Tester</option>
                        <option value="startup">Startup Owner</option>
                    </select>
                </div>
                {formData.role === 'startup' && (
                    <div className="form-group">
                        <label className="form-label">Company Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input 
                            type="text" 
                            name="company_name" 
                            className="form-control" 
                            placeholder="Acme Corp" 
                            onChange={handleChange}
                            required 
                        />
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        className="form-control" 
                        placeholder="Min 8 characters" 
                        onChange={handleChange}
                        required 
                        minLength="8" 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirm_password" 
                        className="form-control" 
                        placeholder="Repeat your password" 
                        onChange={handleChange}
                        required 
                        minLength="8" 
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Please wait...' : 'Create Account'}
                </button>
            </form>
            <p className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
}

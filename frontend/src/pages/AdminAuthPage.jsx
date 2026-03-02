import React, { useState } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminAuthPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isAdminRoute: true })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid Admin Credentials');
            }

            // Verify if user is actually an Admin before letting them in from this route
            if (data.user.role !== 'ADMIN') {
                throw new Error("Access Denied: You are not authorized as an Admin.");
            }

            // Success
            localStorage.setItem('voxiq_token', data.token);
            localStorage.setItem('voxiq_user', JSON.stringify(data.user));

            navigate('/admin');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050505', color: '#f8fafc', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', zIndex: 10, padding: '3rem 2rem', border: '1px solid #ef4444', boxShadow: '0 10px 40px rgba(239, 68, 68, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
                        <ShieldAlert size={32} /> HQ Secure Login
                    </div>
                </div>

                <h2 style={{ textAlign: 'center', fontSize: '1.25rem', marginBottom: '2rem', color: '#94a3b8' }}>
                    Authorized Personnel Only
                </h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Admin Email</label>
                        <input
                            type="email"
                            required
                            placeholder="admin@voxiq.ai"
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Master Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)', border: 'none' }} disabled={loading}>
                        {loading ? 'Authenticating...' : <><LogIn size={18} /> Access Control Center</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

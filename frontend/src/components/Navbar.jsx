import React from 'react';
import { Bot, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('voxiq_token') || localStorage.getItem('voxiq_admin_token');

    // Attempt to parse user to determine dashboard route
    let userRole = 'CLIENT';
    try {
        const userStr = localStorage.getItem('voxiq_user');
        if (userStr) {
            const parsed = JSON.parse(userStr);
            userRole = parsed.role;
        }
    } catch (e) { }

    let dashboardRoute = userRole === 'ADMIN' ? '/admin' : '/dashboard';

    const handleLogout = () => {
        localStorage.removeItem('voxiq_token');
        localStorage.removeItem('voxiq_admin_token');
        localStorage.removeItem('voxiq_user');
        navigate('/');
    };

    return (
        <nav>
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                <Bot size={32} color="#6366f1" />
                Voxiq
            </div>

            <div className="nav-links" style={{ display: 'none' }}> {/* Hidden on small screens */}
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>How it Works</a>
                <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>

                {token ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to={dashboardRoute}>
                            <button className="primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LayoutDashboard size={16} /> Dashboard
                            </button>
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/auth">
                        <button className="secondary" style={{ padding: '0.5rem 1rem' }}>Sign In</button>
                    </Link>
                )}
            </div>
        </nav>
    );
}

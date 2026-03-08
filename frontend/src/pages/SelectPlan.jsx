import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';

export default function SelectPlan() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSelectPlan = async (planName) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('voxiq_token');
            if (!token) {
                navigate('/auth');
                return;
            }

            const response = await fetch(`http://localhost:5001/api/auth/select-plan`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ planName })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to select plan');

            // Update local storage with new token (which now contains hasSelectedPlan: true)
            localStorage.setItem('voxiq_token', data.token);
            localStorage.setItem('voxiq_user', JSON.stringify(data.user));

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
            <div className="bg-mesh"></div>

            <div style={{ position: 'absolute', top: '2rem', left: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', zIndex: 20 }} onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={20} /> Back to Dashboard
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', zIndex: 10 }}>Choose Your Plan</h1>
            <p style={{ color: '#94a3b8', marginBottom: '3rem', zIndex: 10 }}>Select a plan to start building your AI voice agents.</p>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)', zIndex: 10 }}>{error}</div>}

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 10, width: '100%', maxWidth: '1200px' }}>

                {/* Starter Plan */}
                <div className="glass-card pricing-card" style={{ flex: '1', minWidth: '300px', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Starter</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0', color: '#6366f1' }}>$49<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mo</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0', flex: 1 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Up to 5 AI Agents</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Custom Voice Selection</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Basic Analytics</li>
                    </ul>
                    <button className="secondary" style={{ width: '100%' }} disabled={loading} onClick={() => handleSelectPlan('Starter')}>
                        {loading ? 'Processing...' : 'Select Starter'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="glass-card pricing-card" style={{ flex: '1', minWidth: '300px', padding: '2.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>MOST POPULAR</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0', color: '#6366f1' }}>$99<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mo</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0', flex: 1 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Up to 15 AI Agents</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Priority Support</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Advanced Analytics</li>
                    </ul>
                    <button className="primary" style={{ width: '100%' }} disabled={loading} onClick={() => handleSelectPlan('Pro')}>
                        {loading ? 'Processing...' : 'Select Pro'}
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className="glass-card pricing-card" style={{ flex: '1', minWidth: '300px', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Enterprise</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0', color: '#6366f1' }}>$249<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/mo</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0', flex: 1 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Up to 50 AI Agents</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Dedicated Account Manager</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}><Check size={18} color="#22c55e" /> Custom API Integrations</li>
                    </ul>
                    <button className="secondary" style={{ width: '100%' }} disabled={loading} onClick={() => handleSelectPlan('Enterprise')}>
                        {loading ? 'Processing...' : 'Select Enterprise'}
                    </button>
                </div>

            </div>
        </div>
    );
}

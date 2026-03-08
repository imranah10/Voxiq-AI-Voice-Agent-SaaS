import React, { useState } from 'react';
import { Bot, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ companyName: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [testOtpFromBackend, setTestOtpFromBackend] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        if (isLogin) {
            // LOGIN FLOW
            try {
                const response = await fetch(`http://localhost:5001/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Something went wrong');

                localStorage.setItem('voxiq_token', data.token);
                localStorage.setItem('voxiq_user', JSON.stringify(data.user));
                navigate('/dashboard');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            // REGISTRATION FLOW (2-Step)
            try {
                if (!showOtpInput) {
                    // Step 1: Request OTP
                    const response = await fetch(`http://localhost:5001/api/auth/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

                    setSuccessMsg('Email Verification sent!');
                    if (data.testOtp) {
                        setTestOtpFromBackend(data.testOtp);
                    } else {
                        setTestOtpFromBackend(''); // Ensure it's hidden if real email is active
                    }
                    setShowOtpInput(true);
                } else {
                    // Step 2: Verify OTP and Register
                    const response = await fetch(`http://localhost:5001/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...formData, otp })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Verification failed');

                    localStorage.setItem('voxiq_token', data.token);
                    localStorage.setItem('voxiq_user', JSON.stringify(data.user));
                    navigate('/dashboard');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div className="bg-mesh"></div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', zIndex: 10, padding: '3rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div className="brand">
                        <Bot size={32} color="#6366f1" /> Voxiq
                    </div>
                </div>

                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Create your SaaS Account'}
                </h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
                {successMsg && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.3)' }}>{successMsg}</div>}

                <form onSubmit={handleSubmit}>
                    {(!isLogin && showOtpInput) ? (
                        // OTP VERIFICATION STEP
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>Enter 6-Digit Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                placeholder="------"
                                style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99, 102, 241, 0.5)', color: '#fff', borderRadius: '8px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>Code sent to {formData.email}</p>

                            {testOtpFromBackend && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed #6366f1', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Test Mode OTP</span>
                                    <strong style={{ fontSize: '1.25rem', color: '#818cf8', letterSpacing: '0.25rem' }}>{testOtpFromBackend}</strong>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>(Since email is not connected yet, use this code to register)</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // STANDARD LOGIN/REGISTRATION DETAILS STEP
                        <>
                            {!isLogin && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Zomato Support"
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Business Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="founder@company.com"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Processing...' : (
                            isLogin
                                ? <><LogIn size={18} /> Sign In</>
                                : (showOtpInput ? 'Verify & Create Account' : <><UserPlus size={18} /> Continue to Verification</>)
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    {isLogin ? "New to Voxiq? " : "Already have an account? "}
                    <span
                        style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setShowOtpInput(false);
                            setTestOtpFromBackend('');
                            setSuccessMsg('');
                            setError('');
                        }}
                    >
                        {isLogin ? 'Create an account' : 'Sign in instead'}
                    </span>
                </p>

            </div>
        </div>
    );
}

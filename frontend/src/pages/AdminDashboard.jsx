import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Users, Presentation, Server, Banknote, Landmark, LogOut, Phone, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [adminMsg, setAdminMsg] = useState('');
    const [prospectPhone, setProspectPhone] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [pitchMsg, setPitchMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const token = localStorage.getItem('voxiq_token');
                const response = await fetch('http://localhost:5001/api/auth/clients', {
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (response.ok) {
                    setClients(data);
                }
            } catch (err) {
                console.error("Error fetching clients:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('voxiq_token');
        localStorage.removeItem('voxiq_user');
        navigate('/hq-admin-secure');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg('Updating...');
        try {
            const token = localStorage.getItem('voxiq_token');
            const res = await fetch('http://localhost:5001/api/auth/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setPassMsg('Password updated successfully!');
                setNewPassword('');
            } else {
                setPassMsg(data.error || 'Failed to update password');
            }
        } catch (err) {
            setPassMsg('Error connecting to server');
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setAdminMsg('Creating...');
        try {
            const token = localStorage.getItem('voxiq_token');
            const res = await fetch('http://localhost:5001/api/auth/register-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setAdminMsg('New Admin created successfully!');
                setNewAdminEmail('');
                setNewAdminPassword('');
            } else {
                setAdminMsg(data.error || 'Failed to create admin');
            }
        } catch (err) {
            setAdminMsg('Error connecting to server');
        }
    };

    const handleInitiateDemo = async () => {
        if (!prospectPhone) {
            setPitchMsg('Please enter a prospect phone number.');
            return;
        }
        setPitchMsg('Initiating call...');
        try {
            const token = localStorage.getItem('voxiq_token');
            const res = await fetch('http://localhost:5001/api/vapi/demo-outbound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ prospectPhone, customPrompt })
            });
            const data = await res.json();
            if (res.ok) {
                setPitchMsg('Demo call initiated! Prospect phone is ringing.');
            } else {
                setPitchMsg(data.error || 'Failed to initiate demo call.');
            }
        } catch (err) {
            setPitchMsg('Error connecting to backend.');
        }
    };

    const mrr = clients.length * 4999;
    const totalReserve = clients.reduce((acc, curr) => acc + ((curr.availableMinutes || 0) * 4), 0);
    const withdrawable = mrr - totalReserve;

    if (loading) {
        return <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>Loading Control Center...</div>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc' }}>

            {/* Super Admin Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#11131a', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, marginBottom: '3rem', color: '#ef4444' }}>
                    <ShieldAlert size={24} /> Super Admin
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <button onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'overview' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'overview' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <TrendingUp size={20} /> Revenue & Profit
                    </button>

                    <button onClick={() => setActiveTab('clients')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'clients' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'clients' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <Users size={20} /> Client Management
                    </button>

                    <button onClick={() => setActiveTab('demo-outbound')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'demo-outbound' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'demo-outbound' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <Presentation size={20} /> Live Pitch: Outbound Call
                    </button>

                    <button onClick={() => setActiveTab('demo-routing')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'demo-routing' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'demo-routing' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <Phone size={20} /> Live Pitch: Call Routing
                    </button>

                    <button onClick={() => setActiveTab('demo-wallet')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'demo-wallet' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'demo-wallet' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <CreditCard size={20} /> Admin Demo Wallet
                    </button>

                    <button onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'settings' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'settings' ? '#ef4444' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}>
                        <Settings size={20} /> HQ Settings
                    </button>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                        <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer' }}>
                            <LogOut size={20} /> Logout
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem', position: 'relative' }}>

                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Voxiq Financial Control Center</h1>
                    <p style={{ color: '#94a3b8', margin: 0, marginTop: '0.25rem' }}>Track gross revenue, API costs, and withdrawable profit using the Smart Reserve.</p>
                </header>

                {activeTab === 'overview' && (
                    <div>
                        {/* KPI Cards */}
                        <div className="grid-3" style={{ marginBottom: '2rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #6366f1' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Banknote size={16} /> Gross Revenue (MRR)</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>₹{mrr.toLocaleString()}</div>
                                <div style={{ fontSize: '0.875rem', color: '#22c55e', marginTop: '0.5rem' }}>+ ₹{mrr.toLocaleString()} this month ({clients.length} Clients)</div>
                            </div>

                            <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #eab308' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={16} /> Smart Reserve (Vapi Costs)</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#eab308' }}>₹{totalReserve.toLocaleString()}</div>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Locked safely to pay backend API mins.</div>
                            </div>

                            <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #22c55e' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Landmark size={16} /> Withdrawable Profit</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#22c55e' }}>₹{withdrawable.toLocaleString()}</div>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>100% safe to withdraw to personal bank.</div>
                                <button className="primary" style={{ width: '100%', marginTop: '1.5rem', background: '#22c55e' }}>Withdraw to Personal Bank</button>
                            </div>
                        </div>

                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Operational Cost Breakdown</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                                        <th style={{ padding: '1rem' }}>Resource</th>
                                        <th style={{ padding: '1rem' }}>SaaS Monthly Cost</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>Domain & DB (Hostinger/Atlas)</td>
                                        <td style={{ padding: '1rem' }}>₹1,000 / mo</td>
                                        <td style={{ padding: '1rem', color: '#22c55e' }}>Covered</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>Vapi LLM (For {clients.length} Pro clients)</td>
                                        <td style={{ padding: '1rem' }}>₹{totalReserve.toLocaleString()} / mo</td>
                                        <td style={{ padding: '1rem', color: '#eab308' }}>Reserved from Client Payments</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Client Management */}
                {activeTab === 'clients' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Enterprise Clients</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input type="text" placeholder="Search clients..." style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                                <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}><Users size={16} style={{ marginRight: '8px' }} /> Add Client</button>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>Company Name</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>Active Plan</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>Wallet Balance</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>Status</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No active clients right now.</td></tr>
                                    ) : (
                                        clients.map((client) => {
                                            const isSuspended = client.availableMinutes <= 0 && client.walletBalance <= 0;
                                            return (
                                                <tr key={client._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'transparent', transition: 'background 0.2s', cursor: 'pointer' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{client.companyName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{client.email}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{client.plan || 'Pro Platform'}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontWeight: 600, color: isSuspended ? '#ef4444' : '#22c55e' }}>{client.availableMinutes} mins</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{(client.walletBalance || 0).toFixed(2)} Wallet</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSuspended ? '#ef4444' : '#22c55e' }}></div>
                                                            <span style={{ fontSize: '0.875rem', color: isSuspended ? '#ef4444' : '#f8fafc' }}>
                                                                {isSuspended ? 'Suspended' : 'Active'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Manage</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Demo Engine for pitches: Outbound Call */}
                {activeTab === 'demo-outbound' && (
                    <div className="grid-2">
                        <div className="glass-card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Live Demo Pitch Engine</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem' }}>Secretly trigger an outbound call to a prospect's real phone number directly from Vapi API logic to showcase product capabilities.</p>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Target Prospect Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+919876543210"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    value={prospectPhone}
                                    onChange={(e) => setProspectPhone(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Custom Agent Identity (System Prompt Override)</label>
                                <textarea
                                    rows="4"
                                    placeholder="You are a sales rep for [Prospect Company Name]... Speak professionally."
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                ></textarea>
                            </div>

                            {pitchMsg && (
                                <div style={{ padding: '0.75rem', background: pitchMsg.includes('ringing') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: pitchMsg.includes('ringing') ? '#22c55e' : '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    {pitchMsg}
                                </div>
                            )}

                            <button onClick={handleInitiateDemo} className="primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                                Initiate Instant Demo Call (₹5 cost)
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>Call uses Super Admin Wallet Balance</p>
                        </div>

                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(21, 24, 33, 0.4)' }}>
                            <Presentation size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Pitch Live</h3>
                            <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '300px' }}>This tool is specifically designed for the Founder to close B2B enterprise deals on sales calls.</p>
                        </div>
                    </div>
                )}

                {/* Demo Engine for pitches: Call Routing (BYON) */}
                {activeTab === 'demo-routing' && (
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Live Pitch: Call Routing Demo</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Show clients exactly how they can connect their existing phone numbers to the AI Agents without buying new ones.</p>

                        <div className="glass-card" style={{ borderTop: '4px solid #ef4444', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 1rem', borderBottomLeftRadius: '8px', textTransform: 'uppercase' }}>Demo View</div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Connect Your Business Number</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                                You do not need to buy a new number from us. Keep your existing brand identity.
                                Simply use <strong>Unconditional Call Forwarding</strong> from your current telecom provider (AirTel, Jio, AT&T, etc.)
                                to point your customers to your AI Agent's specific backend SIP line.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>Step 1: Select Your AI Agent</label>
                                <select disabled style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', opacity: 0.7 }}>
                                    <option value="">[Demo Agent] Sales Representative</option>
                                </select>
                            </div>

                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Step 2: Forward calls to your dedicated AI server number:</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', letterSpacing: '1px' }}>+1 (555) 992-VOXIQ</div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>How to setup Call Forwarding?</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li>Dial <strong>**21*+15559928694#</strong> from your mobile phone (India/Asia standard).</li>
                                    <li>Or contact your Toll-Free provider (Exotel/Tata) to route the SIP trunk.</li>
                                    <li>If a customer dials your actual business number, they will instantly hear your AI Agent.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Demo Engine for pitches: Admin Wallet */}
                {activeTab === 'demo-wallet' && (
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Admin Demo Wallet</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Manage your personal admin account balance to fund live demonstrations and outbound testing.</p>

                        <div className="grid-2">
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(21, 24, 33, 0.9), rgba(239, 68, 68, 0.1))' }}>
                                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Current Plan</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Sandbox</div>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Internal testing and client pitches</p>

                                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Remaining Demo Minutes</h3>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ef4444', marginBottom: '1rem' }}>450 <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}> / 500 mins</span></div>

                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '90%', height: '100%', background: '#ef4444', borderRadius: '4px' }}></div>
                                </div>
                            </div>

                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1rem' }}>Pre-Paid Wallet</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>Since you are the admin, you can manually inject test funds into your wallet to cover actual Vapi API costs during pitches.</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '2rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Wallet Balance</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹2,500.00</span>
                                </div>

                                <button className="primary" style={{ width: '100%', justifyContent: 'center', background: '#eab308', color: '#000', border: 'none' }}>Inject Demo Funds (Admin Only)</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* HQ Settings */}
                {activeTab === 'settings' && (
                    <div className="glass-card" style={{ maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={24} color="#ef4444" /> Security Settings
                        </h2>

                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Change Master Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new strong password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                />
                            </div>

                            {passMsg && (
                                <div style={{ padding: '0.75rem', background: passMsg.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passMsg.includes('success') ? '#22c55e' : '#ef4444', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    {passMsg}
                                </div>
                            )}

                            <button type="submit" className="primary" style={{ background: '#ef4444' }}>Update Master Password</button>
                        </form>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '3rem 0' }} />

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={24} color="#6366f1" /> Create New Super Admin
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>Grant full HQ access to another founder or team member. They will share the Master Demo Wallet.</p>

                        <form onSubmit={handleCreateAdmin}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>New Admin Email</label>
                                <input
                                    type="email"
                                    placeholder="partner@voxiq.ai"
                                    required
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Initial Password</label>
                                <input
                                    type="password"
                                    placeholder="Temprorary Password"
                                    required
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                />
                            </div>

                            {adminMsg && (
                                <div style={{ padding: '0.75rem', background: adminMsg.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: adminMsg.includes('success') ? '#22c55e' : '#ef4444', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    {adminMsg}
                                </div>
                            )}

                            <button type="submit" className="primary" style={{ background: '#6366f1' }}>Register New Admin</button>
                        </form>
                    </div>
                )}

            </main>
        </div>
    );
}

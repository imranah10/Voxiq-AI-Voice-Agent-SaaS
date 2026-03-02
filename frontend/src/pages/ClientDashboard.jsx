import React, { useState, useEffect } from 'react';
import { Bot, Phone, FileText, CreditCard, Settings, Plus, Play, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
    const [activeTab, setActiveTab] = useState('agents');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreatingAgent, setIsCreatingAgent] = useState(false);
    const [agentForm, setAgentForm] = useState({ companyName: '', agentName: '', agentGender: 'female', agentRegion: 'international', companyRules: '' });
    const [creatingAgentLoading, setCreatingAgentLoading] = useState(false);
    const [isUploadingKB, setIsUploadingKB] = useState(false);
    const [kbFile, setKbFile] = useState(null);
    const [uploadingKBLoading, setUploadingKBLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('voxiq_token');
                const response = await fetch('http://localhost:5001/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();

                if (response.ok) {
                    setUser(data);
                } else {
                    localStorage.removeItem('voxiq_token');
                    localStorage.removeItem('voxiq_user');
                    navigate('/auth');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('voxiq_token');
        localStorage.removeItem('voxiq_user');
        navigate('/auth');
    };

    const handleCreateAgentSubmit = async (e) => {
        e.preventDefault();
        setCreatingAgentLoading(true);
        try {
            const token = localStorage.getItem('voxiq_token');
            const res = await fetch('http://localhost:5001/api/saas/create-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(agentForm)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, agents: [...(prev.agents || []), { assistantId: data.assistantId, name: data.assignedName || `${agentForm.agentName} (for ${agentForm.companyName})`, linkedNumber: 'Unassigned' }] }));
                setIsCreatingAgent(false);
                setAgentForm({ companyName: '', agentName: '', agentGender: 'female', agentRegion: 'international', companyRules: '' });
            } else {
                alert(data.error || 'Failed to create agent');
            }
        } catch (err) {
            alert('Server error');
        } finally {
            setCreatingAgentLoading(false);
        }
    };

    const handleKBUpload = async (e) => {
        e.preventDefault();
        if (!kbFile) return;
        setUploadingKBLoading(true);
        const formData = new FormData();
        formData.append('file', kbFile);
        try {
            const token = localStorage.getItem('voxiq_token');
            const res = await fetch('http://localhost:5001/api/saas/upload-kb', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, knowledgeBase: [...(prev.knowledgeBase || []), { fileName: kbFile.name, url: data.fileId, uploadedAt: new Date() }] }));
                setKbFile(null);
                setIsUploadingKB(false);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            alert('Server error');
        } finally {
            setUploadingKBLoading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>Loading Workspace...</div>;
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0f14', color: '#f8fafc' }}>

            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#151821', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, marginBottom: '3rem', color: '#fff' }}>
                    <Bot size={28} color="#6366f1" /> Voxiq
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <button
                        onClick={() => setActiveTab('agents')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'agents' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'agents' ? '#818cf8' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}
                    >
                        <Bot size={20} /> My Agents
                    </button>

                    <button
                        onClick={() => setActiveTab('knowledge')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'knowledge' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'knowledge' ? '#818cf8' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}
                    >
                        <FileText size={20} /> Knowledge Base
                    </button>

                    <button
                        onClick={() => setActiveTab('wallet')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'wallet' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'wallet' ? '#818cf8' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}
                    >
                        <CreditCard size={20} /> Billing & Wallet
                    </button>

                    <button
                        onClick={() => setActiveTab('numbers')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'numbers' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'numbers' ? '#818cf8' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 500 }}
                    >
                        <Phone size={20} /> Phone Numbers
                    </button>
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                    <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#94a3b8', cursor: 'pointer' }}>
                        <LogOut size={20} /> Logout
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem', position: 'relative' }}>
                <div className="bg-mesh" style={{ opacity: 0.5 }}></div>

                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Welcome back, {user.companyName}</h1>
                        <p style={{ color: '#94a3b8', margin: 0, marginTop: '0.25rem' }}>Manage your voice agents and calling limits.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(21, 24, 33, 0.8)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Wallet Balance: </span>
                            <strong style={{ color: '#22c55e' }}>{user.availableMinutes || 0} mins left</strong>
                        </div>
                        <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <Plus size={16} /> Recharge Wallet
                        </button>
                    </div>
                </header>

                {/* Tab Content: Agents */}
                {activeTab === 'agents' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Voice Agents</h2>
                            <button onClick={() => setIsCreatingAgent(true)} className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}><Plus size={16} /> Create New Agent</button>
                        </div>

                        {isCreatingAgent && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', border: '1px solid #6366f1' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Create AI Voice Agent</h3>
                                <form onSubmit={handleCreateAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Company Name (e.g., Zomato)"
                                        required
                                        value={agentForm.companyName}
                                        onChange={(e) => setAgentForm({ ...agentForm, companyName: e.target.value })}
                                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Agent Name (Leave blank for Auto Random Name)"
                                            value={agentForm.agentName}
                                            onChange={(e) => setAgentForm({ ...agentForm, agentName: e.target.value })}
                                            style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        />
                                        <select
                                            value={agentForm.agentGender}
                                            onChange={(e) => setAgentForm({ ...agentForm, agentGender: e.target.value })}
                                            style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        >
                                            <option value="female">Female Voice</option>
                                            <option value="male">Male Voice</option>
                                            <option value="random">Random Voice</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Target Customer Region (Controls Language & Accent)</label>
                                        <select
                                            value={agentForm.agentRegion}
                                            onChange={(e) => setAgentForm({ ...agentForm, agentRegion: e.target.value })}
                                            style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        >
                                            <option value="international">🌍 International (Global English)</option>
                                            <option value="indian">🇮🇳 Indian (Hindi + Indian English)</option>
                                        </select>
                                    </div>
                                    <textarea
                                        placeholder="System Rules (e.g., You handle refunds. Always be polite...)"
                                        required
                                        rows="4"
                                        value={agentForm.companyRules}
                                        onChange={(e) => setAgentForm({ ...agentForm, companyRules: e.target.value })}
                                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    ></textarea>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setIsCreatingAgent(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" className="primary" disabled={creatingAgentLoading}>
                                            {creatingAgentLoading ? 'Deploying...' : 'Deploy Agent to Vapi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid-3">
                            {user.agents && user.agents.length > 0 ? (
                                user.agents.map((agent, index) => (
                                    <div key={index} className="glass-card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.5rem', borderRadius: '8px' }}><Bot size={24} /></div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{agent.name}</h3>
                                                    <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>Online</span>
                                                </div>
                                            </div>
                                            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}><Settings size={18} /></button>
                                        </div>

                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>ID: {agent.assistantId}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Linked Number</div>
                                                <div style={{ fontSize: '0.875rem' }}>{agent.linkedNumber || 'Unassigned'}</div>
                                            </div>
                                            <button style={{ background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                                <Play size={14} /> Test
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#94a3b8', padding: '1rem' }}>No agents running. Click "Create New Agent" to start.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content: Knowledge Base */}
                {activeTab === 'knowledge' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Knowledge Base (RAG)</h2>
                        </div>

                        {!isUploadingKB ? (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                                <FileText size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Upload Business Documents</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                                    Upload PDFs, TXT, or Word files. Your AI agents will read these documents and use the factual data to answer customer queries accurately.
                                </p>
                                <button onClick={() => setIsUploadingKB(true)} className="primary">Browse Files</button>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '2rem', border: '1px solid #6366f1' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Upload New Document to RAG</h3>
                                <form onSubmit={handleKBUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="file"
                                        accept=".pdf,.txt,.docx"
                                        required
                                        onChange={(e) => setKbFile(e.target.files[0])}
                                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => { setIsUploadingKB(false); setKbFile(null); }} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" className="primary" disabled={uploadingKBLoading || !kbFile}>
                                            {uploadingKBLoading ? 'Uploading & Indexing...' : 'Upload to Knowledge Base'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.1rem', marginTop: '3rem', marginBottom: '1rem' }}>Uploaded Files</h3>

                        {user.knowledgeBase && user.knowledgeBase.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.knowledgeBase.map((doc, index) => (
                                    <div key={index} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <FileText size={20} color="#6366f1" />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{doc.fileName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {doc.url}</div>
                                            </div>
                                        </div>
                                        <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>No documents uploaded yet.</div>
                        )}
                    </div>
                )}

                {/* Tab Content: Wallet */}
                {activeTab === 'wallet' && (
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Billing & Usage</h2>

                        <div className="grid-2">
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(21, 24, 33, 0.9), rgba(99, 102, 241, 0.1))' }}>
                                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Current Plan</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{user.plan || 'The Pro Platform'}</div>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>₹4,999/mo (Includes 500 mins)</p>

                                <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Remaining Minutes</h3>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#22c55e', marginBottom: '1rem' }}>{user.availableMinutes || 0} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}> / 500 mins</span></div>

                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '97%', height: '100%', background: '#22c55e', borderRadius: '4px' }}></div>
                                </div>
                            </div>

                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1rem' }}>Pre-Paid Wallet</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>Top up your wallet to cover overage charges (₹10/min) once your monthly free minutes run out. If wallet hits ₹0, AI calls will be temporarily paused to protect from overdrafts.</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '2rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Wallet Balance</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{(user.walletBalance || 0).toFixed(2)}</span>
                                </div>

                                <button className="primary" style={{ width: '100%', justifyContent: 'center' }}>+ Add Funds via Razorpay</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Phone Numbers & Call Routing (BYON) */}
                {activeTab === 'numbers' && (
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Call Routing (Bring Your Own Number)</h2>

                        <div className="glass-card" style={{ borderTop: '4px solid #6366f1', padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Connect Your Business Number</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                                You do not need to buy a new number from us. Keep your existing brand identity.
                                Simply use <strong>Unconditional Call Forwarding</strong> from your current telecom provider (AirTel, Jio, AT&T, etc.)
                                to point your customers to your AI Agent's specific backend SIP line.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>Step 1: Select Your AI Agent</label>
                                <select
                                    style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                >
                                    <option value="">-- Choose an Agent to link --</option>
                                    {user.agents?.map(agent => (
                                        <option key={agent.assistantId} value={agent.assistantId}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Step 2: Forward calls to your dedicated AI server number:</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', letterSpacing: '1px' }}>+1 (555) 992-VOXIQ</div>
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

            </main>
        </div>
    );
}

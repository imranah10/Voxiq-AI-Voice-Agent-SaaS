import React, { useState } from 'react';
import { CheckCircle2, Mic } from 'lucide-react';

export default function Demo() {
    const [demoActive, setDemoActive] = useState(false);

    return (
        <section id="demo">
            <div className="grid-2">
                <div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Talk to Voxiq <br /><span style={{ color: '#6366f1' }}>Right Now.</span>
                    </h2>
                    <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
                        Experience the magic yourself. Our demo agent acts as a Receptionist for a luxury Dental Clinic. Go ahead, ask about our services, timings, or try to book an appointment.
                    </p>
                    <ul style={{ listStyle: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 color="#22c55e" /> Interrupt it mid-sentence.</li>
                        <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 color="#22c55e" /> Ask complex compounded questions.</li>
                        <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 color="#22c55e" /> Speak in English or Hindi (Hinglish).</li>
                    </ul>
                </div>

                <div className="glass-card demo-interface">
                    <div className="demo-header">
                        <div className="dot red"></div>
                        <div className="dot yellow"></div>
                        <div className="dot green"></div>
                    </div>
                    <div className="demo-body">
                        <div className={`pulse-ring ${demoActive ? 'active' : ''}`}>
                            <div className={`mic-btn ${demoActive ? 'active' : ''}`} onClick={() => setDemoActive(!demoActive)}>
                                <Mic size={32} color="white" />
                            </div>
                        </div>
                        <h3 style={{ marginTop: '2rem', fontSize: '1.5rem', color: '#fff' }}>
                            {demoActive ? "AI is Listening..." : "Click Mic to Call"}
                        </h3>
                        <p style={{ color: demoActive ? '#ef4444' : '#6366f1', fontWeight: '500', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {demoActive ? "Speak into your microphone" : "Ensure microphone permissions are allowed"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

import React from 'react';

export default function HowItWorks() {
    return (
        <section id="how-it-works">
            <h2 className="section-title">Launch in 3 Simple Steps.</h2>
            <p className="section-subtitle">You don't need to be a developer to build an AI Voice Agent. Our platform is strictly No-Code.</p>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
                <div className="step-item">
                    <div className="step-number">1</div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Create Your Company Profile</h3>
                        <p className="text-muted">Sign up and give your Agent a name (e.g., 'Anjali'). Tell us your base system prompt describing what the agent's goal is (Sales, Support, or Booking).</p>
                    </div>
                </div>

                <div className="step-item">
                    <div className="step-number" style={{ background: '#ec4899' }}>2</div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Upload Your Brain (PDFs)</h3>
                        <p className="text-muted">Upload your return policies, pricing documents, or menus. Our RAG engine processes it so your AI never hallucinates or gives false answers.</p>
                    </div>
                </div>

                <div className="step-item" style={{ marginBottom: 0 }}>
                    <div className="step-number" style={{ background: '#22c55e' }}>3</div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Get Your Number & Go Live</h3>
                        <p className="text-muted">Instantly buy a new virtual phone number or simply "Call Forward" your existing business number to our secure AI backend. You're live!</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

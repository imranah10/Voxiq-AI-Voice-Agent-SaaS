import React from 'react';
import { Users, Zap, ShieldCheck } from 'lucide-react';

export default function Features() {
    return (
        <section id="features">
            <h2 className="section-title">A Superhuman Sales & Support Team.</h2>
            <p className="section-subtitle">Voxiq agents don't just speak; they think, reason, and resolve queries exactly like your best employee would.</p>

            <div className="grid-3">
                <div className="glass-card feature-card">
                    <div className="icon-box">
                        <Users size={24} />
                    </div>
                    <h3>Infinite Scalability</h3>
                    <p className="text-muted">Whether you get 1 call or 1,000 simultaneously, Voxiq automatically spins up virtual agents. Your customers will never hear a busy tone again.</p>
                </div>

                <div className="glass-card feature-card">
                    <div className="icon-box pink">
                        <Zap size={24} />
                    </div>
                    <h3>Sub-Second Latency</h3>
                    <p className="text-muted">Powered by Groq's LPU and advanced WebRTC infrastructure. Voice responses happen in under 500ms, making conversations feel 100% human.</p>
                </div>

                <div className="glass-card feature-card">
                    <div className="icon-box green">
                        <ShieldCheck size={24} />
                    </div>
                    <h3>Plug & Play Wisdom (RAG)</h3>
                    <p className="text-muted">No coding required. Simply upload your company's PDFs, Word docs, or website links, and the AI agent instantly learns every policy and product detail.</p>
                </div>
            </div>
        </section>
    );
}

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
    return (
        <section id="pricing">
            <h2 className="section-title">Transparent Pricing. Zero Surprises.</h2>
            <p className="section-subtitle">Only pay for the value you generate. No hidden setup fees. API costs are automatically managed via our Smart Reserve system.</p>

            <div className="grid-2" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* The Pro Plan */}
                <div className="glass-card pricing-card popular">
                    <div className="popular-banner">MOST POPULAR</div>
                    <h3 style={{ fontSize: '1.5rem', color: '#a5b4fc' }}>The Pro Platform</h3>
                    <div className="price">₹4,999 <span>/ month</span></div>
                    <p className="text-muted">Everything a growing business needs to automate customer interactions completely.</p>

                    <ul className="pricing-features">
                        <li><CheckCircle2 size={20} color="#6366f1" /> <strong>500 Minutes</strong> of Free AI Calling included.</li>
                        <li><CheckCircle2 size={20} color="#6366f1" /> <strong>Up to 15 Custom AI Agents.</strong></li>
                        <li><CheckCircle2 size={20} color="#6366f1" /> Dashboard Analytics & Call Recordings.</li>
                        <li><CheckCircle2 size={20} color="#6366f1" /> Unlimited PDF Knowledge base uploads.</li>
                    </ul>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Over-usage (Pay-as-you-go): <strong style={{ color: '#fff' }}>₹10 / minute</strong> after free minutes run out.</span>
                    </div>

                    <button className="primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started Now</button>
                </div>

                {/* Enterprise Plan */}
                <div className="glass-card pricing-card">
                    <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Enterprise Scale</h3>
                    <div className="price">Custom <span>Volume</span></div>
                    <p className="text-muted">For call centers, BPOs, and franchises handling over 10,000+ calls per day.</p>

                    <ul className="pricing-features">
                        <li><CheckCircle2 size={20} color="#94a3b8" /> <strong>Up to 50 Custom AI Agents.</strong></li>
                        <li><CheckCircle2 size={20} color="#94a3b8" /> Bring Your Own Carrier (SIP Trunking).</li>
                        <li><CheckCircle2 size={20} color="#94a3b8" /> Custom API Webhooks to your internal CRM.</li>
                        <li><CheckCircle2 size={20} color="#94a3b8" /> Dedicated Account Manager.</li>
                    </ul>

                    <button className="secondary" style={{ width: '100%', marginTop: '3.75rem' }}>Contact Sales</button>
                </div>

            </div>
        </section>
    );
}

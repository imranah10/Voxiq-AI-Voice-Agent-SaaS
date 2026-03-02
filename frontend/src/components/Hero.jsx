import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <>
            <header className="hero">
                <div className="badge">
                    <Globe size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                    Available Internationally & in India
                </div>
                <h1>Never Miss A Customer Again.</h1>
                <p>
                    Deploy hyper-realistic, 24/7 AI Voice Customer Care for your business in minutes.
                    Upload your knowledge base. Choose a voice. Voxiq handles the conversation.
                </p>
                <div className="hero-actions">
                    <button className="primary" onClick={() => window.location.href = '#pricing'}>
                        Start Building Free <ArrowRight size={18} />
                    </button>
                    <button className="secondary" onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}>
                        Listen to Demo
                    </button>
                </div>
            </header>

            {/* Trust Bar */}
            <div className="trust-bar">
                <div className="container">
                    <p>BUILT ON ENTERPRISE INFRASTRUCTURE</p>
                    <div className="logos">
                        <div>Groq AI</div>
                        <div>Vapi.ai</div>
                        <div>Twilio</div>
                        <div>Llama 3</div>
                    </div>
                </div>
            </div>
        </>
    );
}

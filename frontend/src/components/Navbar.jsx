import React from 'react';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav>
            <div className="brand">
                <Bot size={32} color="#6366f1" />
                Voxiq
            </div>
            <div className="nav-links" style={{ display: 'none' }}> {/* Hidden on small screens */}
            </div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>How it Works</a>
                <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
                <Link to="/auth">
                    <button className="secondary" style={{ padding: '0.5rem 1rem' }}>Sign In</button>
                </Link>
            </div>
        </nav>
    );
}

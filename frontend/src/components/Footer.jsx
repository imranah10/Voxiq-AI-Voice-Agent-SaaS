import React from 'react';
import { Bot } from 'lucide-react';

export default function Footer() {
    return (
        <footer>
            <div>
                <div className="brand" style={{ marginBottom: '1rem' }}>
                    <Bot size={28} color="#6366f1" /> Voxiq
                </div>
                <p className="text-muted" style={{ maxWidth: '300px' }}>The next generation of AI Voice infrastructure for scalable businesses and smart founders.</p>
            </div>
            <div className="footer-links">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
            </div>
            <div className="footer-links">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Contact Sales</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
        </footer>
    );
}

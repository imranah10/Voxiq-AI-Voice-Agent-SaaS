import React from 'react';
import { Plus } from 'lucide-react';

export default function FAQ() {
    return (
        <section id="faq" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title">Frequently Asked Questions</h2>

            <div className="faq-box">
                <div className="faq-q">What if my company already has a famous phone number? <Plus size={20} /></div>
                <div className="faq-a">No problem at all! You do not need to change your marketing numbers. We generate a hidden backend AI number for you. You simply ask your telecom provider (Jio/Airtel) to "Forward" incoming calls to our AI number. Your customers will never know the difference.</div>
            </div>

            <div className="faq-box">
                <div className="faq-q">How does the billing and wallet system work? <Plus size={20} /></div>
                <div className="faq-a">We use a pre-paid "Smart Reserve" system. Your ₹4,999 plan gives you 500 minutes. If your business goes viral and you burn through all 500 minutes, the AI will pause and ask you to top-up your wallet. You will never receive a surprise bill at the end of the month.</div>
            </div>

            <div className="faq-box">
                <div className="faq-q">Can the AI speak Indian languages or Indian accents? <Plus size={20} /></div>
                <div className="faq-a">Yes! Our voice models are trained on diverse datasets. You can configure your agent to speak English with an Indian accent, heavy Hindi, or a natural mix of 'Hinglish'.</div>
            </div>
        </section>
    );
}

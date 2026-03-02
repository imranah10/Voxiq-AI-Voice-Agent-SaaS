import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Demo from '../components/Demo';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function LandingPage() {
    return (
        <>
            <div className="bg-mesh"></div>

            <div className="container">
                <Navbar />
                <Hero />
            </div>

            <div className="container" style={{ marginTop: '2rem' }}>
                <Features />
                <Demo />
                <HowItWorks />
                <Pricing />
                <FAQ />
                <Footer />
            </div>
        </>
    );
}

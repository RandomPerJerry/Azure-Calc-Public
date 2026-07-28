import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/Icons/logo.png';
import '../assets/styles/landing-page.css';

function LandingPage() {
    const navigate = useNavigate();

    const handleEnter = () => {
        navigate('/home'); 
    };

    return (
        <div className="landing-page">
            <div className="landing-container">
                <header className="landing-header">
                    <div className="logo-container">
                        <img src={logo} alt="AzurE E-ship Logo" className="landing-logo" />
                        <h1 className="landing-title">AzurE E-Ship</h1>
                    </div>
                    <p className="landing-subtitle">Electric Ship System Calculator</p>
                </header>

                <main className="landing-main">
                    <div className="description">
                        <p>Software for designing and analyzing electric and hybrid vessel systems. 
                        Create comprehensive system designs, analyze performance metrics, and generate detailed reports 
                        for your electric vessel projects.</p>
                    </div>

                    <div className="cta-section">
                        <button 
                            className="enter-button"
                            onClick={handleEnter}
                        >
                            Enter
                        </button>
                    </div>
                </main>

                <footer className="landing-footer">
                    <p>© 2025 General Energies Electrical Ship (Shanghai) Limited</p>
                </footer>
            </div>
        </div>
    );
}

export default LandingPage;
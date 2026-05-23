import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar({
    activeTab,
    setActiveTab,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isDarkMode,
    setIsDarkMode
}) {
    
    const router = useRouter();

    //========================================
    // LOG OUT
    //========================================
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    //========================================
    // TOGGLE THEME
    //========================================
    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <>
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>REGISTRAR</span>
                    </div>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-btn ${activeTab === 'masterlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('masterlist')}
                    >
                        👥 Masterlist
                    </button>
                </nav>
                <div className="sidebar-bottom">
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="nav-btn logout" onClick={handleLogout}>Log Out</button>
                </div>
            </aside>
        </>
    )
}
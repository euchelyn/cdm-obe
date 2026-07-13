import { useState } from "react";
import { useRouter } from "next/navigation";
import '../../globals.css';

export default function Sidebar({
    activeTab,
    setActiveTab,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isDarkMode,
    setIsDarkMode
}) {
    
  const router = useRouter(); 

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        localStorage.removeItem('current_user');
        router.push('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
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
                    <button className="nav-btn logout sidebar-logout-btn" onClick={handleLogoutClick}>
    Log Out
</button>

                </div>
            </aside>
        </>
    )
}
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function AlumniSidebar({
    isDarkMode,
    activeTab, setActiveTab,
    activeModal, setActiveModal,
    toggleTheme,
}) {
const router = useRouter(); // (Kung meron na nito sa code mo, huwag mo na i-copy ito)
    
    // Ito yung hinahanap ng system na nawawala:
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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



    return(
        <>
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span>Alumni</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        📊 Dashboard
                    </button>
                    <button className={`nav-btn ${activeTab === 'employer' ? 'active' : ''}`} onClick={() => setActiveTab('employer')}>
                        💼 PEO Employer Tracker
                    </button>
                    <button className={`nav-btn ${activeTab === 'determinants' ? 'active' : ''}`} onClick={() => setActiveTab('determinants')}>
                        📚 Determinant Courses
                    </button>

                    <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}></div>
                    
                    <button className="nav-btn" onClick={() => setActiveModal('guide')}>System Guide / FAQs</button>
                    <button className="nav-btn" onClick={() => setActiveModal('correction')}>🛠️ Data Correction</button>
                </nav>

                <div className="sidebar-bottom">
                    <button className="nav-btn logout" onClick={handleLogoutClick}>
    Log Out
</button>
{showLogoutConfirm && (
    <div className="modal-overlay">
        <div className="modal-card">
            <h2>Log Out</h2>
            <p>Are you sure you want to exit the dashboard?</p>

            <div className="modal-actions">
                <button 
                    className="cancel-btn" 
                    onClick={cancelLogout} 
                >
                    Cancel
                </button>
                <button 
                    className="logout-confirm-btn" 
                    onClick={confirmLogout}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
)}
                </div>
            </aside> 
        </>
    )
}
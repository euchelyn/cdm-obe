

export default function AlumniSidebar({
    isDarkMode,
    activeTab, setActiveTab,
    activeModal, setActiveModal,
    toggleTheme,
    handleLogout

}) {

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
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="nav-btn logout" onClick={handleLogout}>Log Out</button>
                </div>
            </aside> 
        </>
    )
}
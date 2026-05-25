


export default function PCSidebar({
    activeMenu, setActiveMenu,
    toggleTheme,
    isDarkMode,
    router
}) {

    return (
        <>
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: '#ef4444', fontWeight: 'bold', letterSpacing: '1px' }}>CHAIR</span>
                    </div>
                </div>

                <nav className="nav-menu">
                <button className={`nav-btn ${activeMenu === 'overview' ? 'active' : ''}`} onClick={() => setActiveMenu('overview')}>
                        📊 Program Overview
                    </button>
                <button className={`nav-btn ${activeMenu === 'masterlist' ? 'active' : ''}`} onClick={() => setActiveMenu('masterlist')}>
                        👥 Masterlist
                    </button>
                    <button className={`nav-btn ${activeMenu === 'direct' ? 'active' : ''}`} onClick={() => setActiveMenu('direct')}>
                        📝 Direct Assessment
                    </button>
                    <button className={`nav-btn ${activeMenu === 'indirect' ? 'active' : ''}`} onClick={() => setActiveMenu('indirect')}>
                        📋 Indirect Assessment
                    </button>
                    <button className={`nav-btn ${activeMenu === 'determinants' ? 'active' : ''}`} onClick={() => setActiveMenu('determinants')}>
                        ⚙️ Determinants
                    </button>
                    <button className={`nav-btn ${activeMenu === 'analytics' ? 'active' : ''}`} onClick={() => setActiveMenu('analytics')}>
                        📈 Reports & Analytics
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="nav-btn logout" onClick={() => router.push('/')}>Log Out</button>
                </div>
            </aside>
        </>
    )
}

export default function FacultySidebar({
    activeTab, setActiveTab,
    setAssessmentStep,
    setSelectedCourseForAssessment,
    setSelectedPOs,
    setGradingMethod,
    setGradingView,
    setSelectedCourseForGrading,
    setSelectedBlockForGrading,
    setSelectedStudentForGrading,
    isDarkMode, setIsDarkMode,
    router
}) {

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

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('current_user');
        router.push('/');
        }
    };
    
    return(
        <>
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                        <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: '#10b981', fontWeight: 'bold', letterSpacing: '1px' }}>FACULTY</span>
                    </div>
                </div>
                
                <nav className="nav-menu">
                    <button
                        className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                
                    <button
                        className={`nav-btn ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        ⚙️ Manage Courses
                    </button>
                
                    <button
                        className={`nav-btn ${activeTab === 'assessment' ? 'active' : ''}`}
                        onClick={() => {
                        setActiveTab('assessment');
                        setAssessmentStep(1);
                        setSelectedCourseForAssessment('');
                        setSelectedPOs([]);
                        setGradingMethod('');
                        }}
                    >
                        📋 Assessment Setup
                    </button>
                
                    <button
                        className={`nav-btn ${activeTab === 'viewAssessments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('viewAssessments')}
                    >
                        ✓ View Assessments
                    </button>
                
                    <button
                        className={`nav-btn ${activeTab === 'grading' ? 'active' : ''}`}
                        onClick={() => {
                        setActiveTab('grading');
                        setGradingView('list');
                        setSelectedCourseForGrading('');
                        setSelectedBlockForGrading('');
                        setSelectedStudentForGrading('');
                        }}
                    >
                        ⭐ Grade Students
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
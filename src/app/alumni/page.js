'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './alumni-globals.css';

export default function AlumniDashboard() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(true);
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [surveyTab, setSurveyTab] = useState('po'); 
    
    const [activeModal, setActiveModal] = useState(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    const [dbUser, setDbUser] = useState(null);

    const [employerStatus, setEmployerStatus] = useState('Pending');
    const [employmentStatus, setEmploymentStatus] = useState(''); 
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [savedJobStatus, setSavedJobStatus] = useState('Not Updated');
    const [showInviteBtn, setShowInviteBtn] = useState(true);

    const [userData, setUserData] = useState({
        name: 'Loading...',
        batch: '2026',
        program: 'Loading...',
        initials: '...'
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        const session = JSON.parse(localStorage.getItem('current_user') || '{}');
        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');
        
        if (session && session.id) {
            const fullUser = db.find(student => student.id === session.id);
            
            if (fullUser) {
                setDbUser(fullUser);
                setEmployerStatus(fullUser.employerStatus || 'Pending');
                setSavedJobStatus(fullUser.employmentStatus || 'Not Updated');

                const nameParts = fullUser.name.split(' ').filter(n => n);
                let generatedInitials = 'AL';
                if (nameParts.length >= 2) {
                    generatedInitials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase();
                } else if (nameParts.length === 1) {
                    generatedInitials = nameParts[0].substring(0, 2).toUpperCase();
                }

                setUserData({
                    name: fullUser.name,
                    batch: fullUser.batch,
                    program: fullUser.program || 'B.S. Computer Engineering',
                    initials: generatedInitials
                });
            }
        } else {
            router.push('/');
        }
    }, [router]);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
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

    const handleSaveJobUpdate = () => {
        if (!dbUser) return;
        
        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');
        const updatedDb = db.map(student => {
            if (student.id === dbUser.id) {
                return {
                    ...student,
                    employmentStatus: employmentStatus,
                    jobTitle: employmentStatus === 'employed' ? jobTitle : '',
                    companyName: employmentStatus === 'employed' ? companyName : ''
                };
            }
            return student;
        });

        localStorage.setItem('obe_masterlist', JSON.stringify(updatedDb));
        
        setSavedJobStatus(employmentStatus);
        setDbUser({ ...dbUser, employmentStatus: employmentStatus, jobTitle, companyName });
        setActiveModal(null);
        setEmploymentStatus('');
        setJobTitle('');
        setCompanyName('');
        alert('Job Status Updated!');
    };

    const handleSendInvite = () => {
        if (!dbUser) return;

        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');
        const updatedDb = db.map(student => {
            if (student.id === dbUser.id) {
                return { ...student, employerStatus: 'sent' };
            }
            return student;
        });

        localStorage.setItem('obe_masterlist', JSON.stringify(updatedDb));
        setEmployerStatus('sent');
        setIsInviteOpen(false);
        alert('Official Invitation Sent!');
    };

    const currentYear = 2026;
    const gradYear = parseInt(userData.batch) || 2026;
    const yearsSinceGrad = currentYear - gradYear;

    const isPOCompleted = dbUser?.surveyProgress === '100%';
    const isGTSCompleted = dbUser?.tracerProgress === '100%';
    const isYearlyCompleted = dbUser?.yearlyProgress === '100%';
    const isPEOCompleted = dbUser?.peoProgress === '100%';

    const isPEORequired = yearsSinceGrad >= 3;
    const peoUnlockYear = gradYear + 3;

    let requiredSurveys = 3;
    if (isPEORequired) requiredSurveys = 4;

    let completedSurveys = 0;
    let pendingList = [];

    if (isPOCompleted) completedSurveys++; else pendingList.push('1st Year (PO Survey)');
    if (isGTSCompleted) completedSurveys++; else pendingList.push('Graduate Tracer Study');
    if (isYearlyCompleted) completedSurveys++; else pendingList.push(`Yearly Update (${currentYear})`);
    
    if (isPEORequired) {
        if (isPEOCompleted) completedSurveys++; else pendingList.push('3-5 Year (PEO Survey)');
    }

    const progressPercent = Math.round((completedSurveys / requiredSurveys) * 100);

    const activeTabStyle = {
        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold', fontSize: '0.9rem',
        backgroundColor: 'var(--gold)', color: '#111827', border: 'none', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)', display: 'flex', alignItems: 'center', gap: '8px'
    };

    const inactiveTabStyle = {
        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500', fontSize: '0.9rem',
        backgroundColor: 'transparent', color: 'var(--text-sub)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px'
    };

    const renderSurveyTabContent = () => {
        if (surveyTab === 'po') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>1st Year (PO Survey)</h2>
                        <span style={{ backgroundColor: isPOCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isPOCompleted ? '#10b981' : '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isPOCompleted ? 'Completed ✅' : 'Available 🟢'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Required for 1st-year graduates to assess early career alignment and basic attainment of Program Outcomes.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Estimated time to complete: 5-10 minutes.</li>
                            <li>Evaluates proficiency in core engineering principles.</li>
                            <li>Your responses are kept strictly confidential.</li>
                        </ul>
                    </div>
                    <button className={isPOCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => router.push('/alumni/survey')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isPOCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                        {isPOCompleted ? 'Review Responses' : 'Start PO Survey'}
                    </button>
                </div>
            );
        }
        
        if (surveyTab === 'peo') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>3-5 Year (PEO Survey)</h2>
                        <span style={{ backgroundColor: isPEORequired ? (isPEOCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'rgba(255,255,255,0.1)', color: isPEORequired ? (isPEOCompleted ? '#10b981' : '#3b82f6') : 'var(--text-sub)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isPEORequired ? (isPEOCompleted ? 'Completed ✅' : 'Available 🟢') : 'Locked 🔒'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Evaluates career progression and advanced professional skills 3 to 5 years after graduation.
                    </p>

                    {!isPEORequired ? (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '5px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Not Yet Applicable</h3>
                            <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.9rem' }}>Unlocks automatically in the year <strong>{peoUnlockYear}</strong>.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    <li>Focuses on leadership and professional ethics.</li>
                                    <li>Coordinates directly with Employer feedback.</li>
                                </ul>
                            </div>
                            <button className={isPEOCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => router.push('/alumni/survey')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isPEOCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                                {isPEOCompleted ? 'Review Responses' : 'Start PEO Survey'}
                            </button>
                        </>
                    )}
                </div>
            );
        }

        if (surveyTab === 'yearly') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Yearly Update Survey</h2>
                        <span style={{ backgroundColor: isYearlyCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isYearlyCompleted ? '#10b981' : '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isYearlyCompleted ? 'Completed ✅' : 'Available 🟢'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        A quick annual check-in to keep your employment profile updated for A.Y. <strong>{currentYear}</strong>.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Required annually to track alumni success.</li>
                            <li>Updates current job title and industry sector.</li>
                            <li>Takes less than 3 minutes.</li>
                        </ul>
                    </div>
                    <button className={isYearlyCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => router.push('/alumni/survey')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isYearlyCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                        {isYearlyCompleted ? 'Review Responses' : 'Start Yearly Survey'}
                    </button>
                </div>
            );
        }

        if (surveyTab === 'gts') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: '0', fontSize: '1.5rem', color: 'var(--text-main)' }}>Graduate Tracer Study (GTS)</h2>
                        <span style={{ backgroundColor: isGTSCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isGTSCompleted ? '#10b981' : '#f59e0b', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isGTSCompleted ? 'Completed ✅' : 'Pending 🟡'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        The comprehensive tracer study required by CHED to evaluate overall curriculum relevance.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Standardized CHED format.</li>
                            <li>Covers complete educational & employment history.</li>
                            <li>Takes roughly 10-15 minutes.</li>
                        </ul>
                    </div>
                    <button className={isGTSCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => router.push('/alumni/tracer')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isGTSCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                        {isGTSCompleted ? 'Review Responses' : 'Start Tracer Study'}
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="portal-layout" style={{ height: '100vh', overflow: 'hidden' }}>
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

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', padding: '40px' }}>
                <header className="alumni-header">
                    <div className="profile-ring">
                        <div className="profile-pic" style={{ backgroundColor: '#ffd700', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '500' }}>
                            {userData.initials}
                        </div>
                    </div>
                    <div className="header-text">
                        <h1>Hello, Engineer !</h1>
                        <p><strong>{userData.name}</strong> | {userData.program} | Batch {userData.batch}</p>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, overflowX: 'auto', paddingBottom: '5px' }}>
                            <button 
                                onClick={() => setSurveyTab('po')} 
                                style={surveyTab === 'po' ? activeTabStyle : inactiveTabStyle}
                            >
                                📊 PO Survey 
                            </button>
                            <button 
                                onClick={() => setSurveyTab('peo')} 
                                style={surveyTab === 'peo' ? activeTabStyle : inactiveTabStyle}
                            >
                                📈 PEO Survey
                                {!isPEORequired && <span style={{ marginLeft: '4px', fontSize: '0.8rem', opacity: 0.7 }}>🔒</span>}
                            </button>
                            <button 
                                onClick={() => setSurveyTab('yearly')} 
                                style={surveyTab === 'yearly' ? activeTabStyle : inactiveTabStyle}
                            >
                                📅 Yearly Update
                            </button>
                            <button 
                                onClick={() => setSurveyTab('gts')} 
                                style={surveyTab === 'gts' ? activeTabStyle : inactiveTabStyle}
                            >
                                🎓 Tracer Study
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                {renderSurveyTabContent()}
                            </div>

                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Completion Progress</h3>
                                </div>
                                
                                <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: progressPercent === 100 ? '#10b981' : 'var(--text-main)', lineHeight: '1', marginBottom: '15px' }}>
                                    {progressPercent}<span style={{ fontSize: '1.8rem', color: 'var(--text-sub)' }}>%</span>
                                </div>

                                <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '20px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--gold)', borderRadius: '6px', transition: 'width 1s ease' }}></div>
                                </div>

                                <div style={{ paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {pendingList.length > 0 ? (
                                        <>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Pending Forms to Submit:</p>
                                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--gold)', lineHeight: '1.6' }}>
                                                {pendingList.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                                            ✅ All required surveys completed!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employer' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                        <div className="pc-header" style={{ marginBottom: '20px' }}>
                            <h1 style={{ fontSize: '1.8rem', marginBottom: '5px', color: 'var(--gold)' }}>PEO Employer Tracker</h1>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>Manage your employment status and request employer feedback for PEO compliance.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ fontSize: '1.8rem' }}>💼</div>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Current Work Status</h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0', fontSize: '0.95rem' }}>
                                    <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                        Status: <span style={{ float: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>{savedJobStatus.toUpperCase()}</span>
                                    </li>
                                    {savedJobStatus === 'employed' && (
                                        <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                            Company: <span style={{ float: 'right', color: 'var(--text-main)', textAlign: 'right', maxWidth: '60%' }}>{dbUser?.companyName || 'Not specified'}</span>
                                        </li>
                                    )}
                                </ul>

                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--gold)', margin: '0 0 8px 0' }}>💡 Why keep this updated?</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.5' }}>
                                        Accurate records help us align our curriculum with industry trends, ensuring graduates remain highly competitive in the job market.
                                    </p>
                                </div>

                                <button className="outline-btn" onClick={() => setActiveModal('jobUpdate')} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold', width: '100%', marginTop: '20px' }}>
                                    ✎ Update Work Status
                                </button>
                            </div>

                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.1rem' }}>Employer Evaluation Status</h3>
                                    <span style={{ fontSize: '1.3rem' }}>
                                        {(savedJobStatus === 'unemployed' || savedJobStatus === 'Not Updated') ? '🚫' : employerStatus === 'Pending' ? '⏳' : employerStatus === 'sent' ? '✉️' : '✅'}
                                    </span>
                                </div>
                                
                                {(savedJobStatus === 'unemployed' || savedJobStatus === 'self-employed' || savedJobStatus === 'Not Updated') ? (
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1rem' }}><strong>Status:</strong> Not Applicable</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>
                                            {savedJobStatus === 'self-employed' 
                                                ? "Employer evaluation is not required for self-employed alumni or business owners." 
                                                : savedJobStatus === 'Not Updated' 
                                                ? "Please update your employment status to determine if this section is applicable." 
                                                : "Employer evaluation is not required for your current employment status."}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}><strong>Status:</strong> {
                                                employerStatus === 'Pending' ? <span style={{ color: '#f59e0b' }}>Waiting to invite employer</span> : 
                                                employerStatus === 'sent' ? <span style={{ color: '#3b82f6' }}>Invitation Sent!</span> : 
                                                <span style={{ color: '#10b981' }}>Evaluation Completed!</span>
                                            }</p>
                                            
                                            {showInviteBtn && employerStatus === 'Pending' && (
                                                <button 
                                                    className="primary-btn" 
                                                    onClick={() => { setIsInviteOpen(true); setShowInviteBtn(false); }} 
                                                    style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}
                                                >
                                                    + Send Invitation
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6', marginBottom: isInviteOpen ? '15px' : '0' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.5' }}>
                                                <strong>How it works:</strong> Your employer receives a secure link to provide confidential feedback based on PEOs. This directly supports program quality improvement.
                                            </p>
                                        </div>

                                        <div style={{ maxHeight: isInviteOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <input type="text" placeholder="HR / Supervisor Name" className="correction-textbox" style={{ height: '40px', padding: '0 15px', fontSize: '0.9rem', backgroundColor: 'var(--bg-main)' }} />
                                                <input type="email" placeholder="Company Email Address" className="correction-textbox" style={{ height: '40px', padding: '0 15px', fontSize: '0.9rem', backgroundColor: 'var(--bg-main)' }} />
                                                
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                                    <button className="outline-btn cancel-btn" onClick={() => { setIsInviteOpen(false); setTimeout(() => setShowInviteBtn(true), 400); }} style={{ padding: '10px', borderRadius: '6px', flex: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Cancel</button>
                                                    <button className="primary-btn" onClick={handleSendInvite} style={{ padding: '10px', borderRadius: '6px', flex: 1, border: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>Send Link</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'determinants' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                        <div className="portal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', flexShrink: 0 }}>
                            <div>
                                <h2 style={{ color: 'var(--gold)', margin: '0 0 5px 0', fontSize: '1.5rem' }}>Direct Assessment Portfolio</h2>
                                <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>Synced in real-time from the Program Chair's Evaluation Masterlist.</p>
                            </div>
                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                ✅ Access Granted
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {(dbUser?.evaluatedCourses || [
                                { code: 'Determinant 1', name: 'Mathematics & Basic Engineering', po: 'PO a-d', grade: dbUser?.det1Grade, icon: '📐' },
                                { code: 'Determinant 2', name: 'Core Computer Engineering', po: 'PO e-h', grade: dbUser?.det2Grade, icon: '💻' },
                                { code: 'Determinant 3', name: 'OJT & Capstone Design', po: 'PO i-l', grade: dbUser?.det3Grade, icon: '⚙️' }
                            ]).map((course, idx) => (
                                <div key={idx} className="portal-card" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{course.icon || '📘'}</div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{course.code}</h3>
                                    <p style={{ margin: '0 0 25px 0', fontSize: '0.9rem', color: 'var(--text-sub)' }}>{course.name} ({course.po})</p>
                                    
                                    <div style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>Evaluated Grade:</span>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: course.grade ? 'var(--gold)' : 'var(--text-main)' }}>
                                            {course.grade || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {activeModal === 'guide' && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ margin: '0 0 15px 0', color: 'var(--gold)' }}>System Guide & FAQs</h2>
                        <div style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            <p style={{ marginBottom: '5px', color: 'var(--gold)' }}><strong>How are surveys unlocked?</strong></p>
                            <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)' }}>The system automatically unlocks specific surveys based on your graduation batch. The PEO survey will only be available 3 years after your graduation year.</p>
                            
                            <p style={{ marginBottom: '5px', color: 'var(--gold)' }}><strong>Why is my Employer Tracker pending?</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-sub)' }}>If you are currently employed in a company, you need to provide your HR or Supervisor's email so the system can send them a brief feedback form regarding your performance.</p>
                        </div>
                        <button className="outline-btn" onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>Close Guide</button>
                    </div>
                </div>
            )}

            {activeModal === 'correction' && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '450px' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: 'var(--gold)' }}>Data Correction Request</h2>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Is there an error in your name, batch year, or contact info? Send a direct correction request to your Program Chair.</p>
                        <textarea className="correction-textbox" placeholder="Halimbawa: Ang batch year ko po dapat ay 2026, hindi 2025..." style={{ height: '100px', padding: '15px', resize: 'none', marginBottom: '20px' }}></textarea>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="outline-btn cancel-btn" onClick={() => setActiveModal(null)} style={{ padding: '10px', borderRadius: '8px', flex: 1 }}>Cancel</button>
                            <button className="primary-btn" onClick={() => { alert('Request Sent to Program Chair!'); setActiveModal(null); }} style={{ padding: '10px', borderRadius: '8px', flex: 1, border: 'none' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'jobUpdate' && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '450px' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: 'var(--gold)' }}>Update Employment Status</h2>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Please update your current employment details to keep the alumni records accurate.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <select 
                                className="correction-textbox" 
                                style={{ height: '45px', padding: '0 15px', color: 'var(--text-main)', backgroundColor: 'var(--bg-main)' }}
                                value={employmentStatus}
                                onChange={(e) => setEmploymentStatus(e.target.value)}
                            >
                                <option value="" disabled>Select Employment Status...</option>
                                <option value="employed">Employed</option>
                                <option value="self-employed">Self-Employed / Business Owner</option>
                                <option value="unemployed">Unemployed</option>
                            </select>

                            {employmentStatus === 'employed' && (
                                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Current Job Title (e.g., Software Engineer)" 
                                        className="correction-textbox" 
                                        style={{ height: '45px', padding: '0 15px', backgroundColor: 'var(--bg-main)' }} 
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Company Name" 
                                        className="correction-textbox" 
                                        style={{ height: '45px', padding: '0 15px', backgroundColor: 'var(--bg-main)' }} 
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="outline-btn cancel-btn" onClick={() => { setActiveModal(null); setEmploymentStatus(''); }} style={{ padding: '10px', borderRadius: '8px', flex: 1, fontWeight: 'bold' }}>Cancel</button>
                            <button className="primary-btn" onClick={handleSaveJobUpdate} style={{ padding: '10px', borderRadius: '8px', flex: 1, border: 'none', fontWeight: 'bold' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
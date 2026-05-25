import { useState } from "react";


export default function ProgramOverview({
    activeMenu, setActiveMenu,
    setSelectedSurveyView,
    setSurveySubTab
}) {

    const [overviewCount, setOverviewCount] = useState({
        totalActive: 0,
        tracerRate: 0,
        pendingAssessments: 0,
    });

    return(
        <>
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="pc-header" style={{ marginBottom: '30px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Program Overview</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Welcome back, Program Chair! Here is the status of the B.S. Computer Engineering program.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                                    A.Y. 2025-2026
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div className="portal-card" style={{ borderTop: '4px solid #3b82f6', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Total Registered Alumni</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.totalActive}</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #10b981', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Tracer Study Completion</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.tracerRate}%</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #f59e0b', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Pending Direct Assessments</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.pendingAssessments}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div className="portal-card">
                                <h2 style={{ 
                                        fontSize: '1.2rem', 
                                        color: 'var(--gold)', 
                                        marginBottom: '20px', 
                                        borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                        paddingBottom: '10px' }}>
                                    Action Center / To-Do
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {overviewCount?.pendingAssessments > 0 ? (
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ color: '#f59e0b', margin: '0 0 5px 0' }}>Encode Direct Assessments</h4>
                                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have {overviewCount?.pendingAssessments} students waiting for their Det 1-3 grades.</p>
                                            </div>
                                            <button className="outline-btn" onClick={() => setActiveMenu('masterlist')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Go to Masterlist</button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
                                            <h4 style={{ color: '#10b981', margin: '0 0 5px 0' }}>All Caught Up!</h4>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>All direct assessments have been graded.</p>
                                        </div>
                                    )}
                                    <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#3b82f6', margin: '0 0 5px 0' }}>Data Correction Requests</h4>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have 0 pending correction requests from Alumni.</p>
                                        </div>
                                        <button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }}>Review</button>
                                    </div>
                                </div>
                            </div>
                            <div className="portal-card">
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Quick Links</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button className="outline-btn" onClick={() => {setActiveMenu('indirect'); setSelectedSurveyView('gts'); setSurveySubTab('builder');}} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px' }}>
                                        📝 Edit Tracer Survey
                                    </button>
                                    <button className="outline-btn" onClick={() => setActiveMenu('analytics')} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px' }}>
                                        📊 View Reports & Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
        </>
    )
}
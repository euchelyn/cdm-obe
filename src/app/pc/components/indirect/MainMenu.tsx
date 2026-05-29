export default function MainMenu({
    setSelectedSurveyView,
    setSurveySubTab,
    tracerRate,
    poRate
}) {

    return(
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease' }}>
                <div>
                    <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', marginBottom: '15px', paddingLeft: '5px', borderLeft: '4px solid var(--gold)' }}>Indirect Assessment Surveys</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

                        {/* SO Survey */}                   
                        <div 
                            className="portal-card hover-card" 
                            onClick={() => {
                                setSelectedSurveyView('1stYear'); 
                                setSurveySubTab('respondents');
                            }} 
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>SO Survey (Yearly Update)</h3>
                                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Active 🟢</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Assesses early career alignment and basic SO attainment. Click to view respondents.</p>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                                    <span>Completion Rate</span>
                                    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{poRate}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                    <div style={{ width: `${poRate}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 3-5 Year Graduate Survey */}
                        <div 
                            className="portal-card hover-card" 
                            onClick={() => {
                                setSelectedSurveyView('3to5Year'); 
                                setSurveySubTab('respondents');
                            }} 
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', opacity: 0.8, transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>3-5 Year Graduate Survey</h3>
                                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Draft 🟡</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Assesses career progression and advanced PEO attainment. Click to view list.</p>
                            </div>
                            <div>
                                <button 
                                    className="outline-btn" 
                                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '6px' }} 
                                    onClick={(e) => { e.stopPropagation(); setSelectedSurveyView('3to5Year'); setSurveySubTab('builder'); }}
                                >
                                    Configure Form
                                </button>
                            </div>
                        </div>

                        {/* Graduate Tracer Study */}
                        <div 
                            className="portal-card hover-card" 
                            onClick={() => {
                                setSelectedSurveyView('gts');
                                setSurveySubTab('respondents');
                            }} 
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Graduate Tracer Study</h3>
                                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Deployed 🟢</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Institutional tracer questionnaire. Click to view respondent tracker.</p>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                                    <span>Overall Completion</span>
                                    <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{tracerRate}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                    <div style={{ width: `${tracerRate}%`, height: '100%', backgroundColor: 'var(--gold)', borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
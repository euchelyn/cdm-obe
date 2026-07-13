import { useEffect } from "react"


export default function SurveyDetailCard({
    surveyPayload, setSurveyPayload,
    saveFormToDatabase,
    setCurrentVersion
}) {

    useEffect(() => {
        console.log(surveyPayload);
    }, [surveyPayload])

    return(
        <>
            <div className="portal-card" style={{ borderTop: '8px solid var(--gold)', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h2 style={{ color: 'var(--gold)', marginBottom: '20px', fontSize: '1.4rem' }}>Form Settings</h2>
                                        
                <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Survey Version Year:</label>
                <select 
                    className="correction-textbox" 
                    style={{ width: 'max-content', minWidth: '150px', marginBottom: '25px', fontWeight: 'bold' }}
                    value={surveyPayload.version}
                    onChange={(e) => {
                            const newVersion = e.target.value;
                            setSurveyPayload(prev => ({
                                ...prev,
                                version: newVersion
                            }));
                            setCurrentVersion(newVersion);
                        }}
                >
                    <option value="2024">2024 Version</option>
                    <option value="2025">2025 Version</option>
                    <option value="2026">2026 Version</option>
                    <option value="2027">2027 Version</option>
                    <option value="2028">2028 Version</option>
                </select>

                <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Form Title:</label>
                <input 
                    type="text" 
                    value={surveyPayload.title} 
                    onChange={(e) => setSurveyPayload(prev => ({
                        ...prev,
                        title: e.target.value
                    }))} 
                    placeholder="Enter title here..." 
                    style={{ width: '100%', fontSize: '1.4rem', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-main)', marginBottom: '20px', paddingBottom: '10px', outline: 'none', transition: 'border-color 0.3s' }} 
                    onFocus={(e) => e.target.style.borderBottom = '1px solid var(--gold)'} 
                    onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.1)'} 
                />
                                        
                <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Form Description:</label>
                <textarea 
                    value={surveyPayload.description} 
                    onChange={(e) => setSurveyPayload(prev => ({
                        ...prev,
                        description: e.target.value
                    }))} 
                    placeholder="Provide instructions for the alumni..." 
                    style={{ width: '100%', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', resize: 'none', outline: 'none', minHeight: '100px', padding: '15px', lineHeight: '1.5', marginBottom: '25px' }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--gold)'} 
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} 
                />

                <button className="primary-btn" onClick={saveFormToDatabase} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    💾 Publish Updates
                </button>
            </div>
        </>
    )
}
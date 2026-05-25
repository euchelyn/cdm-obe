

export default function BackToSurvey({
    selectedSurveyView, setSelectedSurveyView
}) {

    return (
        <>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setSelectedSurveyView(null)} 
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', padding: '6px 0', fontSize: '0.9rem', marginBottom: '10px', cursor: 'pointer', fontWeight: '500', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.textDecoration = 'none'; }}
                >
                    ← Back to Surveys
                </button>

                <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem', margin: 0 }}>
                    {selectedSurveyView === '1stYear' && 'SO Survey (Yearly Update)'}
                    {selectedSurveyView === '3to5Year' && '3-5 Year Graduate Survey'}
                    {selectedSurveyView === 'gts' && 'Graduate Tracer Study'}
                </h2>
            </div>
        </>
    )
}
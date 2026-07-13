

export default function SurveyTopMenu({
    surveySubTab, setSurveySubTab
}) {

    return(
        <>
            <div className="tab-container" style={{ marginBottom: '20px' }}>
                <button className={`tab-btn ${surveySubTab === 'respondents' ? 'active' : ''}`} onClick={() => setSurveySubTab('respondents')}>
                      👥 Respondents Tracker
                </button>

                <button className={`tab-btn ${surveySubTab === 'builder' ? 'active' : ''}`} onClick={() => setSurveySubTab('builder')}>
                    📝 Survey Questions
                </button>
            </div>
        </>
    )
}
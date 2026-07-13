

export default function Respondents({
    surveyDetailBatch, setSurveyDetailBatch,
    surveyDetailStudents,
    selectedSurveyView,
    openSurveyModal
}) {

return(
    <>
        <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', margin: 0 }}>Respondents Data</h3>
                    <select 
                        className="correction-textbox" 
                        style={{ width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }}
                        value={surveyDetailBatch} 
                        onChange={(e) => setSurveyDetailBatch(e.target.value)}
                    >
                        <option value="All">All Batches</option>
                        <option value="2024">Batch 2024</option>
                        <option value="2025">Batch 2025</option>
                        <option value="2026">Batch 2026</option>
                        <option value="2027">Batch 2027</option>
                        <option value="2028">Batch 2028</option>
                    </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Batch</th>
                            <th>Survey Status</th>
                        </tr>
                    </thead>
                <tbody>

                {/* COMMENTED OUT FOR NOW */}
                {/* 
                {surveyDetailStudents.map((student, idx) => {
                    let s_status = 'Pending';
                    if (selectedSurveyView === '1stYear') s_status = student.surveyProgress === '100%' ? 'Completed' : 'Pending';
                    else if (selectedSurveyView === 'gts') s_status = student.tracerProgress === '100%' ? 'Completed' : 'Pending';
                    else if (selectedSurveyView === '3to5Year') s_status = student.peoProgress === '100%' ? 'Completed' : 'Pending'; 

                    return (
                        <tr key={idx} 
                            onClick={() => openSurveyModal(student, selectedSurveyView)}
                            style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Click to view/edit responses"
                        >
                            <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                            <td style={{ fontWeight: '600' }}>{student.name}</td>
                            <td>{student.batch}</td>
                            
                            <td>
                                <span className={`status-badge ${s_status === 'Completed' ? 'badge-passed' : 'badge-pending'}`}>
                                    {s_status}
                                </span>
                            </td>
                        </tr>
                    );
                })} 
                */}

                <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                        No records found.
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
    </>
)
}
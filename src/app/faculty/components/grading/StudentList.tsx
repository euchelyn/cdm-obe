

export default function StudentList({
    rubrics,
    currentGrade,
    studentGrades, setStudentGrades,
    gradeKey,
    pos
}) {
    console.log("RUBRICS",rubrics)
    return(
        <>
                <div className="grading-content">
                    <h3>Rubrics Assessment</h3>

                    <div className="rubrics-grading">
                        {rubrics.map((r, idx) => {
                            const selectedLevel =
                            currentGrade?.scores?.[`r${idx}`];
                                    
                            const levelValues = {
                                Excellent: 100,
                                Good: 85,
                                Fair: 70,
                                Poor: 50,
                            };

                            const currentScore = levelValues[selectedLevel] || 0;

                            return (
                                <div key={idx} className="rubric-card">
                                    <div className="rubric-card-header">
                                        <h4>{r.criteria || r.name}</h4>

                                        {selectedLevel && (
                                            <div className="level-score-badge">
                                                <span className="score-value">
                                                    {currentScore}
                                               </span>
                                                <span className="score-label">pts</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="level-buttons">
                                        {['Excellent', 'Good', 'Fair', 'Poor'].map(level => (
                                            <button
                                                key={level}
                                                className={`level-button ${selectedLevel === level ? 'selected' : ''
                                                    }`}
                                                onClick={() => {
                                                    const updatedGrades = { ...studentGrades };

                                                    if (!updatedGrades[gradeKey]) {
                                                    updatedGrades[gradeKey] = { scores: {} };
                                                    }

                                                    updatedGrades[gradeKey].scores[`r${idx}`] =
                                                    level;

                                                    setStudentGrades(updatedGrades);
                                                }}
                                                >

                                                <div className="level-name">{level}</div>
                                                
                                                <div className="level-score">
                                                    {levelValues[level]}
                                                </div>

                                            </button>
                                        ))}
                                    </div>

                                    <div className="rubric-pos-mapping">
                                        <span className="pos-label">Weighted to:</span>

                                        {pos.map(po => {
                                            const weight = r.poWeights?.[po] || 0;

                                            return (
                                                <div key={po} className="po-mapping-badge">
                                                    <span className="po-tag-small">
                                                    PO-{po}
                                                    </span>
                                                    <span className="po-weight-small">
                                                    {weight}%
                                                    </span>
                                                </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
        </>
    )
}
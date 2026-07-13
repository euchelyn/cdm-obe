export default function FinalExamAssessment({
    questions,
    currentGrade,
    studentGrades,
    gradeKey,
    setStudentGrades,
    questionScores,
    setQuestionScores
}) {

    return(
        <>
            <div className="grading-content">
                <h3>Final Exam - Mark Questions</h3>
                <p className="grading-subtitle">
                    Check off questions the student answered correctly
                </p>

                <div className="questions-checklist">
                    {questions.map((q, idx) => {
                        // ✅ Use questionScores if available, otherwise fallback to studentGrades
                        const isCorrect = questionScores?.[`q${idx}`] === true 
                            || currentGrade?.scores?.[`q${idx}`] === true;

                        return (
                            <div key={idx} className="question-checklist-item">
                                <div className="question-check-content">
                                    <button
                                        className={`question-checkbox ${isCorrect ? 'checked' : ''}`}
                                        onClick={() => {
                                            // ✅ Update questionScores state
                                            const updatedScores = { ...questionScores };
                                            updatedScores[`q${idx}`] = !isCorrect;
                                            setQuestionScores(updatedScores);

                                            // Update studentGrades for local display
                                            const updatedGrades = { ...studentGrades };

                                            if (!updatedGrades[gradeKey]) {
                                                updatedGrades[gradeKey] = { scores: {} };
                                            }

                                            updatedGrades[gradeKey].scores[`q${idx}`] = !isCorrect;

                                            setStudentGrades(updatedGrades);
                                        }}
                                    >
                                        {isCorrect ? '✓' : ''}
                                    </button>

                                    <div className="question-text">
                                        <span className="q-num">Q{idx + 1}</span>
                                        <span className="q-content">{q.question}</span>
                                    </div>
                                </div>

                                <div className="question-status">
                                    {isCorrect ? (
                                        <span className="status-correct">✓ Correct</span>
                                    ) : (
                                        <span className="status-incorrect">✗ Incorrect</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}
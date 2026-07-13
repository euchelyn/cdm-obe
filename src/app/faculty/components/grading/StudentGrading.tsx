import FinalExamAssessment from "./FinalExamAssessment";
import GradeStatusCard from "./GradeStatusCard";
import RubricAssessment from "./RubricAssessment";


export default function StudentGrading({
    selectedStudentForGrading, setSelectedStudentForGrading,
    selectedCourseForGrading,
    masterlist,
    courseAssessments,
    studentGrades, setStudentGrades,
    setGradingView,
    assessments,
    getPoScores,
    handleSaveGrades,
    questionScores, setQuestionScores,
    rubricScores, setRubricScores
}) {

    return(
        <>
            <div className="grading-form-container">
                {selectedStudentForGrading && selectedCourseForGrading && (
                    <div className="grading-form">
                        {(() => {
                        const student = masterlist.find(s => s.id === selectedStudentForGrading);
                        const assessment = courseAssessments[selectedCourseForGrading];
                        const gradeKey = `${selectedCourseForGrading}_${selectedStudentForGrading}`;
                        const currentGrade = studentGrades[gradeKey];
                        
                        // Get the assessment to know question/rubric count
                        const activeAssessment = assessments?.find(a =>
                            a.faculty_course_id?.toString() === selectedCourseForGrading?.toString()
                        );
                        const questions = activeAssessment?.questions || [];
                        const rubrics = activeAssessment?.rubrics || [];
                        const totalQuestions = questions.length;
                        const totalRubrics = rubrics.length;
                        
                        // ✅ Calculate grade percent (handles both question and rubric)
                        let currentGradePercent = null;
                        
                        console.log('StudentGrading - questionScores:', questionScores);
                        console.log('StudentGrading - rubricScores:', rubricScores);
                        console.log('StudentGrading - totalQuestions:', totalQuestions);
                        console.log('StudentGrading - totalRubrics:', totalRubrics);

                        // For Final Exam (question-based)
                        if (questionScores && Object.keys(questionScores).length > 0 && totalQuestions > 0) {
                            const correctCount = Object.values(questionScores).filter(v => v === true).length;
                            currentGradePercent = Math.round((correctCount / totalQuestions) * 100);
                        } 
                        // For Rubric Assessment
                        else if (rubricScores && Object.keys(rubricScores).length > 0 && totalRubrics > 0) {
                            const levelValues = { Excellent: 100, Good: 85, Fair: 70, Poor: 50 };
                            const scoreValues = Object.values(rubricScores)
                                .map(l => levelValues[l] || 0)
                                .filter(v => v > 0);
                            currentGradePercent = scoreValues.length > 0
                                ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                                : null;
                        }
                        // Fallback to old logic
                        else if (currentGrade?.overall_grade) {
                            const g = currentGrade.overall_grade;
                            if (g === 1.0) currentGradePercent = 100;
                            else if (g === 2.5) currentGradePercent = 75;
                            else if (g === 3.5) currentGradePercent = 50;
                            else currentGradePercent = 25;
                        }
                        
                        return (
                            <>
                            <div className="grading-header">
                                <button
                                onClick={() => {
                                    setGradingView('list');
                                    setSelectedStudentForGrading('');
                                }}
                                className="back-link"
                                >
                                ← Back to Student List
                                </button>

                                <div className="student-grading-header">
                                    <div>
                                        <h2>{student?.name}</h2>
                                        <p>{student?.id} • {student?.batch}</p>
                                    </div>

                                    <GradeStatusCard 
                                        currentGradePercent={currentGradePercent}
                                        studentId={student?.id}
                                    />
                                </div>
                            </div>

                            {(() => {
                                const assessment =
                                assessments?.find(a =>
                                    a.faculty_course_id?.toString() ===
                                    selectedCourseForGrading?.toString()
                                ) || null;

                                if (!assessment) {
                                return (
                                    <div className="empty-state">
                                    <p>No assessment found for this course.</p>
                                    </div>
                                );
                                }

                                const isFinalExam =
                                assessment.gradingMethod === 'finalExam' ||
                                assessment.type === 'final_exam';

                                const questions = assessment.questions || [];
                                const rubrics = assessment.rubrics || [];
                                const pos = assessment.pos || [];

                                return isFinalExam ? (
                                    <FinalExamAssessment 
                                        questions={questions}
                                        currentGrade={currentGrade}
                                        studentGrades={studentGrades}
                                        gradeKey={gradeKey}
                                        setStudentGrades={setStudentGrades}
                                        questionScores={questionScores}
                                        setQuestionScores={setQuestionScores}
                                    />
                                ) : (
                                    <RubricAssessment 
                                        rubrics={rubrics}
                                        currentGrade={currentGrade}
                                        studentGrades={studentGrades}
                                        setStudentGrades={setStudentGrades}
                                        gradeKey={gradeKey}
                                        pos={pos}
                                        rubricScores={rubricScores}
                                        setRubricScores={setRubricScores}
                                    />
                                );
                            })()}

                            {(() => {
                                const assessment =
                                assessments?.find(a =>
                                    a.faculty_course_id?.toString() ===
                                    selectedCourseForGrading?.toString()
                                ) || null;

                                if (!assessment) {
                                return (
                                    <div className="grading-po-breakdown">
                                    <h3>Program Outcome Scores</h3>
                                    <p>No assessment available.</p>
                                    </div>
                                );
                                }

                                const pos = assessment.pos || [];

                                return (
                                <div className="grading-po-breakdown">
                                    <h3>Program Outcome Scores</h3>

                                    <div className="po-scores">
                                    {pos.map(po => {
                                        const poScore =
                                        getPoScores(
                                            selectedStudentForGrading,
                                            selectedCourseForGrading,
                                            assessment
                                        )?.[po] || 0;

                                        const safeScore = Math.round(poScore);

                                        return (
                                        <div key={po} className="po-score-card">
                                            <div className="po-score-header">
                                            <span className="po-badge">PO-{po}</span>
                                            </div>

                                            <div className="po-score-bar">
                                            <div
                                                className="po-score-fill"
                                                style={{ width: `${safeScore}%` }}
                                            />
                                            </div>

                                            <div className="po-score-value">
                                            {safeScore}
                                            </div>
                                        </div>
                                        );
                                    })}
                                    </div>
                                </div>
                                );
                            })()}

                            <div className="grading-actions">
                                <button
                                onClick={handleSaveGrades}
                                className="save-grade-btn"
                                >
                                ✓ Save Grades
                                </button>
                            </div>
                            </>
                        );
                        })()}
                    </div>
                    )}
                </div>
        </>
    )
}
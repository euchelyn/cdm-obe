

export default function StepOne({
    assessmentStep, setAssessmentStep,
    facultyCourses,
    selectedCourseForAssessment, setSelectedCourseForAssessment,
    courseAssessments, 
    setSelectedPOs,
    setGradingMethod,
}){

    return (
        <>
            {assessmentStep === 1 && (
                <div className="assessment-form">
                    <h2>Select a Course</h2>

                    <div className="form-group">
                        <label>Choose Course</label>
                        <select
                            value={selectedCourseForAssessment}
                            onChange={(e) => {
                                const courseId = e.target.value;
                                setSelectedCourseForAssessment(courseId);
                                if (courseId && courseAssessments[courseId]) {
                                const assessment = courseAssessments[courseId];
                                setSelectedPOs(assessment.pos || []);
                                setGradingMethod(assessment.gradingMethod || '');
                                } else {
                                setSelectedPOs([]);
                                setGradingMethod('');
                                }
                            }}
                            className="form-input"
                        >

                            <option value="">Choose a course...</option>
                            {facultyCourses.map(fc => (
                                <option key={fc._id} value={fc._id}>
                                {fc.course?.code} {fc.course?.course} — {fc.school_year} {fc.semester} Sem
                                </option>
                            ))}
                        </select>
                    </div>

                    {facultyCourses.length === 0 && (
                        <div className="empty-state">
                            <p>No courses available. Create courses first from the Manage Courses tab.</p>
                        </div>
                    )}

                    {selectedCourseForAssessment && (
                        <div className="form-buttons">
                            <button
                                onClick={() => setAssessmentStep(2)}
                                className="primary-btn"
                            >
                                Next: Program Outcomes →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
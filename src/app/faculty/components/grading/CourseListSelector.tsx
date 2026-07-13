

export default function CourseListSelector({
    selectedCourseForGrading, setSelectedCourseForGrading,
    setSelectedBlockForGrading,
    setSelectedStudentForGrading,
    facultyCourses,
    assessments
}) {

    return(
        <>
            <div className="selector-group">
                <label>Select Course</label>

                <select
                    value={selectedCourseForGrading}
                    onChange={(e) => {
                        setSelectedCourseForGrading(String(e.target.value));
                        setSelectedBlockForGrading('');
                        setSelectedStudentForGrading('');
                    }}
                    className="form-input"
                >
                    <option value="">Choose a course...</option>
                        {facultyCourses
                        ?.filter(fc =>
                            assessments.some(a =>
                            a.faculty_course_id?.toString() === fc._id?.toString()
                            )
                        )
                        .map(fc => {
                            const course = fc.course || {};
                            return (
                            <option key={fc._id} value={fc._id}>
                                {course.code} - {course.course}
                            </option>
                            );
                        })}
                </select>

                {facultyCourses?.filter(fc =>
                    assessments.some(a =>
                    a.faculty_course_id?.toString() === fc._id?.toString()
                    )
                ).length === 0 && (
                    <p className="help-text">
                       No courses with assessments available. Create assessments first.
                    </p>
                    )}
            </div>
        </>
    )
}
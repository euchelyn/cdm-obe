export default function CourseOverview({
    courses,
    courseAssessments,
    studentGrades,
    courseGradedCount,
    isLoading = false
}) {
    
    // Loading skeleton
    if (isLoading) {
        return (
            <>
                <div className="dashboard-section">
                    <h2>Course Overview</h2>
                    <div className="course-overview-list">
                        {[1, 2].map((i) => (
                            <div key={i} className="course-overview-item skeleton-item">
                                <div className="skeleton-header">
                                    <div className="skeleton-text" style={{ width: '40%', height: '20px' }}></div>
                                    <div className="skeleton-badge" style={{ width: '80px', height: '20px' }}></div>
                                </div>
                                <div className="skeleton-progress">
                                    <div className="skeleton-bar" style={{ height: '8px', width: '100%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }
    
    return (
        <>
            <div className="dashboard-section">
                <h2>Course Overview</h2>
                    {courses.length > 0 ? (
                        <div className="course-overview-list">
                            {courses.map(course => {
                                const assessment = courseAssessments[course.id];
                                const courseId = course.course._id;
                                const totalStudents = course.blocks.reduce((sum, b) => sum + b.students.length, 0);
                                const gradedCount = courseGradedCount?.[courseId] || 0;
        
                              return (
                                <div key={course._id} className="course-overview-item">
                                  <div className="overview-header">
                                    {/* course.course.course is the actual course name */}
                                    <h4>{course.course?.course}</h4>
                                    <div className="overview-badges">
                                      {assessment && <span className="badge assessment-badge">Assessment ✓</span>}
                                      {gradedCount > 0 && <span className="badge graded-badge">{gradedCount}/{totalStudents} Graded</span>}
                                    </div>
                                  </div>
                                  <div className="overview-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${totalStudents > 0 ? (gradedCount / totalStudents) * 100 : 0}%` }}></div>
                                    </div>
                                    <span className="progress-text">{gradedCount}/{totalStudents} students graded</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                    ) : (
                          <div className="empty-state compact">
                            <p>No courses yet. Create one to get started!</p>
                          </div>
                    )}
            </div>
        </>
    )
}
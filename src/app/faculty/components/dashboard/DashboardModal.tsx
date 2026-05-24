
export default function DashboardModal({
    dashboardDetail,
    courses,
    setDashboardDetail,
    courseAssessments,
    gradedCount,
    gradedList,
    masterlist
}) {

    return(
        <>
            {dashboardDetail && (
                <div className="modal-overlay" onClick={() => setDashboardDetail(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                          
                        <div className="modal-header">
                            <h2>
                                {dashboardDetail === 'courses' && 'Courses'}
                                {dashboardDetail === 'assessments' && 'Assessments'}
                                {dashboardDetail === 'graded' && 'Graded'}
                                {dashboardDetail === 'students' && 'Students'}
                            </h2>
                            <button className="close-btn" onClick={() => setDashboardDetail(null)}>✕</button>
                        </div>

                        <div className="modal-content">
                            {dashboardDetail === 'courses' && (
                                <div className="dashboard-details-list">
                                    {courses.length === 0 ? (
                                        <div className="dashboard-details-card">No courses available.</div>
                                    ) : courses.map(c => (
                                        <div key={c.id} className="dashboard-details-card">
                                            <span className="dashboard-details-icon">📚</span>
                                    
                                            <div className="dashboard-details-main">
                                                <span className="dashboard-details-title">{c.courseName}</span>
                                                <span className="dashboard-details-sub">{c.blocks.length} block{c.blocks.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                              </div>
                            )}


                            {dashboardDetail === 'assessments' && (
                                <div className="dashboard-details-list">
                                    {Object.keys(courseAssessments).length === 0 ? (
                                        <div className="dashboard-details-card">No assessments setup.</div>
                                    ) : Object.entries(courseAssessments).map(([cid, assess]) => {
                                    const course = courses.find(c => c.id === cid);
                                
                                    return (
                                        <div key={cid} className="dashboard-details-card">
                                            <span className="dashboard-details-icon">📊</span>
                                            
                                            <div className="dashboard-details-main">
                                                <span className="dashboard-details-title">{course ? course.courseName : cid}</span>
                                                <span className="dashboard-details-sub">{assess.questions?.length || 0} question{(assess.questions?.length || 0) !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            )}


                            {dashboardDetail === 'graded' && (
                                <div>
                                    <div className="dashboard-details-title" style={{ fontSize: '1.15em', marginBottom: 10 }}>
                                        {gradedCount === 0 ? 'No Graded Students' : `${gradedCount} Graded Student${gradedCount !== 1 ? 's' : ''}`}
                                    </div>
                                    
                                    <div className="dashboard-details-list">
                                        {gradedCount === 0 ? (
                                            <div className="dashboard-details-card">No students graded yet.</div>
                                        ) : gradedList.map(([key, val]) => {
                                            const [courseId, studentId] = key.split('_');
                                            const course = courses.find(c => c.id === courseId);
                                            const student = masterlist.find(s => s.id === studentId);
                                   
                                            return (
                                                <div key={key} className="dashboard-details-card">
                                                    <span className="dashboard-details-icon">⭐</span>
                                        
                                                    <div className="dashboard-details-main">
                                                        <span className="dashboard-details-title">{student ? student.name : studentId}</span>
                                                        <span className="dashboard-details-sub">in {course ? course.courseName : courseId}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                
                            {dashboardDetail === 'students' && (
                                <div className="dashboard-details-list">
                                    {courses.reduce((sum, c) => sum + c.blocks.reduce((bs, b) => bs + b.students.length, 0), 0) === 0 ? (
                                        <div className="dashboard-details-card">No students enrolled.</div>
                                    ) : courses.flatMap(c => c.blocks.map(b => b.students.map(sid => {
                                    const student = masterlist.find(s => s.id === sid);
                                  
                                    return (
                                        <div key={c.id + '-' + b.name + '-' + sid} className="dashboard-details-card">
                                            <span className="dashboard-details-icon">👥</span>
                        
                                            <div className="dashboard-details-main">
                                                <span className="dashboard-details-title">{student ? student.name : sid}</span>
                                                <span className="dashboard-details-sub">{student ? student.id : ''} in {c.courseName} - {b.name}</span>
                                            </div>
                                        </div>
                                    );
                                    }))).flat()}
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

import { useEffect, useState } from "react";

//=======================================
// SERVICES
//=======================================
import { countFacultyCourses } from "@/services/facultyService";
import { getAllAssessments, getAssessmentCountByFaculty } from "@/services/assessmentService";

//=======================================
// COMPONENTS
//=======================================
import DashboardButton from "./DashboardButton";
import DashboardModal from "./DashboardModal";
import QuickActionButton from "./QuickActionButton";
import { error } from "node:console";

export default function Dashboard({
    activeTab,
    setDashboardDetail,
    courses,
    dashboardDetail,
    courseAssessments,
    gradedCount,
    gradedList,
    masterlist,
    setOpenModal,
    setActiveTab,
    studentGrades,
    faculty_id
}) {
  
  const [dashboardCount, setDashboardCount] = useState({
    course_count: 0,
    assessment_count: 0,
    graded_count: 0,
    student_count: 0,
  });



  useEffect(() => {

    if (faculty_id) {
      loadFacultyCourseCount();
      loadAssessmentCount();
    }
  }, [faculty_id]);

  async function loadFacultyCourseCount() {
    try {
      const res = await countFacultyCourses({
        faculty_id: faculty_id
      });

      setDashboardCount(prev => ({
        ...prev,
        course_count: res.count ?? 0,
      }));

    } catch (err) {
      console.error(err);
    }
  }

  async function loadAssessmentCount() {
    try {
      const res = await getAssessmentCountByFaculty(faculty_id);

      setDashboardCount(prev => ({
        ...prev,
        assessment_count: res,
      }))
    } catch (err) {
      console.error(err);
    }
  }
  
  return (
        <>
            {activeTab === 'dashboard' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="pc-header" style={{ marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Faculty Dashboard</h1>
                            <p style={{ color: 'var(--text-sub)' }}>Welcome back! Your assessment & grading hub.</p>
                        </div>
                    </div>

                    <div className="dashboard-stats-grid">
                        <DashboardButton 
                            setDashboardDetail={setDashboardDetail}
                            icon="📚"
                            label="Courses"
                            detail="courses"
                            dashboardCount={dashboardCount}
                        />

                        <DashboardButton 
                            setDashboardDetail={setDashboardDetail}
                            icon="📊"
                            label="Assessments"
                            detail="assessments"
                            dashboardCount={dashboardCount}
                        />

                        <DashboardButton 
                            setDashboardDetail={setDashboardDetail}
                            icon="⭐"
                            label="Graded"
                            detail="graded"
                            dashboardCount={dashboardCount}
                        />

                        <DashboardButton 
                            setDashboardDetail={setDashboardDetail}
                            icon="👥"
                            label="Students"
                            detail="students"
                            dashboardCount={dashboardCount}
                        />
                        
                    </div>
        
                    {/* Dashboard Details Modal */}
                    <DashboardModal 
                        dashboardDetail={dashboardDetail}
                        courses={courses}
                        setDashboardDetail={setDashboardDetail}
                        courseAssessments={courseAssessments}
                        gradedCount={gradedCount}
                        gradedList={gradedList}
                        masterlist={masterlist}
                    />

                    <div className="dashboard-grid">
                      <div className="dashboard-section">
                        <h2>Quick Actions</h2>

                        <div className="quick-action-buttons">
                          
                            <QuickActionButton 
                                setOpenModal={setOpenModal}
                                setActiveTab={setActiveTab}
                                modal="addcourse"
                                icon="📚"
                                label="Add Course"
                                sublabel="Create new course"
                            />

                            <QuickActionButton 
                                setOpenModal={setOpenModal}
                                setActiveTab={setActiveTab}
                                modal="assessment"
                                icon="📋"
                                label="Grade Students"
                                sublabel="Configure POs & grading"
                            />

                            <QuickActionButton 
                                setOpenModal={setOpenModal}
                                setActiveTab={setActiveTab}
                                modal="grading"
                                icon="⭐"
                                label="Grade Students"
                                sublabel="Evaluate performance"
                            />
                        </div>
                      </div>
        
                      <div className="dashboard-section">
                        <h2>Course Overview</h2>
                        {courses.length > 0 ? (
                          <div className="course-overview-list">
                            {courses.map(course => {
                              const assessment = courseAssessments[course.id];
                              const totalStudents = course.blocks.reduce((sum, b) => sum + b.students.length, 0);
                              const gradedCount = course.blocks.reduce((sum, b) => {
                                return sum + b.students.filter(sid => {
                                  const gradeKey = `${course.id}_${sid}`;
                                  return studentGrades[gradeKey]?.scores;
                                }).length;
                              }, 0);
        
                              return (
                                <div key={course._id} className="course-overview-item">
                                  <div className="overview-header">
                                    <h4>{course.courseName}</h4>
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
                    </div>
                  </div>
                )}
        </>
    )
}
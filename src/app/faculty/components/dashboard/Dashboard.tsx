import { useEffect, useState } from "react";

//=======================================
// SERVICES
//=======================================
import { countFacultyCourses } from "@/services/facultyService";
import { getAllAssessments, getAssessmentCountByFaculty } from "@/services/assessmentService";
import { getStudentAssessmentsByStudentId } from "@/services/assessmentService";

//=======================================
// COMPONENTS
//=======================================
import DashboardButton from "./DashboardButton";
import DashboardModal from "./DashboardModal";
import QuickActionButton from "./QuickActionButton";
import { error } from "node:console";
import CourseOverview from "./CourseOverview";

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
    course_graded_count: {} as Record<string, number>
  });

  const [isLoadingGraded, setIsLoadingGraded] = useState(false);  // Loading state for graded students



  useEffect(() => {

    if (faculty_id) {
      loadFacultyCourseCount();
      loadAssessmentCount();
    }
  }, [faculty_id]);

  useEffect(() => {
    if (courses.length > 0) {
      loadTotalStudents();
    }
  }, [courses]);

  useEffect(() => {
    const handleGradesUpdated = () => {
      loadTotalStudents();
    };

    window.addEventListener('grades-updated', handleGradesUpdated);
    
    return () => {
      window.removeEventListener('grades-updated', handleGradesUpdated);
    };
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      loadTotalStudents();
    }
  }, [courses]);

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
  

// Fix the loadTotalStudents function
const loadTotalStudents = async () => {
  setIsLoadingGraded(true);  // Set loading to true
  
  const courseGradedCount: Record<string, number> = {};
  
  let totalStudents = 0;
  let totalGraded = 0;

  for (const fc of courses) {
    const courseId = fc.course._id;
    courseGradedCount[courseId] = 0;
    
    for (const block of fc.blocks || []) {
      for (const studentId of block.students || []) {
        totalStudents++;
        
        try {
          const assessments = await getStudentAssessmentsByStudentId(studentId);
          
          if (assessments && assessments.length > 0) {
            totalGraded++;
            courseGradedCount[courseId] = (courseGradedCount[courseId] || 0) + 1;
          }
        } catch (err) {
          console.error(`Error fetching assessments for student ${studentId}:`, err);
        }
      }
    }
  }

  setDashboardCount(prev => ({
    ...prev,
    student_count: totalStudents,
    graded_count: totalGraded,
    course_graded_count: courseGradedCount,
  }));

  setIsLoadingGraded(false);  // Set loading to false when done
};

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
        
                      <CourseOverview 
                        courses={courses}
                        courseAssessments={courseAssessments}
                        studentGrades={studentGrades}
                        courseGradedCount={dashboardCount.course_graded_count}
                        isLoading={isLoadingGraded}  // Pass loading state
                      />
                      
                    </div>
                  </div>
                )}
        </>
    )
}
//=====================================
// COMPONENTS
//=====================================
import { useEffect, useState } from 'react';
import CourseListSelector from "./CourseListSelector";
import BlockListSelector from "./BlockListSelector";
import GradeCard from "./GradeCard";
import StudentList from "./StudentList";
import StudentGrading from "./StudentGrading";
import { getGrades } from "@/services/assessmentService";

export default function GradingList({
    gradingView, setGradingView,
    selectedCourseForGrading, setSelectedCourseForGrading,
    selectedBlockForGrading, setSelectedBlockForGrading,
    setSelectedStudentForGrading,
    questionScores, setQuestionScores,
    rubricScores, setRubricScores,
    facultyCourses,
    masterlist,
    studentGrades, setStudentGrades,
    assessments,
    handleSaveGrades,
    courseAssessment,
    getPoScores
}) {
    
    const [gradeData, setGradeData] = useState<any[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const fetchGradesData = async () => {
        if (!selectedCourseForGrading || !selectedBlockForGrading) {
            setGradeData([]);
            return;
        }

        setLoadingGrades(true);
        try {
            const blockStudents = facultyCourses
                ?.find(fc => fc._id?.toString() === selectedCourseForGrading)
                ?.blocks
                ?.find(b => b.name === selectedBlockForGrading)
                ?.students || [];

            console.log('=== fetchGradesData ===');
            console.log('blockStudents:', blockStudents);

            const allGradeData = await Promise.all(
                blockStudents.map(async (studentId) => {
                    try {
                        const data = await getGrades(studentId);
                        console.log('getGrades result for', studentId, ':', data);
                        return { studentId, data };
                    } catch (error) {
                        console.error(`Error fetching grades for ${studentId}:`, error);
                        return { studentId, data: [] };
                    }
                })
            );

            setGradeData(allGradeData);
            console.log('GRADE DATA GRADINGLIST', allGradeData);
        } catch (error) {
            console.error("Error fetching all grades:", error);
        } finally {
            setLoadingGrades(false);
        }
    };

    // ✅ Fetch on initial load
    useEffect(() => {
        if (selectedCourseForGrading && selectedBlockForGrading) {
            fetchGradesData();
        }
    }, [selectedCourseForGrading, selectedBlockForGrading]);

    // ✅ Refresh when returning to list view
    useEffect(() => {
        if (gradingView === 'list' && selectedCourseForGrading && selectedBlockForGrading) {
            console.log('🔄 Refreshing grades - returned to list view');
            fetchGradesData();
        }
    }, [gradingView]);

    const getGradePercentForStudent = (studentId) => {
        const studentGradeData = gradeData.find(g => g.studentId === studentId);
        
        if (!studentGradeData?.data || studentGradeData.data.length === 0) {
            return null;
        }

        const firstAssessment = studentGradeData.data[0];
        if (firstAssessment?.grade_percent !== undefined) {
            return firstAssessment.grade_percent;
        }

        return null;
    };

    const getQuestionScoresForStudent = (studentId) => {
        const studentGradeData = gradeData.find(g => g.studentId === studentId);
        
        console.log('=== getQuestionScoresForStudent ===');
        console.log('studentId:', studentId);
        console.log('studentGradeData:', studentGradeData);
        
        if (!studentGradeData?.data || studentGradeData.data.length === 0) {
            return {};
        }

        const firstAssessment = studentGradeData.data[0];
        const questionResults = firstAssessment?.question_results || [];
        
        console.log('questionResults:', questionResults);
        
        const scores = {};
        questionResults.forEach((qr, idx) => {
            scores[`q${idx}`] = qr.is_correct === true;
        });
        
        console.log('final question scores:', scores);
        return scores;
    };

    const getRubricScoresForStudent = (studentId) => {
        const studentGradeData = gradeData.find(g => g.studentId === studentId);
        
        console.log('=== getRubricScoresForStudent ===');
        console.log('studentId:', studentId);
        console.log('studentGradeData:', studentGradeData);
        console.log('full data:', JSON.stringify(studentGradeData, null, 2));
        
        if (!studentGradeData?.data || studentGradeData.data.length === 0) {
            console.log('No data found, returning empty');
            return {};
        }

        const firstAssessment = studentGradeData.data[0];
        console.log('firstAssessment:', firstAssessment);
        
        const rubricResults = firstAssessment?.rubric_results || [];
        console.log('rubricResults:', rubricResults);
        
        const scores = {};
        rubricResults.forEach((rr, idx) => {
            scores[`r${idx}`] = rr.level;
        });
        
        console.log('final rubric scores:', scores);
        return scores;
    };

    return (
        <>
            {gradingView === 'list' ? (
                <div className="grading-selector">

                    <CourseListSelector 
                        selectedCourseForGrading={selectedCourseForGrading}
                        setSelectedCourseForGrading={setSelectedCourseForGrading}
                        setSelectedBlockForGrading={setSelectedBlockForGrading}
                        setSelectedStudentForGrading={setSelectedStudentForGrading}
                        facultyCourses={facultyCourses}
                        assessments={assessments}
                    />

                    <BlockListSelector 
                        selectedCourseForGrading={selectedCourseForGrading}
                        selectedBlockForGrading={selectedBlockForGrading}
                        setSelectedBlockForGrading={setSelectedBlockForGrading}
                        setSelectedStudentForGrading={setSelectedStudentForGrading}
                        facultyCourses={facultyCourses}
                    />

                    {selectedCourseForGrading && selectedBlockForGrading && gradeData.length > 0 && (
                        <div className="block-grading-summary">
                            <h3>Grades for {selectedBlockForGrading}</h3>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Total Students:</span>
                                    <span className="stat-value">{gradeData.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Graded:</span>
                                    <span className="stat-value">
                                        {gradeData.filter(g => g.data?.length > 0).length}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Not Graded:</span>
                                    <span className="stat-value">
                                        {gradeData.filter(g => !g.data || g.data.length === 0).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedCourseForGrading && selectedBlockForGrading && (
                        <div className="students-grading-list">
                            <h3>Students in {selectedBlockForGrading}</h3>

                            <div className="student-list-grading">
                                {facultyCourses
                                    ?.find(fc => fc._id?.toString() === selectedCourseForGrading)
                                    ?.blocks
                                    ?.find(b => b.name === selectedBlockForGrading)
                                    ?.students
                                    ?.map(studentId => {

                                        const student = masterlist.find(
                                            s => s._id === studentId || s.id === studentId
                                        );

                                        if (!student) return null;

                                        const assessment = assessments.find(
                                            a => a.faculty_course_id?.toString() === selectedCourseForGrading
                                        );

                                        const gradeKey = `${selectedCourseForGrading}_${studentId}`;
                                        const savedGrade = studentGrades[gradeKey];

                                        let gradeNumber = null;
                                        let gradeColor = '#94a3b8';

                                        const apiGradePercent = getGradePercentForStudent(studentId);
                                        
                                        if (apiGradePercent !== null) {
                                            gradeNumber = apiGradePercent;
                                        } else if (savedGrade?.scores && Object.keys(savedGrade.scores).length > 0) {
                                            const isFinalExam = assessment?.type === 'final_exam';

                                            if (isFinalExam) {
                                                const totalQuestions = assessment?.questions?.length || 0;
                                                const scoreValues = Object.values(savedGrade.scores);
                                                const correctCount = scoreValues.filter(v => v === true).length;

                                                gradeNumber = totalQuestions > 0
                                                    ? Math.round((correctCount / totalQuestions) * 100)
                                                    : null;
                                            } else {
                                                const levelValues = {
                                                    Excellent: 100,
                                                    Good: 85,
                                                    Fair: 70,
                                                    Poor: 50
                                                };

                                                const scoreValues = Object.values(savedGrade.scores)
                                                    .map(l => levelValues[l] || 0)
                                                    .filter(v => v > 0);

                                                gradeNumber = scoreValues.length > 0
                                                    ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                                                    : null;
                                            }
                                        }

                                        if (gradeNumber !== null) {
                                            gradeColor =
                                                gradeNumber >= 75
                                                    ? '#10b981'
                                                    : gradeNumber >= 60
                                                    ? '#f59e0b'
                                                    : '#ef4444';
                                        }

                                        return (
                                            <div
                                                key={studentId}
                                                className="student-grading-item"
                                                onClick={() => {
                                                    console.log('=== CLICKED STUDENT ===');
                                                    console.log('studentId:', studentId);

                                                    setSelectedStudentForGrading(studentId);

                                                    const gradeKey = `${selectedCourseForGrading}_${studentId}`;

                                                    // ✅ Load question scores from API
                                                    const apiQuestionScores = getQuestionScoresForStudent(studentId);
                                                    console.log('apiQuestionScores:', apiQuestionScores);
                                                    
                                                    if (Object.keys(apiQuestionScores).length > 0) {
                                                        setQuestionScores(apiQuestionScores);
                                                    } else if (studentGrades[gradeKey]?.scores) {
                                                        setQuestionScores(studentGrades[gradeKey].scores || {});
                                                    } else {
                                                        setQuestionScores({});
                                                    }

                                                    // ✅ Load rubric scores from API
                                                    const apiRubricScores = getRubricScoresForStudent(studentId);
                                                    console.log('apiRubricScores:', apiRubricScores);
                                                    
                                                    if (Object.keys(apiRubricScores).length > 0) {
                                                        setRubricScores(apiRubricScores);
                                                    } else if (studentGrades[gradeKey]?.scores) {
                                                        setRubricScores(studentGrades[gradeKey].scores || {});
                                                    } else {
                                                        setRubricScores({});
                                                    }

                                                    setGradingView('grade');
                                                }}
                                            >
                                                <div className="student-grading-info">
                                                    <h4>{student?.name}</h4>
                                                    <p>{student?.student_number || student?.id}</p>
                                                </div>

                                                <GradeCard
                                                    gradeColor={gradeColor}
                                                    gradeNumber={gradeNumber}
                                                />
                                            </div>
                                        );
                                    })
                                    .filter(Boolean)}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <StudentGrading 
                    selectedStudentForGrading={setSelectedStudentForGrading}
                    setSelectedStudentForGrading={setSelectedStudentForGrading}
                    selectedCourseForGrading={selectedCourseForGrading}
                    masterlist={masterlist}
                    courseAssessments={courseAssessment}
                    studentGrades={studentGrades}
                    setStudentGrades={setStudentGrades}
                    setGradingView={setGradingView}
                    assessments={assessments}
                    getPoScores={getPoScores}
                    handleSaveGrades={handleSaveGrades}
                    questionScores={questionScores}
                    setQuestionScores={setQuestionScores}
                    rubricScores={rubricScores}
                    setRubricScores={setRubricScores}
                />
            )}
        </>
    );

}
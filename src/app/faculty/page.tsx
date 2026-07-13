"use client"

import React, { useState, useEffect, act } from 'react';
import { useRouter } from 'next/navigation';
import '../alumni/alumni-globals.css';
import './faculty.css';
import { getAllCourses } from '@/services/coursesService';
import { getClientUser } from '@/lib/clientSession';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  createFacultyCourse,
  getAllFacultyCourses,
  deleteFacultyCourse,
  createBlock,
  getAllBlocks,
  updateBlock,
  deleteBlock,
  createBlockStudent,
  deleteBlockStudent
} from '@/services/facultyService';
import { getStudentById } from '@/services/masterlistService';
import { searchStudentsByName } from '@/services/masterlistService';
import { getAllBlockStudents } from '@/services/facultyService';
import { getAllStudents } from '@/services/masterlistService';
import {
  createAssessment,
  createQuestion,
  createRubric,
  getAllAssessments,
  getAllStudentAssessments,
  createStudentAssessment,
  getAllGrades,
  createGrade,
  getQuestionResults,
  getRubricResults,
  createQuestionResult,
  createRubricResult,
  updateQuestionResult,
  updateRubricResult,
  updateGrade
} from '@/services/assessmentService';

//====================================================
// COMPONENTS
//====================================================
import FacultySidebar from './components/FacultySidebar';
import Dashboard from './components/dashboard/Dashboard';
import ManageCourses from './components/course/ManageCourses';
import Assessments from './components/assessment/Assessment';
import ViewAssessment from './components/assessment/ViewAssessment';
import Grading from './components/grading/Grading';

export default function FacultyPage() {

  const currentUser = useCurrentUser();


  const router = useRouter();

  /*
  const handleAddCourse = () => {
    if (!courseInput.trim()) {
      showToast('Please select a course');
      return;
    }
    if (courses.some(c => c.courseName === courseInput)) {
      showToast('Course already exists');
      return;
    }
    const newCourse = {
      id: Date.now().toString(),
      courseName: courseInput,
      blocks: []
    };
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));
    setOpenModal(null);
    setCourseInput('');
    setCourseSearchTerm('');
    setShowCourseDropdown(false);
    showToast('Course added successfully!');
  };
  */



  const [dashboardDetail, setDashboardDetail] = useState(null); // null or 'courses' | 'assessments' | 'graded' | 'students'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [masterlist, setMasterlist] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Add Course
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseSY, setCourseSY] = useState("");

  // Modal states
  const [openModal, setOpenModal] = useState(null);
  const [courseInput, setCourseInput] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState('');
  const [selectedBlockForStudents, setSelectedBlockForStudents] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sortBy, setSortBy] = useState('batch-desc');
  const [selectedStudents, setSelectedStudents] = useState({});
  const [renameBlockModal, setRenameBlockModal] = useState({ open: false, courseId: '', oldName: '', newName: '' });


  // Manage Course
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [blockInput, setBlockInput] = useState('');
  const [selectedCourseForBlock, setSelectedCourseForBlock] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [searchResults, setSearchResults] = useState([])
  const [allStudents, setAllStudents] = useState([]);
  const [blockStudents, setBlockStudents] = useState([]);

  // Assessment Setup states
  const [courseAssessments, setCourseAssessments] = useState({});
  const [selectedCourseForAssessment, setSelectedCourseForAssessment] = useState('');
  const [selectedPOs, setSelectedPOs] = useState([]);
  const [gradingMethod, setGradingMethod] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionPOs, setQuestionPOs] = useState({});
  const [rubrics, setRubrics] = useState([]);
  const [rubricName, setRubricName] = useState('');
  const [rubricCriteria, setRubricCriteria] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [poWeights, setPoWeights] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [assessmentStep, setAssessmentStep] = useState(1);

  // Grading states
  const [studentGrades, setStudentGrades] = useState({});
  const [selectedCourseForGrading, setSelectedCourseForGrading] = useState('');
  const [selectedBlockForGrading, setSelectedBlockForGrading] = useState('');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState('');
  const [questionScores, setQuestionScores] = useState({});
  const [rubricScores, setRubricScores] = useState({});
  const [gradingView, setGradingView] = useState('list'); // 'list' or 'grade'

  const [CPE_CURRICULUM, setCPE_CURRICULUM] = useState([]);
  const [ALL_COURSES, setALL_COURSES] = useState([]);

  const gradedList = Object.entries(studentGrades).filter(([key, val]) => val.scores);
  const gradedCount = gradedList.length;


const fetchFacultyData = async () => {
  try {
    const [fcData, blockData, bsData, assessmentData] = await Promise.all([
      getAllFacultyCourses({
        faculty_id: currentUser?.link?.roleAccount?._id?.toString(),
      }),
      getAllBlocks(),
      getAllBlockStudents(),
      getAllAssessments({
        created_by: currentUser?.link?.roleAccount?._id?.toString(),
      }),
    ]);

    const fcWithBlocks = fcData.map(fc => {
      const blocks = blockData.filter(
        b => b.faculty_course_id?.toString() === fc._id?.toString()
      );

      const blocksWithStudents = blocks.map(block => {
        const enrolledStudents = bsData
          .filter(bs => bs.block?._id?.toString() === block._id?.toString())
          .map(bs => bs.student?._id?.toString() || bs.student?._id);

        return { ...block, students: enrolledStudents };
      });

      return { ...fc, blocks: blocksWithStudents };
    });

    const facultyCourseMap = new Map(fcData.map(fc => [String(fc._id), fc]));

    const assessmentsWithCourse = assessmentData.map(a => {
      const fc = facultyCourseMap.get(String(a.faculty_course_id));
      return { ...a, faculty_course: fc || null, course: fc?.course || null };
    });

    setFacultyCourses(fcWithBlocks);
    setAssessments(assessmentsWithCourse);
    setBlockStudents(bsData);

  } catch (e) {
    console.error(e);
    showToast(e.message || 'Failed to fetch faculty data');
  }
};

  useEffect(() => {
    const user = getClientUser();

    // ─────────────────────────────────────────────────────────────
    // FETCH STUDENTS
    // ─────────────────────────────────────────────────────────────

    getAllStudents()
      .then((data) => {
        setMasterlist(data);
      })
      .catch((err) => {
        console.error('getAllStudents error:', err);
      });

    // ─────────────────────────────────────────────────────────────
    // FETCH COURSES
    // ─────────────────────────────────────────────────────────────

    getAllCourses()
      .then((data) => {
        const grouped = data.reduce(
          (acc, course) => {
            const existing = acc.find(
              g => g.year === course.year_level
            );

            if (existing) {
              existing.courses.push(course);
            } else {
              acc.push({
                year: course.year_level,
                courses: [course],
              });
            }

            return acc;
          },
          []
        );

        setCPE_CURRICULUM(grouped);
        setALL_COURSES(grouped.flatMap((year) => year.courses));
      })
      .catch((err) => {
        console.error('getAllCourses error:', err);
      });

    // ─────────────────────────────────────────────────────────────
    // FETCH FACULTY DATA + ASSESSMENTS + GRADES
    // ─────────────────────────────────────────────────────────────

    if (currentUser?.link?.roleAccount?._id) {
      fetchFacultyData();
    }

  }, [currentUser?.link?.roleAccount?._id]);



  const handleAddCourse = async () => {
    try {

      if (!selectedCourse || !courseSY || !semester) {
        alert('Please fill in all fields: ' + `${selectedCourse, courseSY, semester}`);
        return;
      }
      await createFacultyCourse({
        faculty_id: currentUser?.link?.roleAccount?._id,
        course_id: selectedCourse._id,
        school_year: courseSY,
        semester: semester,
      });

      showToast('Course added successfully');

      // Reset fields
      setCourseSearchTerm('');
      setCourseSY('');
      setSemester('');
      setSelectedCourse(null);
      setShowCourseDropdown(false);

      fetchFacultyData();

    } catch (e) {
      showToast(e.message);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddBlock = async () => {
    try {
      if (!selectedCourseForBlock || !blockInput) {
        showToast('Please fill in all fields');
        return;
      }

      const selectedFC = facultyCourses.find(fc => fc._id === selectedCourseForBlock);

      await createBlock({
        faculty_course_id: selectedCourseForBlock,
        name: blockInput,
        school_year: selectedFC?.school_year,
        semester: selectedFC?.semester,
      });

      showToast('Block added successfully');

      setBlockInput('');
      setSelectedCourseForBlock('');
      setOpenModal(null);

      fetchFacultyData();
    } catch (e) {
      showToast(e.message);
    }
  };

  const handleAddStudents = async () => {
    try {
      if (!selectedCourseForStudents || !selectedBlockForStudents) {
        showToast('Please select a course and block');
        return;
      }

      const studentIds = Object.keys(selectedStudents)
        .filter(key => selectedStudents[key]?.selected === true)
        .map(key => selectedStudents[key]._id);

      if (studentIds.length === 0) {
        showToast('Please select at least one student');
        return;
      }

      // Add students to block
      await Promise.all(
        studentIds.map(studentId =>
          createBlockStudent({
            block_id: selectedBlockForStudents,
            student_id: studentId
          })
        )
      );

      showToast(`${studentIds.length} student(s) added to block`);

      // Reset UI
      setSelectedStudents({});
      setSelectedCourseForStudents('');
      setSelectedBlockForStudents('');
      setSearchTerm('');
      setSelectedBatch('');
      setSortBy('batch-desc');
      setOpenModal(null);

      // Refresh everything
      await fetchFacultyData();

      // Also refresh masterlist for display
      const allStudents = await getAllStudents();
      setMasterlist(allStudents);

    } catch (e) {
      console.error('Error adding students:', e);
      showToast(e.message);
    }
  };




  const handleRenameBlock = async () => {
    try {
      if (!renameBlockModal.newName) {
        showToast('Please enter a block name');
        return;
      }

      // Find faculty course first
      const facultyCourse = facultyCourses.find(
        fc => fc._id?.toString() === renameBlockModal.courseId?.toString()
      );

      if (!facultyCourse) {
        showToast('Faculty course not found');
        return;
      }

      // Find block inside faculty course
      const block = facultyCourse.blocks?.find(
        b => b.name === renameBlockModal.oldName
      );



      if (!block) {
        showToast('Block not found');
        return;
      }

      await updateBlock(block._id, {
        faculty_course_id: block.faculty_course_id,
        name: renameBlockModal.newName,
        school_year: block.school_year,
        semester: block.semester,
      });

      showToast('Block renamed successfully');

      setRenameBlockModal({
        open: false,
        courseId: null,
        oldName: '',
        newName: '',
      });

      // Refresh blocks
      const blockData = await getAllBlocks();

      const fcWithBlocks = facultyCourses.map(fc => ({
        ...fc,
        blocks: blockData.filter(
          b => b.faculty_course_id?.toString() === fc._id?.toString()
        ),
      }));

      setFacultyCourses(fcWithBlocks);

    } catch (e) {
      showToast(e.message);
    }
  };

  const handleStudentSearch = async (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await searchStudentsByName(value);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };



  const filteredStudents = masterlist.filter(student =>
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.includes(searchTerm)) &&
    (selectedBatch === '' || student.batch === selectedBatch)
  );

  const getSortedBatches = () => {
    const batches = [...new Set(masterlist.map(s => s.batch))];
    return sortBy === 'batch-asc' ? batches.sort() : batches.sort().reverse();
  };

  const uniqueBatches = getSortedBatches();

  const getSortedStudents = (students) => {
    const sorted = [...students];
    if (sortBy === 'name-asc') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'id-asc') {
      return sorted.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'id-desc') {
      return sorted.sort((a, b) => b.id.localeCompare(a.id));
    }
    return sorted;
  };

  const studentsByBatch = selectedBatch
    ? { [selectedBatch]: getSortedStudents(filteredStudents) }
    : filteredStudents.reduce((acc, student) => {
      if (!acc[student.batch]) acc[student.batch] = [];
      acc[student.batch].push(student);
      return acc;
    }, {});

  // Sort students within each batch
  Object.keys(studentsByBatch).forEach(batch => {
    studentsByBatch[batch] = getSortedStudents(studentsByBatch[batch]);
  });

  const selectedCourseObj = facultyCourses.find(c => c.id === selectedCourseForStudents);
  const selectedBlockObj = selectedCourseObj?.blocks.find(b => b.name === selectedBlockForStudents);

  // Calculate PO weights for validation


 


  // Grading helper functions
  const calculateStudentGrade = (studentId, courseId, assessment) => {
    const gradeKey = `${courseId}_${studentId}`;
    const grade = studentGrades?.[gradeKey];
    if (!assessment || !grade || !grade.scores) return null;

    const isFinalExam =
      assessment.gradingMethod === 'finalExam' ||
      assessment.type === 'final_exam';

    if (isFinalExam) {
      const questions = assessment.questions || [];

      const correctCount = Object.keys(grade.scores).filter(
        key => key.startsWith('q') && grade.scores[key] === true
      ).length;

      return questions.length > 0
        ? (correctCount / questions.length) * 100
        : 0;
    }

    const rubrics = assessment.rubrics || [];

    let totalScore = 0;

    rubrics.forEach((r, idx) => {
      const level = grade.scores[`r${idx}`];
      if (level) totalScore += levelValues[level] || 0;
    });

    return rubrics.length > 0
      ? Math.round(totalScore / rubrics.length)
      : null;
  };





  const handleSaveGrades = async () => {
    
  };

console.log("Faculty: ", facultyCourses);

  return (
    <div className="portal-layout">
      <FacultySidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setAssessmentStep={setAssessmentStep}
        setSelectedCourseForAssessment={setSelectedCourseForAssessment}
        setSelectedPOs={setSelectedPOs}
        setGradingMethod={setGradingMethod}
        setGradingView={setGradingView}
        setSelectedCourseForGrading={setSelectedCourseForGrading}
        setSelectedBlockForGrading={setSelectedBlockForGrading}
        setSelectedStudentForGrading={setSelectedStudentForGrading}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        router={router}
      />

      <main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
        {/* Dashboard */}
        <Dashboard 
          activeTab={activeTab}
          setDashboardDetail={setDashboardDetail}
          courses={facultyCourses}
          dashboardDetail={dashboardDetail}
          courseAssessments={courseAssessments}
          gradedCount={gradedCount}
          gradedList={gradedList}
          masterlist={masterlist}
          setOpenModal={setOpenModal}
          setActiveTab={setActiveTab}
          studentGrades={studentGrades}
          faculty_id={currentUser?.link?.roleAccount?._id}
        />

        {/* Manage Courses */}
        <ManageCourses 
          activeTab={activeTab}
          setOpenModal={setOpenModal}
          fetchFacultyData={fetchFacultyData}
          setBlockStudents={setBlockStudents}
          facultyCourses={facultyCourses}
          setFacultyCourses={setFacultyCourses}
          showToast={showToast}
          masterlist={masterlist}
          renameBlockModal={renameBlockModal}
          setRenameBlockModal={setRenameBlockModal}
        />

        {/* Assessments */}
        <Assessments 
          currentUser={currentUser}
          assessmentStep={assessmentStep}
          setAssessmentStep={setAssessmentStep}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          facultyCourses={facultyCourses}
          fetchFacultyData={fetchFacultyData}
          questions={questions}
          setQuestions={setQuestions}
          questionPOs={questionPOs}
          setQuestionPOs={setQuestionPOs}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          rubrics={rubrics}
          setRubrics={setRubrics}
          rubricName={rubricName}
          setRubricName={setRubricName}
          selectedCourseForAssessment={selectedCourseForAssessment}
          setSelectedCourseForAssessment={setSelectedCourseForAssessment}
          courseAssessments={courseAssessments}
          selectPOs={selectedPOs}
          setSelectPOs={setSelectedPOs}
          gradingMethod={gradingMethod}
          setGradingMethod={setGradingMethod}
          showToast={showToast}
        />

        <ViewAssessment 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          assessments={assessments}
          setAssessments={setAssessments}
          ALL_COURSES={ALL_COURSES}
          setSelectedCourseForAssessment={setSelectedCourseForAssessment}
          setSelectedPOs={setSelectedPOs}
          setGradingMethod={setGradingMethod}
          setQuestions={setQuestions}
          setQuestionPOs={setQuestionPOs}
          setRubrics={setRubrics}
          setAssessmentStep={setAssessmentStep}
          showToast={showToast}
        />
        
        <Grading 
          activeTab={activeTab}
          selectedStudentForGrading={selectedStudentForGrading}
          selectedBlockForGrading={selectedBlockForGrading}
          setSelectedBlockForGrading={setSelectedBlockForGrading}
          selectedCourseForGrading={selectedCourseForGrading}
          setSelectedCourseForGrading={setSelectedCourseForGrading}
          masterlist={masterlist}
          courseAssessments={courseAssessments}
          studentGrades={studentGrades}
          setGradingView={setGradingView}
          setSelectedStudentForGrading={setSelectedStudentForGrading}
          assessments={assessments}
          setStudentGrades={setStudentGrades}
          handleSaveGrades={handleSaveGrades}
          setQuestionScore={setQuestionScores}
          facultyCourses={facultyCourses}
          setRubricScores={setRubricScores}
          rubrics={rubrics}
          showToast={showToast}
        />


        {/* Add Course Modal */}
        {openModal === 'addcourse' && (
          <div className="modal-overlay" onClick={() => {
            setOpenModal(null);
            setShowCourseDropdown(false);
          }}>
            <div className="modal-box portal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Add Course</h2>
                <button className="close-btn" onClick={() => {
                  setOpenModal(null);
                  setShowCourseDropdown(false);
                }}>✕</button>
              </div>

              <div className="form-group">
                <label>Search & Select Course</label>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  onFocus={() => setShowCourseDropdown(true)}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="e.g. 2024-2025"
                  value={courseSY}
                  onChange={(e) => setCourseSY(e.target.value)}
                  className="form-input"
                />
                <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              {showCourseDropdown && !selectedCourse ? (
                <div className="courses-dropdown">
                  {(() => {
                    const filteredCourses = ALL_COURSES.filter(course =>
                      course.course.toLowerCase().includes(courseSearchTerm.toLowerCase()) &&
                      !facultyCourses.some(c => c.courseName === course.course)
                    );
                    return filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <button
                          key={course._id}
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedCourse(course);
                            setCourseInput(course.course);
                            setCourseSearchTerm(course.course);
                            setShowCourseDropdown(false);
                          }}
                        >
                          {`${course.code} ${course.course}`}
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-empty">No courses available</div>
                    );
                  })()}
                </div>
              ) : null}

              {courseInput && (
                <div className="selected-course">
                  <div className="selected-label">Selected Course</div>
                  <div className="selected-course-item">
                    <span>{courseInput}</span>
                    <button
                      onClick={() => {
                        setCourseInput('');
                        setCourseSearchTerm('');
                        setShowCourseDropdown(true);
                      }}
                      className="clear-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="modal-buttons">
                <button onClick={() => {
                  setOpenModal(null);
                  setCourseInput('');
                  setCourseSearchTerm('');
                  setShowCourseDropdown(false);
                }} className="outline-btn">Cancel</button>
                <button onClick={handleAddCourse} className="primary-btn">Add Course</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Block Modal */}
        {openModal === 'addblock' && (
          <div className="modal-overlay" onClick={() => setOpenModal(null)}>
            <div className="modal-box portal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📦 Add Block</h2>
                <button className="close-btn" onClick={() => setOpenModal(null)}>✕</button>
              </div>
              <div className="form-group">
                <label>Select Course</label>
                <select
                  value={selectedCourseForBlock}
                  onChange={(e) => setSelectedCourseForBlock(e.target.value)}
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
              <div className="form-group">
                <label>Block Name</label>
                <input
                  type="text"
                  placeholder="e.g., CpE 2A"
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="modal-buttons">
                <button onClick={() => setOpenModal(null)} className="outline-btn">Cancel</button>
                <button onClick={handleAddBlock} className="primary-btn">Add Block</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Students Modal */}
        {openModal === 'addstudents' && (
          <div className="modal-overlay" onClick={() => {
            setOpenModal(null);
            setSearchTerm('');
            setSelectedBatch('');
            setSortBy('batch-desc');
            setSelectedStudents({});
          }}>
            <div className="modal-box portal-card modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>👥 Add Students</h2>
                <button className="close-btn" onClick={() => {
                  setOpenModal(null);
                  setSearchTerm('');
                  setSelectedBatch('');
                  setSortBy('batch-desc');
                  setSelectedStudents({});
                }}>✕</button>
              </div>

              <div className="form-group">
                <label>Select Course</label>
                <select
                  value={selectedCourseForStudents}
                  onChange={(e) => {
                    setSelectedCourseForStudents(e.target.value);
                    setSelectedBlockForStudents('');
                    setSelectedStudents({});
                  }}
                  className="form-input"
                >
                  <option value="">Choose a course...</option>

                  {facultyCourses
                    .filter(fc => fc.blocks?.length > 0)
                    .map(fc => (
                      <option key={fc._id} value={fc._id}>
                        {fc.course?.code} {fc.course?.course} —{' '}
                        {fc.school_year} {fc.semester} Sem
                      </option>
                    ))}
                </select>
              </div>

              {selectedCourseForStudents && (
                <div className="form-group">
                  <label>Select Block</label>

                  <select
                    value={selectedBlockForStudents}
                    onChange={(e) => {
                      setSelectedBlockForStudents(e.target.value);
                      setSelectedStudents({});
                    }}
                    className="form-input"
                  >
                    <option value="">Choose a block...</option>

                    {facultyCourses
                      .find(
                        fc =>
                          fc._id?.toString() ===
                          selectedCourseForStudents?.toString()
                      )
                      ?.blocks?.map((block) => (
                        <option
                          key={block._id}
                          value={block._id}
                        >
                          {block.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {selectedBlockObj && selectedBlockObj.students.length > 0 && (
                <div className="current-block">
                  <h3>Current Students</h3>
                  <div className="students-chips">
                    {selectedBlockObj.students.map(sid => {
                      const student = masterlist.find(s => s.id === sid);
                      return student ? (
                        <div key={sid} className="student-chip">
                          <span>{student.name}</span>
                          <button
                            onClick={() => handleRemoveStudent(selectedCourseForStudents, selectedBlockForStudents, sid)}
                            className="chip-remove"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Search & Select Students</label>

                {/* Search Container */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="form-input"
                  />

                  {/* Search Dropdown */}
                  {searchTerm && searchResults.length > 0 && (
                    <ul className="search-dropdown-list">
                      {searchResults.slice(0, 5).map((student) => {
                        // Use 'id' (the student number) as the key since masterlist might be empty
                        const studentKey = student.id || student._id;

                        return (
                          <li
                            key={studentKey}
                            onClick={() => {
                              // Store BOTH the ID and the student data
                              setSelectedStudents(prev => ({
                                ...prev,
                                [studentKey]: {
                                  selected: true,
                                  name: student.name,
                                  id: student.id,
                                  _id: student._id
                                }
                              }));
                              setSearchTerm('');
                              setSearchResults([]);
                            }}
                            className="search-dropdown-item"
                          >
                            <div className="student-info">
                              <span className="name">{student.name}</span>
                              <span className="id"> - {student.id}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Selected Students Chips */}
                <div className="selected-students-chips">
                  <label>Selected Students</label>
                  {Object.keys(selectedStudents).filter(id => selectedStudents[id]?.selected).length > 0 ? (
                    Object.keys(selectedStudents)
                      .filter(id => selectedStudents[id]?.selected)
                      .map(studentKey => {
                        const studentData = selectedStudents[studentKey];

                        return (
                          <div key={studentKey} className="student-chip-selection">
                            <span>{studentData?.name}</span>
                            <button
                              onClick={() => {
                                const updated = { ...selectedStudents };
                                delete updated[studentKey];
                                setSelectedStudents(updated);
                              }}
                              className="chip-remove"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                  ) : (
                    <p className="no-students-chip">No students selected yet</p>
                  )}
                </div>

                {uniqueBatches.length > 0 && (
                  <div className="filter-dropdowns">
                    <div className="form-group">
                      <label>Filter by Batch</label>
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="form-input"
                      >
                        <option value="">All Batches</option>
                        {uniqueBatches.map(batch => (
                          <option key={batch} value={batch}>Batch {batch}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="form-input"
                      >
                        <option value="batch-desc">Batch (Newest First)</option>
                        <option value="batch-asc">Batch (Oldest First)</option>
                        <option value="name-asc">Name (A to Z)</option>
                        <option value="name-desc">Name (Z to A)</option>
                        <option value="id-asc">ID (Low to High)</option>
                        <option value="id-desc">ID (High to Low)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="students-by-batch">
                  {Object.keys(studentsByBatch).length > 0 ? (
                    Object.keys(studentsByBatch).sort().reverse().map(batch => (
                      <div key={batch} className="batch-group">
                        <div className="batch-header">
                          <h4>Batch {batch}</h4>
                          <span className="batch-count">{studentsByBatch[batch].length} students</span>
                        </div>
                        <div className="students-grid">
                          {studentsByBatch[batch].map(student => {
                            const studentKey = student.id || student._id;
                            const isSelected = selectedStudents[studentKey]?.selected === true;
                            return (
                              <button
                                key={studentKey}
                                className={`student-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedStudents(prev => ({
                                    ...prev,
                                    [studentKey]: {
                                      selected: !prev[studentKey]?.selected,
                                      name: student.name,
                                      id: student.id,
                                      _id: student._id
                                    }
                                  }));
                                }}
                              >
                                <div className="card-content">
                                  <div className="student-name">{student.name}</div>
                                  <div className="student-id">{student.id}</div>
                                </div>
                                <div className="card-check">{isSelected ? '✓' : ''}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-students">No students found</p>
                  )}
                </div>
              </div>

              <div className="modal-buttons">
                <button onClick={() => {
                  setOpenModal(null);
                  setSearchTerm('');
                  setSelectedBatch('');
                  setSortBy('batch-desc');
                  setSelectedStudents({});
                  setSearchResults([]);
                }} className="outline-btn">Cancel</button>
                <button onClick={handleAddStudents} className="primary-btn">Add Students</button>
              </div>
            </div>
          </div>
        )}

        {renameBlockModal.open && (
          <div className="modal-overlay" onClick={() => setRenameBlockModal({ open: false, courseId: null, oldName: '', newName: '' })}>
            <div className="modal-box portal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Rename Block</h2>
                <button className="close-btn" onClick={() => setRenameBlockModal({ open: false, courseId: null, oldName: '', newName: '' })}>✕</button>
              </div>

              <div className="form-group">
                <label>Current Name</label>
                <input
                  type="text"
                  value={renameBlockModal.oldName}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>New Block Name</label>
                <input
                  type="text"
                  value={renameBlockModal.newName}
                  onChange={(e) => setRenameBlockModal({ ...renameBlockModal, newName: e.target.value })}
                  className="form-input"
                  placeholder="e.g. CpE 2A"
                />
              </div>

              <div className="modal-buttons">
                <button
                  onClick={() => setRenameBlockModal({ open: false, courseId: null, oldName: '', newName: '' })}
                  className="outline-btn"
                >
                  Cancel
                </button>
                <button onClick={handleRenameBlock} className="primary-btn">
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px',
            borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px',
            zIndex: 1000, fontWeight: 'bold', animation: 'fadeIn 0.3s ease'
          }}>
            {toastMessage}
          </div>
        )}
      </main>
    </div>
  );
}
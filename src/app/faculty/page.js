"use client"

import React, { useState, useEffect } from 'react';
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

function BlockSection({
  block,
  course,
  masterlist,
  handleRemoveBlock,
  handleRemoveStudent,
  setRenameBlockModal,
  renameBlockModal,
  setCourses,
  courses,
  showToast,
  searchResults = []
}) {
  const [collapsed, setCollapsed] = useState(true);

  // Get students array from block (should be array of student IDs)
  const students = block.students || [];

  const findStudent = (sid) => {
    let student = masterlist.find(stu =>
      stu._id === sid ||
      stu._id?.toString() === sid ||
      stu.id === sid ||
      stu.id?.toString() === sid
    );

    if (!student && searchResults?.length > 0) {
      student = searchResults.find(stu =>
        stu._id === sid ||
        stu._id?.toString() === sid ||
        stu.id === sid
      );
    }

    return student;
  };

  return (
    <div className="organized-block-section">
      <div
        className="block-label-row"
        style={{ cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="block-label">{block.name}</div>

        <div className="block-student-count">
          {students.length} student{students.length !== 1 ? 's' : ''}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="block-collapse-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(c => !c);
            }}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffe066',
              fontSize: '12px'
            }}
          >
            {collapsed ? '▶' : '▼'}
          </button>

          <button
            className="block-edit-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();

              setRenameBlockModal({
                open: true,
                courseId: course._id || course.id,
                oldName: block.name,
                newName: block.name
              });
            }}
            title="Rename Block"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✏️
          </button>

          <button
            className="block-delete-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();

              if (window.confirm(`Delete block "${block.name}"?`)) {
                handleRemoveBlock(
                  course._id || course.id,
                  block._id || block.name
                );
              }
            }}
            title="Remove Block"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          className="organized-students-list-vertical"
          style={{
            background: '#23272b',
            borderRadius: 10,
            marginTop: 8,
            padding: 0
          }}
        >
          {students.length > 0 ? (
            <div className="student-vertical-list">
              <div
                className="student-vertical-header"
                style={{
                  background: '#2d3136',
                  color: '#ffe066',
                  fontWeight: 700,
                  padding: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr 80px',
                  gap: '10px',
                  fontSize: '12px'
                }}
              >
                <span>ID Number</span>
                <span>Name</span>
                <span>Batch</span>
                <span style={{ textAlign: 'center' }}>Action</span>
              </div>

              {students.map((sid, index) => {
                const student = findStudent(sid);

                if (student) {
                  return (
                    <div
                      key={sid || index}
                      className="student-vertical-row"
                      style={{
                        background: '#23272b',
                        color: '#fff',
                        borderBottom: '1px solid #3a3f47',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 80px',
                        gap: '10px',
                        fontSize: '13px',
                        alignItems: 'center'
                      }}
                    >
                      <span className="student-id-col">
                        {student.id || student.student_id || 'N/A'}
                      </span>

                      <span
                        className="student-name-col"
                        style={{
                          color: '#fff',
                          fontWeight: 500
                        }}
                      >
                        {student.name || 'Unknown'}
                      </span>

                      <span className="student-batch-col">
                        {student.batch || '-'}
                      </span>

                      <span className="student-action-col" style={{ textAlign: 'center' }}>
                        <button
                          className="student-remove-btn"
                          title="Remove Student"
                          onClick={() => {
                            if (window.confirm('Remove this student from the block?')) {
                              handleRemoveStudent(
                                course._id || course.id,
                                block._id,
                                student._id
                              );
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🗑️
                        </button>
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={sid || index}
                      className="student-vertical-row"
                      style={{
                        background: '#23272b',
                        color: '#888',
                        borderBottom: '1px solid #3a3f47',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 80px',
                        gap: '10px',
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}
                    >
                      <span className="student-id-col">
                        Unknown ({String(sid).slice(-6)})
                      </span>
                      <span className="student-name-col">-</span>
                      <span className="student-batch-col">-</span>
                      <span className="student-action-col"></span>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div
              className="empty-block"
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#888'
              }}
            >
              No students in this block
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PO_LIST = [
  { id: 'A', name: 'Mathematics and Scientific Concepts' },
  { id: 'B', name: 'Design & Laboratory Experiments' },
  { id: 'C', name: 'System/Process Design' },
  { id: 'D', name: 'Teamwork & Interpersonal Skills' },
  { id: 'E', name: 'Problem Solving' },
  { id: 'F', name: 'Professional & Ethical Responsibility' },
  { id: 'G', name: 'Communication' },
  { id: 'H', name: 'Global & Societal Impact' },
  { id: 'I', name: 'Lifelong Learning' },
  { id: 'J', name: 'Contemporary Issues' }
];

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
  const [renameBlockModal, setRenameBlockModal] = useState({ open: false, courseId: '', oldName: '', newName: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
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
  const [assessmentStep, setAssessmentStep] = useState(1);
  const [assessmentId, setAssessmentId] = useState(null);
  const [poWeights, setPoWeights] = useState({});
  const [assessments, setAssessments] = useState([]);

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

  const fetchGradesFromDB = async () => {
    try {
      const facultyAssessments = assessments.filter(a =>
        String(a.created_by) === String(currentUser?.link?.roleAccount?._id)
      );
      if (facultyAssessments.length === 0) return;

      const gradesMap = {};

      for (const assessment of facultyAssessments) {
        const assessmentId = assessment._id;
        const isFinalExam = assessment.type === 'final_exam';
        const questions = assessment.questions || [];
        const rubrics = assessment.rubrics || [];

        const submissions = await getAllStudentAssessments({
          assessment_id: assessmentId,
        });

        for (const submission of submissions) {
          const studentAssessmentId = submission._id;
          const studentId = submission.student_id;

          const fc = facultyCourses.find(fc =>
            String(fc._id) === String(assessment.faculty_course_id)
          );

          if (!fc) continue;

          const courseId = fc._id;
          const gradeKey = `${courseId}_${studentId}`;

          const grades = await getAllGrades({
            student_assessment_id: studentAssessmentId,
          });

          if (grades.length > 0) {
            const grade = grades[0];

            let scores = {};

            if (isFinalExam && questions.length > 0) {
              const qResults = await getQuestionResults(studentAssessmentId);

              questions.forEach((q, idx) => {
                const result = qResults.results?.find(
                  r => String(r.question?._id) === String(q._id)
                );
                scores[`q${idx}`] = result?.is_correct || false;
              });

            } else if (!isFinalExam && rubrics.length > 0) {
              const rResults = await getRubricResults(studentAssessmentId);

              rubrics.forEach((r, idx) => {
                const result = rResults.results?.find(
                  rItem => String(rItem.rubric?._id) === String(r._id)
                );
                if (result?.level) {
                  scores[`r${idx}`] = result.level;
                }
              });
            }

            gradesMap[gradeKey] = {
              scores: scores,
              overall_grade: grade.overall_grade,
              savedAt: grade.submitted_at,
              grade_id: grade._id,
              student_assessment_id: studentAssessmentId,
            };

          }
        }
      }

      setStudentGrades(gradesMap);
      localStorage.setItem('faculty_grades', JSON.stringify(gradesMap));
    } catch (error) {
    }
  };

  const fetchFacultyData = async () => {
    try {
      const [
        fcData,
        blockData,
        bsData,
        assessmentData
      ] = await Promise.all([
        getAllFacultyCourses({
          faculty_id: currentUser?.link?.roleAccount?._id?.toString(),
        }),

        getAllBlocks(),
        getAllBlockStudents(),

        getAllAssessments({
          created_by: currentUser?.link?.roleAccount?._id?.toString(),
        }),
      ]);

      // ─────────────────────────────────────────────────────────────
      // MAP BLOCKS + STUDENTS TO FACULTY COURSES
      // ─────────────────────────────────────────────────────────────

      const fcWithBlocks = fcData.map(fc => {
        const blocks = blockData.filter(
          b => b.faculty_course_id?.toString() === fc._id?.toString()
        );

        const blocksWithStudents = blocks.map(block => {
          const enrolledStudents = bsData
            .filter(
              bs =>
                bs.block?._id?.toString() ===
                block._id?.toString()
            )
            .map(
              bs =>
                bs.student?._id?.toString() ||
                bs.student?._id
            );

          return {
            ...block,
            students: enrolledStudents,
          };
        });

        return {
          ...fc,
          blocks: blocksWithStudents,
        };
      });

      // ─────────────────────────────────────────────────────────────
      // 🔥 BUILD FAST LOOKUP MAP
      // ─────────────────────────────────────────────────────────────

      const facultyCourseMap = new Map(
        fcData.map(fc => [String(fc._id), fc])
      );

      // ─────────────────────────────────────────────────────────────
      // 🔥 ATTACH COURSE INFO INTO ASSESSMENTS
      // ─────────────────────────────────────────────────────────────

      const assessmentsWithCourse = assessmentData.map(a => {
        const fc = facultyCourseMap.get(String(a.faculty_course_id));

        return {
          ...a,
          faculty_course: fc || null,
          course: fc?.course || null,
        };
      });

      // ─────────────────────────────────────────────────────────────
      // SAVE STATES FIRST
      // ─────────────────────────────────────────────────────────────

      setFacultyCourses(fcWithBlocks);
      setAssessments(assessmentsWithCourse);
      setBlockStudents(bsData);

      // ─────────────────────────────────────────────────────────────
      // THEN FETCH GRADES (after courses & assessments are set)
      // ─────────────────────────────────────────────────────────────

      await fetchGradesFromDB();

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

  // ─────────────────────────────────────────────────────────────
  // ADD RE-FETCH ON TAB CHANGE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'grading' && facultyCourses.length > 0 && assessments.length > 0) {
      fetchGradesFromDB();
    }
  }, [activeTab, facultyCourses, assessments]);


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

  /*
  const handleAddBlock = () => {
    if (!blockInput.trim()) {
      showToast('Please enter a block name');
      return;
    }
    const course = courses.find(c => c.id === selectedCourseForBlock);
    if (!course) return;
    if (course.blocks.length >= 2) {
      showToast('Maximum 2 blocks allowed per course');
      return;
    }
    if (course.blocks.some(b => b.name.toLowerCase() === blockInput.toLowerCase())) {
      showToast('Block already exists');
      return;
    }
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseForBlock) {
        return {
          ...c,
          blocks: [...c.blocks, { name: blockInput, students: [] }]
        };
      }
      return c;
    });
    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));
    setBlockInput('');
    setSelectedCourseForBlock('');
    setOpenModal(null);
    showToast('Block added successfully');
  };
  */

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

  /*
  const handleAddStudents = () => {
    if (!selectedCourseForStudents || !selectedBlockForStudents) {
      showToast('Please select a course and block');
      return;
    }

    const studentIds = Object.keys(selectedStudents).filter(id => selectedStudents[id]);
    if (studentIds.length === 0) {
      showToast('Please select at least one student');
      return;
    }

    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseForStudents) {
        return {
          ...c,
          blocks: c.blocks.map(b => {
            if (b.name === selectedBlockForStudents) {
              const newStudents = [...new Set([...b.students, ...studentIds])];
              return { ...b, students: newStudents };
            }
            return b;
          })
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));
    setSelectedStudents({});
    setSelectedCourseForStudents('');
    setSelectedBlockForStudents('');
    setSearchTerm('');
    setSelectedBatch('');
    setSortBy('batch-desc');
    setOpenModal(null);
    showToast(`${studentIds.length} student(s) added to block`);
  };
  */
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

  const handleDeleteCourse = async (courseId) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this course? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteFacultyCourse(courseId);

      // Remove from local facultyCourses state
      setFacultyCourses(prev => prev.filter(fc => fc._id !== courseId));

      showToast('Course deleted');

    } catch (e) {
      showToast(e.message);
    }
  };

  /*
  const handleDeleteCourse = (courseId) => {
    const updatedCourses = courses.filter(c => c.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));
    // If no courses left, clear assessments and grades
    if (updatedCourses.length === 0) {
      setCourseAssessments({});
      setStudentGrades({});
      localStorage.setItem('faculty_assessments', '{}');
      localStorage.setItem('faculty_grades', '{}');
    }
    showToast('Course deleted');
  };
  */
  const handleRemoveBlock = async (courseId, blockId) => {
    try {

      // Find faculty course
      const facultyCourse = facultyCourses.find(
        fc => fc._id?.toString() === courseId?.toString()
      );

      if (!facultyCourse) {
        showToast('Faculty course not found');
        return;
      }

      // Find block
      const block = facultyCourse.blocks?.find(
        b => b._id?.toString() === blockId?.toString()
      );

      if (!block) {
        showToast('Block not found');
        return;
      }

      // Confirm deletion
      const confirmed = window.confirm(
        `Delete block "${block.name}"?`
      );

      if (!confirmed) return;

      // Delete from database
      await deleteBlock(block._id);

      // Update local state
      const updatedFacultyCourses = facultyCourses.map(fc => {

        if (fc._id?.toString() === courseId?.toString()) {

          return {
            ...fc,
            blocks: fc.blocks.filter(
              b => b._id?.toString() !== blockId?.toString()
            ),
          };
        }

        return fc;
      });

      setFacultyCourses(updatedFacultyCourses);

      showToast('Block deleted successfully');

    } catch (e) {

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
  /*
  const handleRemoveStudent = (courseId, blockName, studentId) => {
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          blocks: c.blocks.map(b => {
            if (b.name === blockName) {
              return {
                ...b,
                students: b.students.filter(s => s !== studentId)
              };
            }
            return b;
          })
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));
    showToast('Student removed');
  };*/

  const handleRemoveStudent = async (courseId, blockId, studentId) => {
    try {

      // Query the database directly
      const blockStudentsData = await getAllBlockStudents({ block_id: blockId });

      // Find the specific record
      const blockStudentRecord = blockStudentsData.find(bs =>
        bs.student?._id?.toString() === studentId?.toString()
      );


      if (!blockStudentRecord) {
        showToast('Block student record not found');
        return;
      }

      // Delete using the block_student _id
      await deleteBlockStudent(blockStudentRecord._id);

      showToast('Student removed from block');

      // Refresh data
      await fetchFacultyData();

      // Refresh block students
      const bsData = await getAllBlockStudents();
      setBlockStudents(bsData);

    } catch (e) {
      console.error('Error removing student:', e);
      showToast(e.message);
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

  const selectedCourseObj = courses.find(c => c.id === selectedCourseForStudents);
  const selectedBlockObj = selectedCourseObj?.blocks.find(b => b.name === selectedBlockForStudents);

  // Calculate PO weights for validation
  const getPoWeightTotals = () => {
    const totals = {};
    selectedPOs.forEach(po => {
      totals[po] = 0;
    });

    if (gradingMethod === 'finalExam') {
      questions.forEach((q, idx) => {
        selectedPOs.forEach(po => {
          totals[po] += (questionPOs[`${idx}-${po}`] || 0);
        });
      });
    } else {
      rubrics.forEach((r, idx) => {
        selectedPOs.forEach(po => {
          totals[po] += (r.poWeights?.[po] || 0);
        });
      });
    }

    return totals;
  };

  const poWeightTotals = getPoWeightTotals();
  const isWeightValid = Object.values(poWeightTotals).every(total => total === 100);
  const getWeightErrors = () => {
    const errors = [];
    Object.entries(poWeightTotals).forEach(([po, total]) => {
      if (total !== 100) {
        errors.push(`PO-${po}: ${total}%`);
      }
    });
    return errors;
  };

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
    const levelValues = { Excellent: 100, Good: 85, Fair: 70, Poor: 50 };

    let totalScore = 0;

    rubrics.forEach((r, idx) => {
      const level = grade.scores[`r${idx}`];
      if (level) totalScore += levelValues[level] || 0;
    });

    return rubrics.length > 0
      ? Math.round(totalScore / rubrics.length)
      : null;
  };

  const getPoScores = (studentId, courseId, assessment) => {
    const gradeKey = `${courseId}_${studentId}`;
    const grade = studentGrades[gradeKey];
    const poScores = {};

    assessment.pos.forEach(po => {
      poScores[po] = 0;
    });

    if (!grade || !grade.scores) return poScores;

    if (assessment.gradingMethod === 'finalExam') {
      assessment.questions.forEach((q, idx) => {
        const qCorrect = grade.scores[`q${idx}`] === true ? 100 : 0;
        assessment.pos.forEach(po => {
          const weight = (assessment.questionPOs[`${idx}-${po}`] || 0) / 100;
          poScores[po] += (qCorrect * weight);
        });
      });
    } else {
      const levelValues = { 'Excellent': 100, 'Good': 85, 'Fair': 70, 'Poor': 50 };
      assessment.rubrics.forEach((r, idx) => {
        const level = grade.scores[`r${idx}`];
        const rScore = levelValues[level] || 0;
        r.poWeights && assessment.pos.forEach(po => {
          const weight = (r.poWeights[po] || 0) / 100;
          poScores[po] += (rScore * weight);
        });
      });
    }

    return poScores;
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('current_user');
      router.push('/');
    }
  };

  /*
  const handleUploadAssessment = async () => {

    // ─────────────────────────────────────────────────────────────
    // STEP 1 — All validations first, no API calls yet
    // ─────────────────────────────────────────────────────────────

    if (!selectedCourseForAssessment) {
      showToast('Please select a course');
      return;
    }

    if (selectedPOs.length === 0) {
      showToast('Please select at least one Program Outcome');
      return;
    }

    if (!gradingMethod) {
      showToast('Please select a grading method');
      return;
    }

    if (gradingMethod === 'finalExam' && questions.length === 0) {
      showToast('Please add at least one question');
      return;
    }

    if (gradingMethod === 'rubrics' && rubrics.length === 0) {
      showToast('Please add at least one rubric criteria');
      return;
    }

    if (!currentUser?.link?.roleAccount?._id) {
      showToast('User session is invalid. Please log in again.');
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // FINAL EXAM VALIDATION
    // ─────────────────────────────────────────────────────────────

    if (gradingMethod === 'finalExam') {

      for (let i = 0; i < questions.length; i++) {

        const hasWeight = selectedPOs.some(
          poId => (questionPOs[`${i}-${poId}`] || 0) > 0
        );

        if (!hasWeight) {
          showToast(`Q${i + 1} has no PO weights assigned`);
          return;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // RUBRICS VALIDATION
    // ─────────────────────────────────────────────────────────────

    if (gradingMethod === 'rubrics') {

      for (let i = 0; i < rubrics.length; i++) {

        const r = rubrics[i];

        if (!r.name?.trim()) {
          showToast(`Rubric ${i + 1} has no criteria name`);
          return;
        }

        const hasWeight = selectedPOs.some(
          poId => (r.poWeights?.[poId] || 0) > 0
        );

        if (!hasWeight) {
          showToast(`Rubric "${r.name}" has no PO weights assigned`);
          return;
        }

        const hasLevels =
          r.levels?.Excellent &&
          r.levels?.Good &&
          r.levels?.Fair &&
          r.levels?.Poor;

        if (!hasLevels) {
          showToast(
            `Rubric "${r.name}" must have all four level descriptions filled in`
          );
          return;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2 — Pre-build all payloads before any API call
    // ─────────────────────────────────────────────────────────────

    // Distribute PO weights evenly for assessment level
    const evenWeight = Math.floor(100 / selectedPOs.length);
    const remainder = 100 - evenWeight * selectedPOs.length;

    const assessmentPOWeights = selectedPOs.reduce((acc, po, idx) => {
      acc[po] = idx === 0 ? evenWeight + remainder : evenWeight;
      return acc;
    }, {});

    // Pre-build question payloads
    const questionPayloads = gradingMethod === 'finalExam'
      ? questions.map((q, i) => {

        const pos = {};

        selectedPOs.forEach(poId => {
          const weight = questionPOs[`${i}-${poId}`] || 0;

          if (weight > 0) {
            pos[poId] = weight;
          }
        });

        return {
          question: q.text,
          program_outcomes: pos,
          order: i + 1,
        };
      })
      : [];

    // Pre-build rubric payloads
    const rubricPayloads = gradingMethod === 'rubrics'
      ? rubrics.map((r, i) => {

        const pos = {};

        selectedPOs.forEach(poId => {
          const weight = r.poWeights?.[poId] || 0;

          if (weight > 0) {
            pos[poId] = weight;
          }
        });

        return {
          criteria: r.name,
          program_outcomes: pos,
          levels: {
            excellent: r.levels?.Excellent || '',
            good: r.levels?.Good || '',
            fair: r.levels?.Fair || '',
            poor: r.levels?.Poor || '',
          },
          order: i + 1,
        };
      })
      : [];


    // ─────────────────────────────────────────────────────────────
    // STEP 3 — Save
    // ─────────────────────────────────────────────────────────────
    
    try {

      const res = await createAssessment({
        faculty_course_id: selectedCourseForAssessment,
        type: gradingMethod === 'finalExam'
          ? 'final_exam'
          : 'rubric',
        program_outcomes: assessmentPOWeights,
        created_by: currentUser?.link?.roleAccount?._id?.toString(),
      });

      const savedAssessmentId = res.id;

      if (gradingMethod === 'finalExam') {

        for (const payload of questionPayloads) {
          await createQuestion({
            assessment_id: savedAssessmentId,
            selectedPOs,
            ...payload
          });
        }

      } else {

        for (const payload of rubricPayloads) {
          await createRubric({
            assessment_id: savedAssessmentId,
            ...payload
          });
        }
      }

      showToast('Assessment setup saved successfully!');

      setQuestions([]);
      setRubrics([]);
      setQuestionPOs({});
      setSelectedPOs([]);
      setGradingMethod('');
      setSelectedCourseForAssessment('');
      setAssessmentStep(1);

      setActiveTab('viewAssessments');

      fetchFacultyData();

      // ─────────────────────────────────────────────────────────────
      // DEBUG LOGS
      // ─────────────────────────────────────────────────────────────


    } catch (e) {
      showToast(e.message);
    }
  };
  */

  const handleUploadAssessment = async () => {

    // ─────────────────────────────────────────────────────────────
    // STEP 1 — All validations first, no API calls yet
    // ─────────────────────────────────────────────────────────────

    if (!selectedCourseForAssessment) {
      showToast('Please select a course');
      return;
    }

    if (selectedPOs.length === 0) {
      showToast('Please select at least one Program Outcome');
      return;
    }

    if (!gradingMethod) {
      showToast('Please select a grading method');
      return;
    }

    if (gradingMethod === 'finalExam' && questions.length === 0) {
      showToast('Please add at least one question');
      return;
    }

    if (gradingMethod === 'rubrics' && rubrics.length === 0) {
      showToast('Please add at least one rubric criteria');
      return;
    }

    if (!currentUser?.link?.roleAccount?._id) {
      showToast('User session is invalid. Please log in again.');
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // FINAL EXAM VALIDATION
    // ─────────────────────────────────────────────────────────────

    if (gradingMethod === 'finalExam') {

      for (let i = 0; i < questions.length; i++) {

        const hasWeight = selectedPOs.some(
          poId => (questionPOs[`${i}-${poId}`] || 0) > 0
        );

        if (!hasWeight) {
          showToast(`Q${i + 1} has no PO weights assigned`);
          return;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // RUBRICS VALIDATION
    // ─────────────────────────────────────────────────────────────

    if (gradingMethod === 'rubrics') {

      console.log('📤 RUBRICS VALIDATION - rubrics:', rubrics);
      console.log('📤 RUBRICS VALIDATION - selectedPOs:', selectedPOs);

      for (let i = 0; i < rubrics.length; i++) {

        const r = rubrics[i];

        console.log(`📤 Rubric ${i}:`, r);
        console.log(`📤 Rubric ${i} name:`, r?.name);
        console.log(`📤 Rubric ${i} poWeights:`, r?.poWeights);

        if (!r.name?.trim()) {
          showToast(`Rubric ${i + 1} has no criteria name`);
          return;
        }

        const hasWeight = selectedPOs.some(
          poId => (r.poWeights?.[poId] || 0) > 0
        );

        console.log(`📤 Rubric ${i} hasWeight:`, hasWeight);

        if (!hasWeight) {
          showToast(`Rubric "${r.name}" has no PO weights assigned`);
          return;
        }

        const hasLevels =
          r.levels?.Excellent &&
          r.levels?.Good &&
          r.levels?.Fair &&
          r.levels?.Poor;

        console.log(`📤 Rubric ${i} hasLevels:`, hasLevels);

        if (!hasLevels) {
          showToast(
            `Rubric "${r.name}" must have all four level descriptions filled in`
          );
          return;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2 — Pre-build all payloads before any API call
    // ─────────────────────────────────────────────────────────────

    // Distribute PO weights evenly for assessment level
    const evenWeight = Math.floor(100 / selectedPOs.length);
    const remainder = 100 - evenWeight * selectedPOs.length;

    const assessmentPOWeights = selectedPOs.reduce((acc, po, idx) => {
      acc[po] = idx === 0 ? evenWeight + remainder : evenWeight;
      return acc;
    }, {});

    console.log('📤 assessmentPOWeights:', assessmentPOWeights);

    // Pre-build question payloads
    const questionPayloads = gradingMethod === 'finalExam'
      ? questions.map((q, i) => {

        const pos = {};

        selectedPOs.forEach(poId => {
          const weight = questionPOs[`${i}-${poId}`] || 0;

          if (weight > 0) {
            pos[poId] = weight;
          }
        });

        return {
          question: q.text,
          program_outcomes: pos,
          order: i + 1,
        };
      })
      : [];

    // Pre-build rubric payloads
    const rubricPayloads = gradingMethod === 'rubrics'
      ? rubrics.map((r, i) => {

        const pos = {};

        selectedPOs.forEach(poId => {
          const weight = r.poWeights?.[poId] || 0;

          if (weight > 0) {
            pos[poId] = weight;
          }
        });

        const payload = {
          criteria: r.name,
          program_outcomes: pos,
          levels: {
            excellent: r.levels?.Excellent || '',
            good: r.levels?.Good || '',
            fair: r.levels?.Fair || '',
            poor: r.levels?.Poor || '',
          },
          order: i + 1,
        };

        console.log(`📤 Rubric payload ${i}:`, payload);

        return payload;
      })
      : [];

    console.log('📤 rubricPayloads:', JSON.stringify(rubricPayloads, null, 2));


    // ─────────────────────────────────────────────────────────────
    // STEP 3 — Save
    // ─────────────────────────────────────────────────────────────

    try {

      console.log('📤 Creating assessment...');
      
      const res = await createAssessment({
        faculty_course_id: selectedCourseForAssessment,
        type: gradingMethod === 'finalExam'
          ? 'final_exam'
          : 'rubric',
        program_outcomes: assessmentPOWeights,
        created_by: currentUser?.link?.roleAccount?._id?.toString(),
      });

      console.log('📤 Assessment created:', res);

      const savedAssessmentId = res.id;

      if (gradingMethod === 'finalExam') {

        for (const payload of questionPayloads) {
          console.log('📤 Creating question:', payload);
          await createQuestion({
            assessment_id: savedAssessmentId,
            selectedPOs,
            ...payload
          });
        }

      } else if (gradingMethod === 'rubrics') {

        console.log('📤 Creating rubrics... rubrics.length:', rubrics.length);
        
        for (const payload of rubricPayloads) {
          console.log('📤 Creating rubric with payload:', payload);
          await createRubric({
            assessment_id: savedAssessmentId,
            ...payload
          });
          console.log('📤 Rubric created successfully');
        }
      }

      showToast('Assessment setup saved successfully!');

      setQuestions([]);
      setRubrics([]);
      setQuestionPOs({});
      setSelectedPOs([]);
      setGradingMethod('');
      setSelectedCourseForAssessment('');
      setAssessmentStep(1);

      setActiveTab('viewAssessments');

      fetchFacultyData();

    } catch (e) {
      console.error('📤 ERROR:', e);
      showToast(e.message);
    }
  };

  const handleSaveGrades = async () => {
    try {
      // ─────────────────────────────────────────────────────────────
      // STEP 0: VALIDATION
      // ─────────────────────────────────────────────────────────────

      const studentId = selectedStudentForGrading;
      const courseId = selectedCourseForGrading;

      const selectedBlockObj = facultyCourses
        ?.find(fc => String(fc._id) === String(selectedCourseForGrading))
        ?.blocks?.find(b => b.name === selectedBlockForGrading);

      const blockId = selectedBlockObj?._id;

      console.log('🔍 DEBUG - All IDs:');
      console.log('  studentId:', studentId);
      console.log('  courseId:', courseId);
      console.log('  blockId:', blockId);

      if (!studentId || !courseId || !blockId) {
        showToast('Missing: student, course, or block');
        return;
      }

      const assessment = assessments?.find(
        a => String(a.faculty_course_id) === String(courseId)
      );

      if (!assessment) {
        showToast('No assessment found for this course');
        return;
      }

      const isFinalExam = assessment.type === 'final_exam';
      const questions = assessment.questions || [];
      const rubrics = assessment.rubrics || [];

      console.log('🔍 DEBUG - Assessment:');
      console.log('  assessment._id:', assessment._id);
      console.log('  type:', assessment.type);
      console.log('  questions count:', questions.length);
      console.log('  rubrics count:', rubrics.length);

      // ─────────────────────────────────────────────────────────────
      // STEP 1: CHECK/CREATE STUDENT ASSESSMENT
      // ─────────────────────────────────────────────────────────────


      const existingSubmissions = await getAllStudentAssessments({
        assessment_id: assessment._id,
        block_id: blockId,
        student_id: studentId,
      });


      let studentAssessmentId;

      if (existingSubmissions.length > 0) {
        studentAssessmentId = existingSubmissions[0]._id;
      } else {

        const newSubmission = await createStudentAssessment({
          assessment_id: assessment._id,
          block_id: blockId,
          student_id: studentId,
        });

        studentAssessmentId = newSubmission.id;
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 3: SAVE QUESTION RESULTS (Final Exam)
      // ─────────────────────────────────────────────────────────────

      if (isFinalExam && questions.length > 0) {

        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];

          // Get score by index - defaults to false if unchecked
          const isCorrect = questionScores[`q${i}`] === true;


          // Check if result exists
          const existingResults = await getQuestionResults(studentAssessmentId);
          const existingResult = existingResults.results?.find(
            (r) => String(r.question?._id) === String(question._id)
          );

          const payload = {
            student_assessment_id: studentAssessmentId,
            question_id: question._id,
            is_correct: isCorrect,
          };


          if (existingResult) {
            // Update existing (even if false!)
            await updateQuestionResult(existingResult._id, isCorrect);
          } else {
            // Create new (even if false!)
            await createQuestionResult(payload);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 3b: SAVE RUBRIC RESULTS (Rubrics)
      // ─────────────────────────────────────────────────────────────

      if (!isFinalExam && rubrics.length > 0) {

        for (let i = 0; i < rubrics.length; i++) {
          const rubric = rubrics[i];
          const level = rubricScores[`r${i}`];

          if (!level) continue;


          // Check if result exists
          const existingResults = await getRubricResults(studentAssessmentId);
          const existingResult = existingResults.results?.find(
            (r) => String(r.rubric?._id) === String(rubric._id)
          );

          const payload = {
            student_assessment_id: studentAssessmentId,
            rubric_id: rubric._id,
            level: level,
          };


          if (existingResult) {
            await updateRubricResult(existingResult._id, level);
          } else {
            await createRubricResult(payload);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 4: CALCULATE & SAVE GRADE
      // ─────────────────────────────────────────────────────────────

      const gradeKey = `${courseId}_${studentId}`;

      // Calculate percentage for display (from scores)
      let totalScore = 0;
      let totalItems = 0;

      if (isFinalExam) {
        // Count all questions (including unchecked = false)
        for (let i = 0; i < questions.length; i++) {
          if (questionScores[`q${i}`] === true) totalScore++;
          totalItems++;
        }
      } else {
        const levelValues = { Excellent: 100, Good: 85, Fair: 70, Poor: 50 };
        for (let i = 0; i < rubrics.length; i++) {
          const level = rubricScores[`r${i}`];
          if (level) {
            totalScore += levelValues[level] || 0;
            totalItems++;
          }
        }
      }

      const percentage = totalItems > 0 ? Math.round((totalScore / totalItems) * 100) : 0;

      // Convert 0-100% to 1.0-5.0 grade
      let overallGrade;
      if (percentage >= 75) overallGrade = 1.0;
      else if (percentage >= 60) overallGrade = 2.5;
      else if (percentage >= 50) overallGrade = 3.5;
      else overallGrade = 5.0;

      const remarks = overallGrade <= 3.0 ? 'PASSED' : 'FAILED';

      // Check if grade already exists
      const existingGrades = await getAllGrades({
        student_assessment_id: studentAssessmentId,
      });

      if (existingGrades.length > 0) {
        await updateGrade(existingGrades[0]._id, {
          overall_grade: overallGrade,
          outcome_grades: {},
          remarks: remarks
        });
      } else {
        await createGrade({
          student_assessment_id: studentAssessmentId,
          overall_grade: overallGrade,
          outcome_grades: {},
          remarks: remarks
        });
      }


      // ─────────────────────────────────────────────────────────────
      // STEP 5: UPDATE LOCAL STATE & UI
      // ─────────────────────────────────────────────────────────────

      const updatedGrades = { ...studentGrades };
      updatedGrades[gradeKey] = {
        ...updatedGrades[gradeKey],
        scores: isFinalExam ? questionScores : rubricScores,
        overall_grade: overallGrade,
        percentage: percentage,
        savedAt: new Date().toISOString(),
      };

      setStudentGrades(updatedGrades);
      localStorage.setItem('faculty_grades', JSON.stringify(updatedGrades));

      showToast('Grades saved successfully!');
      setGradingView('list');
      setSelectedStudentForGrading('');
      setQuestionScores({});
      setRubricScores({});

    } catch (error) {
      showToast(error.message || 'Failed to save grades');
    }
  };
  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
          <div className="brand-text">
            <h3>CDM-OBE System</h3>
            <span style={{ color: '#10b981', fontWeight: 'bold', letterSpacing: '1px' }}>FACULTY</span>
          </div>
        </div>
        <nav className="nav-menu">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            ⚙️ Manage Courses
          </button>
          <button
            className={`nav-btn ${activeTab === 'assessment' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('assessment');
              setAssessmentStep(1);
              setSelectedCourseForAssessment('');
              setSelectedPOs([]);
              setGradingMethod('');
            }}
          >
            📋 Assessment Setup
          </button>
          <button
            className={`nav-btn ${activeTab === 'viewAssessments' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewAssessments')}
          >
            ✓ View Assessments
          </button>
          <button
            className={`nav-btn ${activeTab === 'grading' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('grading');
              setGradingView('list');
              setSelectedCourseForGrading('');
              setSelectedBlockForGrading('');
              setSelectedStudentForGrading('');
            }}
          >
            ⭐ Grade Students
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-btn theme-switch" onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="nav-btn logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      <main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>

        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="pc-header" style={{ marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Faculty Dashboard</h1>
                <p style={{ color: 'var(--text-sub)' }}>Welcome back! Your assessment & grading hub.</p>
              </div>
            </div>

            <div className="dashboard-stats-grid">
              <button className="stat-widget" onClick={() => setDashboardDetail('courses')} title="View Courses Details">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{courses.length}</div>
                  <div className="stat-label">Courses</div>
                </div>
              </button>
              <button className="stat-widget" onClick={() => setDashboardDetail('assessments')} title="View Assessments Details">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">{Object.keys(courseAssessments).length}</div>
                  <div className="stat-label">Assessments</div>
                </div>
              </button>
              <button className="stat-widget" onClick={() => setDashboardDetail('graded')} title="View Graded Details">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-number">{Object.keys(studentGrades).filter(key => studentGrades[key].scores).length}</div>
                  <div className="stat-label">Graded</div>
                </div>
              </button>
              <button className="stat-widget" onClick={() => setDashboardDetail('students')} title="View Students Details">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{courses.reduce((sum, c) => sum + c.blocks.reduce((bs, b) => bs + b.students.length, 0), 0)}</div>
                  <div className="stat-label">Students</div>
                </div>
              </button>
            </div>

            {/* Dashboard Details Modal */}
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

            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h2>Quick Actions</h2>
                <div className="quick-action-buttons">
                  <button
                    onClick={() => setOpenModal('addcourse')}
                    className="quick-action-btn course-btn"
                  >
                    <div className="btn-icon">📚</div>
                    <div className="btn-text">
                      <h4>Add Course</h4>
                      <p>Create new course</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('assessment')}
                    className="quick-action-btn assessment-btn"
                  >
                    <div className="btn-icon">📋</div>
                    <div className="btn-text">
                      <h4>Setup Assessment</h4>
                      <p>Configure POs & grading</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('grading')}
                    className="quick-action-btn grading-btn"
                  >
                    <div className="btn-icon">⭐</div>
                    <div className="btn-text">
                      <h4>Grade Students</h4>
                      <p>Evaluate performance</p>
                    </div>
                  </button>
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
                        <div key={course.id} className="course-overview-item">
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

        {activeTab === 'manage' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="pc-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Manage Courses</h1>
                <p style={{ color: 'var(--text-sub)' }}>Add, edit, or remove your courses and blocks</p>
              </div>
            </div>
            <div className="manage-buttons">
              <button onClick={() => setOpenModal('addcourse')} className="primary-btn">
                ➕ Add Course
              </button>
              <button onClick={() => setOpenModal('addblock')} className="outline-btn">
                📦 Add Blocks
              </button>
              <button onClick={() => setOpenModal('addstudents')} className="outline-btn">
                👥 Add Students
              </button>
            </div>
            {facultyCourses.length > 0 ? (
              <div className="manage-courses-organized">
                {facultyCourses.map(fc => (
                  <div key={fc._id} className="organized-course-card">
                    <div className="organized-course-header">
                      <span className="course-title">{fc.course?.code} {fc.course?.course}</span>
                      <span className="course-meta">{fc.school_year} — {fc.semester} Semester</span>
                      <button
                        onClick={() => handleDeleteCourse(fc._id)}
                        className="card-delete-btn"
                        title="Delete Course"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="organized-blocks-list">
                      {fc.blocks?.length > 0 ? fc.blocks.map(block => (
                        <BlockSection
                          key={block.name}
                          block={block}
                          course={fc}
                          masterlist={masterlist}
                          handleRemoveBlock={handleRemoveBlock}
                          handleRemoveStudent={handleRemoveStudent}
                          setRenameBlockModal={setRenameBlockModal}
                          renameBlockModal={renameBlockModal}
                          setCourses={setCourses}
                          courses={facultyCourses}
                          showToast={showToast}
                        />
                      )) : (
                        <div className="empty-blocks">No blocks</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No courses yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}


        {activeTab === 'assessment' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="pc-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Assessment Setup</h1>
                <p style={{ color: 'var(--text-sub)' }}>Configure Program Outcomes and grading methods for your courses</p>
              </div>
            </div>

            <div className="assessment-container">
              <div className="step-indicator">
                <div className={`step ${assessmentStep >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                  <p>Select Course</p>
                </div>
                <div className="step-line"></div>
                <div className={`step ${assessmentStep >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                  <p>POs & Method</p>
                </div>
                <div className="step-line"></div>
                <div className={`step ${assessmentStep >= 3 ? 'active' : ''}`}>
                  <span>3</span>
                  <p>Questions/Rubrics</p>
                </div>
              </div>

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

              {assessmentStep === 2 && selectedCourseForAssessment && (
                <div className="assessment-form">
                  <h2>Program Outcomes & Grading Method</h2>

                  <div className="form-group">
                    <label>Select Program Outcomes (POs)</label>
                    <p className="help-text">Select one or more POs that this course covers:</p>
                    <div className="po-grid">
                      {PO_LIST.map(po => (
                        <label key={po.id} className="po-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedPOs.includes(po.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPOs([...selectedPOs, po.id]);
                              } else {
                                setSelectedPOs(selectedPOs.filter(id => id !== po.id));
                              }
                            }}
                          />
                          <span className="po-label">
                            <strong>PO-{po.id}</strong>: {po.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Grading Method</label>
                    <p className="help-text">Choose how you will assess student learning:</p>
                    <div className="method-options">
                      <button
                        className={`method-option ${gradingMethod === 'finalExam' ? 'selected' : ''}`}
                        onClick={() => setGradingMethod('finalExam')}
                      >
                        <div className="method-icon">📝</div>
                        <div className="method-text">
                          <h3>Final Exam</h3>
                          <p>Upload questions and map to POs</p>
                        </div>
                      </button>
                      <button
                        className={`method-option ${gradingMethod === 'rubrics' ? 'selected' : ''}`}
                        onClick={() => setGradingMethod('rubrics')}
                      >
                        <div className="method-icon">📊</div>
                        <div className="method-text">
                          <h3>Rubrics</h3>
                          <p>Create criteria and assign POs</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="form-buttons">
                    <button onClick={() => setAssessmentStep(1)} className="outline-btn">
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (selectedPOs.length === 0) {
                          showToast('Please select at least one PO');
                          return;
                        }
                        if (!gradingMethod) {
                          showToast('Please select a grading method');
                          return;
                        }
                        setAssessmentStep(3);
                      }}
                      className="primary-btn"
                    >
                      Next: Setup Assessment →
                    </button>
                  </div>
                </div>
              )}

              {assessmentStep === 3 && selectedCourseForAssessment && (
                <div className="assessment-form">
                  {gradingMethod === 'finalExam' ? (
                    <div>
                      <h2>Final Exam - Question Setup</h2>
                      <p className="help-text">Add questions and assign POs with weights (must total 100% per question)</p>

                      <div className="questions-list">
                        {questions.length > 0 ? (
                          questions.map((q, idx) => (
                            <div key={idx} className="question-item portal-card">
                              <div className="question-header">
                                <h4>Q{idx + 1}: {q.text}</h4>
                                <button
                                  onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                                  className="delete-btn"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="question-pos">
                                {selectedPOs.map(poId => (
                                  <div key={poId} className="po-weight-input">
                                    <label>PO-{poId} Weight:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={questionPOs[`${idx}-${poId}`] || 0}
                                      onChange={(e) => {
                                        setQuestionPOs({
                                          ...questionPOs,
                                          [`${idx}-${poId}`]: parseInt(e.target.value) || 0
                                        });
                                      }}
                                      className="form-input"
                                      placeholder="Weight %"
                                    />
                                    <span>%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="empty-state">No questions added yet</p>
                        )}
                      </div>

                      <div className="add-question-form">
                        <h3>Add New Question</h3>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Enter question text..."
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!currentQuestion.trim()) {
                              showToast('Please enter a question');
                              return;
                            }
                            setQuestions([...questions, { text: currentQuestion }]);
                            setCurrentQuestion('');
                          }}
                          className="primary-btn"
                        >
                          ➕ Add Question
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2>Rubrics - Criteria Setup</h2>
                      <p className="help-text">Create rubric criteria and assign POs with weights (must total 100% per criteria)</p>

                      <div className="rubrics-list">
                        {rubrics.length > 0 ? (
                          rubrics.map((r, idx) => (
                            <div key={idx} className="rubric-item portal-card">
                              <div className="rubric-header">
                                <h4>{r.name}</h4>
                                <button
                                  onClick={() => setRubrics(rubrics.filter((_, i) => i !== idx))}
                                  className="delete-btn"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="rubric-levels">
                                {['Excellent', 'Good', 'Fair', 'Poor'].map(level => (
                                  <div key={level} className="level-row">
                                    <label>{level}:</label>
                                    <input
                                      type="text"
                                      placeholder={`${level} description...`}
                                      defaultValue={r.levels?.[level] || ''}
                                      onChange={(e) => {
                                        const updated = [...rubrics];
                                        updated[idx].levels = { ...r.levels, [level]: e.target.value };
                                        setRubrics(updated);
                                      }}
                                      className="form-input"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="rubric-pos">
                                {selectedPOs.map(poId => (
                                  <div key={poId} className="po-weight-input">
                                    <label>PO-{poId} Weight:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={r.poWeights?.[poId] || 0}
                                      onChange={(e) => {
                                        const updated = [...rubrics];
                                        updated[idx].poWeights = { ...r.poWeights, [poId]: parseInt(e.target.value) || 0 };
                                        setRubrics(updated);
                                      }}
                                      className="form-input"
                                      placeholder="Weight %"
                                    />
                                    <span>%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="empty-state">No rubrics added yet</p>
                        )}
                      </div>

                      <div className="add-rubric-form">
                        <h3>Add New Rubric Criteria</h3>
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Enter criteria name (e.g., Problem Solving)..."
                            value={rubricName}
                            onChange={(e) => setRubricName(e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!rubricName.trim()) {
                              showToast('Please enter a criteria name');
                              return;
                            }
                            setRubrics([...rubrics, { name: rubricName, levels: {}, poWeights: {} }]);
                            setRubricName('');
                          }}
                          className="primary-btn"
                        >
                          ➕ Add Criteria
                        </button>
                      </div>
                    </div>
                  )}

                  {!isWeightValid && (
                    <div className="weight-validation-error">
                      <div className="error-icon">⚠️</div>
                      <div className="error-content">
                        <h4>Weight Validation Error</h4>
                        <p>Each PO must total exactly 100%. Current weights:</p>
                        <div className="weight-details">
                          {getWeightErrors().map((error, idx) => (
                            <div key={idx} className="weight-error-item">{error}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-buttons">
                    <button onClick={() => setAssessmentStep(2)} className="outline-btn">
                      ← Back
                    </button>
                    <button
                      onClick={handleUploadAssessment}
                      className="primary-btn success-btn"
                      disabled={!isWeightValid}
                    >
                      ✓ Save Assessment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'viewAssessments' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="pc-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>
                  Saved Assessments
                </h1>
                <p style={{ color: 'var(--text-sub)' }}>
                  View and manage your completed assessment configurations
                </p>
              </div>
            </div>

            <div className="assessment-container">
              {assessments.length > 0 ? (
                <div className="assessments-grid">
                  {assessments.map((assessment) => {

                    const targetId = String(assessment.faculty_course_id);

                    const match = ALL_COURSES.find(
                      (c) => String(c._id) === targetId
                    );

                    // DEBUG (keep for now)
                    console.group("🧠 Assessment Debug");
                    console.log("Assessment ID:", assessment._id);
                    console.log("faculty_course_id:", targetId);
                    console.log("Match found?:", !!match);
                    console.log(
                      "Matched course:",
                      match
                        ? {
                          id: match._id,
                          code: match.code,
                          name: match.course
                        }
                        : "❌ NOT FOUND IN ALL_COURSES"
                    );
                    console.groupEnd();

                    const pos = Object.keys(assessment.program_outcomes || {});

                    return (
                      <div
                        key={assessment._id}
                        className="assessment-card portal-card"
                      >

                        {/* HEADER */}
                        <div className="assessment-card-header">

                          <div className="assessment-course-info">

                            <h3>
                              {assessment.course
                                ? `${assessment.course.code} - ${assessment.course.course}`
                                : 'Unknown Course'}
                            </h3>

                            <p className="method-badge">
                              {assessment.type === 'final_exam'
                                ? '📝 Final Exam'
                                : '📊 Rubrics'}
                            </p>

                          </div>

                          <button
                            onClick={async () => {
                              const confirmed = window.confirm(
                                'Are you sure you want to delete this assessment?'
                              );

                              if (!confirmed) return;

                              try {
                                await deleteAssessment(assessment._id);

                                setAssessments(prev =>
                                  prev.filter(a => a._id !== assessment._id)
                                );

                                showToast('Assessment deleted');

                              } catch (e) {
                                showToast(e.message);
                              }
                            }}
                            className="delete-btn"
                            title="Delete assessment"
                          >
                            🗑️
                          </button>

                        </div>

                        {/* DETAILS */}
                        <div className="assessment-details">

                          <div className="detail-section">
                            <h4>Program Outcomes</h4>

                            <div className="pos-display">
                              {pos.map(po => (
                                <span key={po} className="po-tag">
                                  PO-{po}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* QUESTIONS / RUBRICS */}
                          {assessment.type === 'final_exam' ? (
                            <div className="detail-section">

                              <h4>
                                Questions ({assessment.questions?.length || 0})
                              </h4>

                              <div className="questions-summary">

                                {assessment.questions
                                  ?.slice(0, 2)
                                  .map((q, idx) => (
                                    <div
                                      key={idx}
                                      className="question-summary"
                                    >
                                      <span className="q-num">
                                        Q{idx + 1}:
                                      </span>
                                      <span className="q-text">
                                        {q.question}
                                      </span>
                                    </div>
                                  ))}

                                {(assessment.questions?.length || 0) > 2 && (
                                  <div className="more-questions">
                                    +{assessment.questions.length - 2} more questions
                                  </div>
                                )}

                              </div>
                            </div>

                          ) : (
                            <div className="detail-section">

                              <h4>
                                Rubric Criteria ({assessment.rubrics?.length || 0})
                              </h4>

                              <div className="rubrics-summary">

                                {assessment.rubrics
                                  ?.slice(0, 2)
                                  .map((r, idx) => (
                                    <div key={idx} className="rubric-summary">
                                      {r.criteria}
                                    </div>
                                  ))}

                                {(assessment.rubrics?.length || 0) > 2 && (
                                  <div className="more-rubrics">
                                    +{assessment.rubrics.length - 2} more criteria
                                  </div>
                                )}

                              </div>
                            </div>
                          )}

                          {/* PO WEIGHTS */}
                          <div className="detail-section">

                            <h4>PO Weight Distribution</h4>

                            <div className="weights-display">

                              {pos.map(po => {

                                let total = 0;

                                if (assessment.type === 'final_exam') {
                                  assessment.questions?.forEach(q => {
                                    total += q.program_outcomes?.[po] || 0;
                                  });
                                } else {
                                  assessment.rubrics?.forEach(r => {
                                    total += r.program_outcomes?.[po] || 0;
                                  });
                                }

                                return (
                                  <div key={po} className="weight-row">

                                    <span className="po-label">
                                      PO-{po}:
                                    </span>

                                    <div className="weight-bar">
                                      <div
                                        className="weight-fill"
                                        style={{
                                          width: `${Math.min(total, 100)}%`
                                        }}
                                      />
                                    </div>

                                    <span className="weight-value">
                                      {total}%
                                    </span>

                                  </div>
                                );
                              })}

                            </div>
                          </div>

                          {/* EDIT */}
                          <div className="assessment-actions">

                            <button
                              onClick={() => {
                                setSelectedCourseForAssessment(
                                  assessment.faculty_course_id
                                );

                                setSelectedPOs(pos);

                                setGradingMethod(
                                  assessment.type === 'final_exam'
                                    ? 'finalExam'
                                    : 'rubrics'
                                );

                                if (assessment.type === 'final_exam') {
                                  setQuestions(
                                    assessment.questions?.map(q => ({
                                      text: q.question
                                    })) || []
                                  );

                                  const rebuiltQuestionPOs = {};

                                  assessment.questions?.forEach((q, idx) => {
                                    Object.entries(
                                      q.program_outcomes || {}
                                    ).forEach(([po, weight]) => {
                                      rebuiltQuestionPOs[
                                        `${idx}-${po}`
                                      ] = weight;
                                    });
                                  });

                                  setQuestionPOs(rebuiltQuestionPOs);

                                } else {
                                  setRubrics(
                                    assessment.rubrics?.map(r => ({
                                      name: r.criteria,
                                      poWeights: r.program_outcomes,
                                      levels: {
                                        Excellent: r.levels?.excellent || '',
                                        Good: r.levels?.good || '',
                                        Fair: r.levels?.fair || '',
                                        Poor: r.levels?.poor || '',
                                      }
                                    })) || []
                                  );
                                }

                                setAssessmentStep(3);
                                setActiveTab('assessment');
                              }}
                              className="edit-btn"
                            >
                              ✏️ Edit
                            </button>

                          </div>
                        </div>

                        {/* META */}
                        {assessment.createdAt && (
                          <div className="assessment-meta">
                            Last updated:{' '}
                            {new Date(
                              assessment.updatedAt || assessment.createdAt
                            ).toLocaleDateString()}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              ) : (
                <div className="empty-state">
                  <div className="assessment-empty-card">

                    <div className="assessment-empty-icon">
                      📝
                    </div>

                    <div className="assessment-empty-title">
                      No Assessments Yet
                    </div>

                    <div className="assessment-empty-sub">
                      Get started by setting up your first assessment
                      for your course.
                      <br />
                      Assessments help track student outcomes and progress!
                    </div>

                    <button
                      onClick={() => setActiveTab('assessment')}
                      className="primary-btn assessment-setup-btn"
                    >
                      <span className="assessment-btn-icon">➕</span>
                      Start Assessment Setup
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grading' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="pc-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>
                  Grade Students
                </h1>
                <p style={{ color: 'var(--text-sub)' }}>
                  Evaluate student performance based on assessments
                </p>
              </div>
            </div>

            {gradingView === 'list' ? (
              <div className="grading-selector">

                {/* ─────────────────────────────
            COURSE SELECTOR (FIXED)
        ───────────────────────────── */}
                <div className="selector-group">
                  <label>Select Course</label>

                  <select
                    value={selectedCourseForGrading}
                    onChange={(e) => {
                      setSelectedCourseForGrading(e.target.value);
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

                {/* ─────────────────────────────
            BLOCK SELECTOR (FIXED)
        ───────────────────────────── */}
                {selectedCourseForGrading && (
                  <div className="selector-group">
                    <label>Select Block</label>

                    <select
                      value={selectedBlockForGrading}
                      onChange={(e) => {
                        setSelectedBlockForGrading(e.target.value);
                        setSelectedStudentForGrading('');
                      }}
                      className="form-input"
                    >
                      <option value="">Choose a block...</option>

                      {facultyCourses
                        ?.find(fc => fc._id === selectedCourseForGrading)
                        ?.blocks?.map((b) => (
                          <option key={b._id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}


                {selectedCourseForGrading && selectedBlockForGrading && (
                  <div className="students-grading-list">
                    <h3>Students in {selectedBlockForGrading}</h3>
                    <div className="student-list-grading">
                      {facultyCourses
                        ?.find(fc => fc._id === selectedCourseForGrading)
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

                          // ─────────────────────────────────────────────────────────────
                          // Get grade from studentGrades state (loaded from DB)
                          // ─────────────────────────────────────────────────────────────
                          const gradeKey = `${selectedCourseForGrading}_${studentId}`;
                          const savedGrade = studentGrades[gradeKey];

                          console.log('🔍 RENDER - gradeKey:', gradeKey);
                          console.log('🔍 RENDER - savedGrade:', savedGrade);
                          console.log('🔍 RENDER - scores:', savedGrade?.scores);

                          let gradeNumber = null;
                          let gradeColor = '#94a3b8';

                          // Calculate from SCORES only
                          if (savedGrade?.scores && Object.keys(savedGrade.scores).length > 0) {
                            const isFinalExam = assessment?.type === 'final_exam';

                            if (isFinalExam) {
                              // Get TOTAL from ASSESSMENT questions, not from scores!
                              const totalQuestions = assessment?.questions?.length || 0;

                              // Count correct from scores (true values)
                              const scoreValues = Object.values(savedGrade.scores);
                              const correctCount = scoreValues.filter(v => v === true).length;

                              console.log('🔍 RENDER - totalQuestions:', totalQuestions);
                              console.log('🔍 RENDER - correctCount:', correctCount);

                              gradeNumber = totalQuestions > 0
                                ? Math.round((correctCount / totalQuestions) * 100)
                                : null;

                              console.log('🔍 RENDER - gradeNumber:', gradeNumber);
                            } else {
                              // Rubric - calculate average
                              const levelValues = { Excellent: 100, Good: 85, Fair: 70, Poor: 50 };
                              const scoreValues = Object.values(savedGrade.scores)
                                .map(l => levelValues[l] || 0)
                                .filter(v => v > 0);

                              gradeNumber = scoreValues.length > 0
                                ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
                                : null;
                            }
                          } else {
                            console.log('🔍 RENDER - No scores found, showing Not Graded');
                          }

                          // Set color based on grade
                          if (gradeNumber !== null) {
                            gradeColor = gradeNumber >= 75 ? '#10b981' : gradeNumber >= 60 ? '#f59e0b' : '#ef4444';
                          }

                          return (
                            <div
                              key={studentId}
                              className="student-grading-item"
                              onClick={() => {
                                setSelectedStudentForGrading(studentId);

                                const gradeKey = `${selectedCourseForGrading}_${studentId}`;

                                if (studentGrades[gradeKey]) {
                                  setQuestionScores(studentGrades[gradeKey].scores || {});
                                  setRubricScores(studentGrades[gradeKey].scores || {});
                                } else {
                                  setQuestionScores({});
                                  setRubricScores({});
                                }

                                setGradingView('grade');
                              }}
                            >
                              <div className="student-grading-info">
                                <h4>{student?.name}</h4>
                                <p>{student?.student_number || student?.id}</p>
                              </div>

                              <div
                                className="student-grade-display"
                                style={{ borderColor: gradeColor }}
                              >
                                {gradeNumber !== null ? (
                                  <>
                                    <div
                                      className="grade-circle"
                                      style={{ background: gradeColor }}
                                    >
                                      {gradeNumber}
                                    </div>
                                    <span className="grade-label">Grade</span>
                                  </>
                                ) : (
                                  <>
                                    <div
                                      className="grade-circle"
                                      style={{ background: gradeColor }}
                                    >
                                      ?
                                    </div>
                                    <span className="grade-label">Not Graded</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grading-form-container">
                {selectedStudentForGrading && selectedCourseForGrading && (
                  <div className="grading-form">
                    {(() => {
                      const student = masterlist.find(s => s.id === selectedStudentForGrading);
                      const assessment = courseAssessments[selectedCourseForGrading];
                      const gradeKey = `${selectedCourseForGrading}_${selectedStudentForGrading}`;
                      const currentGrade = studentGrades[gradeKey];
                      let currentGradePercent = null;

                      if (currentGrade?.overall_grade) {
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
                              <div className="grade-preview">
                                {currentGradePercent !== null ? (
                                  <div className="preview-grade">
                                    <span className="preview-label">Current Grade:</span>
                                    <span className="preview-value">{currentGradePercent}/100</span>
                                  </div>
                                ) : (
                                  <div className="preview-grade">
                                    <span className="preview-label">Status:</span>
                                    <span className="preview-value">Not Graded</span>
                                  </div>
                                )}
                              </div>
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
                              <div className="grading-content">
                                <h3>Final Exam - Mark Questions</h3>
                                <p className="grading-subtitle">
                                  Check off questions the student answered correctly
                                </p>

                                <div className="questions-checklist">
                                  {questions.map((q, idx) => {
                                    const isCorrect =
                                      currentGrade?.scores?.[`q${idx}`] === true;

                                    return (
                                      <div key={idx} className="question-checklist-item">
                                        <div className="question-check-content">
                                          <button
                                            className={`question-checkbox ${isCorrect ? 'checked' : ''}`}
                                            onClick={() => {
                                              const updatedGrades = { ...studentGrades };

                                              if (!updatedGrades[gradeKey]) {
                                                updatedGrades[gradeKey] = { scores: {} };
                                              }

                                              updatedGrades[gradeKey].scores[`q${idx}`] =
                                                !isCorrect;

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
                            ) : (
                              <div className="grading-content">
                                <h3>Rubrics Assessment</h3>

                                <div className="rubrics-grading">
                                  {rubrics.map((r, idx) => {
                                    const selectedLevel =
                                      currentGrade?.scores?.[`r${idx}`];

                                    const levelValues = {
                                      Excellent: 100,
                                      Good: 85,
                                      Fair: 70,
                                      Poor: 50,
                                    };

                                    const currentScore =
                                      levelValues[selectedLevel] || 0;

                                    return (
                                      <div key={idx} className="rubric-card">
                                        <div className="rubric-card-header">
                                          <h4>{r.criteria || r.name}</h4>

                                          {selectedLevel && (
                                            <div className="level-score-badge">
                                              <span className="score-value">
                                                {currentScore}
                                              </span>
                                              <span className="score-label">pts</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="level-buttons">
                                          {['Excellent', 'Good', 'Fair', 'Poor'].map(level => (
                                            <button
                                              key={level}
                                              className={`level-button ${selectedLevel === level ? 'selected' : ''
                                                }`}
                                              onClick={() => {
                                                const updatedGrades = { ...studentGrades };

                                                if (!updatedGrades[gradeKey]) {
                                                  updatedGrades[gradeKey] = { scores: {} };
                                                }

                                                updatedGrades[gradeKey].scores[`r${idx}`] =
                                                  level;

                                                setStudentGrades(updatedGrades);
                                              }}
                                            >
                                              <div className="level-name">{level}</div>
                                              <div className="level-score">
                                                {levelValues[level]}
                                              </div>
                                            </button>
                                          ))}
                                        </div>

                                        <div className="rubric-pos-mapping">
                                          <span className="pos-label">Weighted to:</span>

                                          {pos.map(po => {
                                            const weight = r.poWeights?.[po] || 0;

                                            return (
                                              <div key={po} className="po-mapping-badge">
                                                <span className="po-tag-small">
                                                  PO-{po}
                                                </span>
                                                <span className="po-weight-small">
                                                  {weight}%
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
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
            )}
          </div>
        )}

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
                      !courses.some(c => c.courseName === course.course)
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
"use client";
  function BlockSection({ block, course, masterlist, handleRemoveBlock, handleRemoveStudent, setRenameBlockModal, renameBlockModal, setCourses, courses, showToast }) {
    const [collapsed, setCollapsed] = React.useState(true); // Start collapsed
    return (
      <div className="organized-block-section">
        <div className="block-label-row" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
          <div className="block-label">{block.name}</div>
          <div className="block-student-count">{block.students.length} students</div>
          <div>
            <button
              className="block-collapse-btn"
              tabIndex={-1}
              onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
              title={collapsed ? 'Expand' : 'Collapse'}
              aria-label={collapsed ? 'Expand block' : 'Collapse block'}
            >
              {collapsed ? '▶' : '▼'}
            </button>
            <button className="block-edit-btn" tabIndex={-1} onClick={e => { e.stopPropagation(); setRenameBlockModal({ open: true, courseId: course.id, oldName: block.name, newName: block.name }); }} title="Rename Block">✏️</button>
            <button className="block-delete-btn" tabIndex={-1} onClick={e => { e.stopPropagation(); handleRemoveBlock(course.id, block.name); }} title="Remove Block">🗑️</button>
          </div>
        </div>
        {!collapsed && (
          <div className="organized-students-list-vertical" style={{ background: '#23272b', borderRadius: 10, marginTop: 8, padding: 0 }}>
            {block.students.length > 0 ? (
              <div className="student-vertical-list">
                <div className="student-vertical-header" style={{ background: '#2d3136', color: '#ffe066', fontWeight: 700 }}>
                  <span className="student-id-col">ID Number</span>
                  <span className="student-name-col">Name</span>
                  <span className="student-batch-col">Batch</span>
                  <span className="student-action-col"></span>
                </div>
                {block.students.map(sid => {
                  const student = masterlist.find(stu => stu.id === sid);
                  return student ? (
                    <div key={sid} className="student-vertical-row" style={{ background: '#23272b', color: '#fff', borderBottom: '1px solid #ffe066' }}>
                      <span className="student-id-col">{student.id}</span>
                      <span className="student-name-col" style={{ color: '#fff', fontWeight: 500 }}>{student.name}</span>
                      <span className="student-batch-col">{student.batch || '-'}</span>
                      <span className="student-action-col">
                        <button
                          className="student-remove-btn"
                          title="Remove Student"
                          onClick={() => {
                            if (window.confirm('Remove this student from the block?')) {
                              handleRemoveStudent(course.id, block.name, student.id);
                            }
                          }}
                        >🗑️</button>
                      </span>
                    </div>
                  ) : (
                    <div key={sid} className="student-vertical-row" style={{ background: '#23272b', color: '#fff' }}>
                      <span className="student-id-col">Unknown ({sid})</span>
                      <span className="student-name-col"></span>
                      <span className="student-batch-col"></span>
                      <span className="student-action-col"></span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="empty-blocks">No students</span>
            )}
          </div>
        )}
      </div>
    );
  }



import React, { useState, useEffect } from 'react';
import '../alumni/alumni-globals.css';
import './faculty.css';

const CPE_CURRICULUM = [
    {
        year: "4th Year",
        courses: [
            "COEN 4103 Computer Architecture and Organization (lec)", "COEN 4101 Computer Architecture and Organization (lab)",
            "COEN 4113 Embedded Systems (lec)", "COEN 4111 Embedded Systems (lab)",
            "COEN 4202 CPE Practice and Design 2", "COEN 4123 Digital Signal Processing (lec)",
            "COEN 4121 Digital Signal Processing (lab)", "GECE 2213 GEC Elective 2 (Gender & Society)",
            "COEN 4203 Computer Networks and Security (lec)", "COEN 4201 Computer Networks and Security (lab)",
            "COEN 4211 Seminars and Fieldtrips", "COEN 4212 CPE Laws and Professional Practice",
            "ENSC 4003 Technopreneurship", "GECE 4103 GEC Free Elective 3 (Foreign Language)",
            "HIST 1023 Life and Works of Rizal", "ENSC 2033 Basic Occupational Health and Safety",
            "COEN 4223 Cognate Elective 3 (CISCO 3)"
        ]
    },
    {
        year: "3rd Year",
        courses: [
            "COEN 3103 Logic, Circuit and Design (lec)", "COEN 3101 Logic, Circuit and Design (lab)",
            "COEN 3113 Operating System", "COEN 3123 Intro to Networks, Data and Digital Comm (CISCO 1)",
            "COEN 3133 Methods of Research", "COEN 3143 Feedback and Control System",
            "COEN 3153 Fundamentals of Mixed Signals and Sensors", "COEN 3111 Computer Engineering Drafting and Design",
            "PHIL 1013 Ethics", "COEN 3203 Microprocessors (lec)", "COEN 3201 Microprocessors (lab)",
            "COEN 3211 Introduction to HDL", "COEN 3221 CPE Project Design 1", "COEN 3213 Emerging Technologies in CPE",
            "COEN 3212 Programmable Logic Control, Robotics and Mechatronics Applications", "GECE 2203 GEC Elective 1",
            "COEN 3223 Cognate Elective 2(CISCO 2)", "COEN 3223 On-the-Job Training"
        ]
    },
    {
        year: "2nd Year",
        courses: [
            "ENSC 2021 Computer-Aided Drafting", "ELEN 2123 Fundamentals of Electrical Circuits (lec)",
            "ELEN 2121 Fundamentals of Electrical Circuits (lab)", "MATH 2123 Differential Equations",
            "COEN 2102 Data Structures and Algorithms", "NASC 2063 Physics 2 (lec)", "NASC 2061 Physics 2 (lab)",
            "ENSC 2063 Engineering Economics", "COEN 2112 Fundamentals of Computer Hardware",
            "PFIT 2102 PATHFit 3(Sports and Dance)", "COEN 2203 Numerical Methods", "COEN 2213 Software Design (lec)",
            "COEN 2201 Software Design (lab)", "COEN 2223 Discrete Mathematics",
            "ECEN 2103 Fundamentals of Electronic Engineering (lec)", "ECEN 2101 Fundamentals of Electronic Engineering (lab)",
            "HIST 1013 Reading in Philippine History", "PFIT 2202 PATHFit 4(Team Sports)", "COEN 2233 Cognate Elective 1"
        ]
    },
    {
        year: "1st Year",
        courses: [
            "SOCI 1103 Contemporary World", "MATH 1013 Mathematics in the Modern World",
            "MATH 2033 College and Advanced Algebra", "MATH 2044 Plane & Spherical Trig, Analytic & Solid Geo",
            "COEN 1101 Computer Engineering as Discipline", "COEN 1102 Programming Logic and Design",
            "ENGL 1103 Purposive Communication", "PSYC 1013 Understanding the Self", "PFIT 1102 PATHFIt 1",
            "NSTP 1013 National Service Training Program 1", "HUMA 1013 Art Appreciation",
            "MATH 2074 Differential & Integral Calculus 1", "ENSC 1013 Science, Technology and Society",
            "COEN 1202 Object Oriented Programming", "ENSC 1203 Engineering Data Analysis",
            "NASC 2013 Chemistry for Engineers (lec)", "NASC 2011 Chemistry for Engineers (lab)",
            "PFIT 1202 PATHFit 2", "NSTP 1023 National Service Training Program 2",
            "NASC 2053 Physics 1(lec)", "NASC 2051 Physics 1(lab)", "MATH 2094 Differential & Integral Calculus 2"
        ]
    }
];

const ALL_COURSES = CPE_CURRICULUM.flatMap(year => year.courses);

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
        // Add Course handler
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
      // ...existing code...
    const [dashboardDetail, setDashboardDetail] = useState(null); // null or 'courses' | 'assessments' | 'graded' | 'students'
    // ...existing code...
    // Modal state for renaming block
    const [renameBlockModal, setRenameBlockModal] = useState({ open: false, courseId: '', oldName: '', newName: '' });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [courses, setCourses] = useState([]);
    const [masterlist, setMasterlist] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    
    // Modal states
    const [openModal, setOpenModal] = useState(null);
    const [courseInput, setCourseInput] = useState('');
    const [courseSearchTerm, setCourseSearchTerm] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [selectedCourseForBlock, setSelectedCourseForBlock] = useState('');
    const [blockInput, setBlockInput] = useState('');
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState('');
    const [selectedBlockForStudents, setSelectedBlockForStudents] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [sortBy, setSortBy] = useState('batch-desc');
    const [selectedStudents, setSelectedStudents] = useState({});
    
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

    // Grading states
    const [studentGrades, setStudentGrades] = useState({});
    const [selectedCourseForGrading, setSelectedCourseForGrading] = useState('');
    const [selectedBlockForGrading, setSelectedBlockForGrading] = useState('');
    const [selectedStudentForGrading, setSelectedStudentForGrading] = useState('');
    const [questionScores, setQuestionScores] = useState({});
    const [rubricScores, setRubricScores] = useState({});
    const [gradingView, setGradingView] = useState('list'); // 'list' or 'grade'

    // Compute graded students list and count for dashboard modal (after studentGrades is defined)
    const gradedList = Object.entries(studentGrades).filter(([key, val]) => val.scores);
    const gradedCount = gradedList.length;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.removeAttribute('data-theme');
    } else {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const savedCourses = localStorage.getItem('faculty_courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }

    const savedMasterlist = localStorage.getItem('obe_masterlist') || '[]';
    setMasterlist(JSON.parse(savedMasterlist));
    
    const savedAssessments = localStorage.getItem('faculty_assessments') || '{}';
    setCourseAssessments(JSON.parse(savedAssessments));

    const savedGrades = localStorage.getItem('faculty_grades') || '{}';
    setStudentGrades(JSON.parse(savedGrades));
  }, []);


  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const handleRemoveBlock = (courseId, blockName) => {
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          blocks: c.blocks.filter(b => b.name !== blockName)
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('faculty_courses', JSON.stringify(updatedCourses));

    // If the course now has no blocks, remove its assessments and grades
    const courseAfter = updatedCourses.find(c => c.id === courseId);
    if (courseAfter && courseAfter.blocks.length === 0) {
      // Remove assessment for this course
      const updatedAssessments = { ...courseAssessments };
      delete updatedAssessments[courseId];
      setCourseAssessments(updatedAssessments);
      localStorage.setItem('faculty_assessments', JSON.stringify(updatedAssessments));

      // Remove grades for this course
      const updatedGrades = { ...studentGrades };
      Object.keys(updatedGrades).forEach(key => {
        if (key.startsWith(courseId + '_')) delete updatedGrades[key];
      });
      setStudentGrades(updatedGrades);
      localStorage.setItem('faculty_grades', JSON.stringify(updatedGrades));
    }

    showToast('Block removed');
  };

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
    const grade = studentGrades[gradeKey];
    
    if (!grade || !grade.scores) return null;

    if (assessment.gradingMethod === 'finalExam') {
      // Count correct answers: 100 points per question
      const correctCount = Object.keys(grade.scores).filter(key => 
        key.startsWith('q') && grade.scores[key] === true
      ).length;
      const totalQuestions = assessment.questions.length;
      return totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    } else {
      let totalScore = 0;
      const levelValues = { 'Excellent': 100, 'Good': 85, 'Fair': 70, 'Poor': 50 };
      assessment.rubrics.forEach((r, idx) => {
        const level = grade.scores[`r${idx}`];
        if (level) {
          totalScore += levelValues[level] || 0;
        }
      });
      return Math.round(totalScore / assessment.rubrics.length) || null;
    }
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
      // For final exam: if question is correct, distribute full score weighted by PO
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

  return (
    <div className={`portal-layout faculty-page${isDarkMode ? ' dark' : ' light'}`}> 
      <div className="sidebar">
        <div className="brand">
          <img src="/cpe-logo.png" alt="Logo" className="school-logo-side" />
          <div className="brand-text">
            <h3>Faculty Portal</h3>
            <span>CDM-OBE</span>
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
        </div>
      </div>

      <div className="main-content">
        {toastMessage && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-view">
            <div className="dashboard-hero">
              <div className="hero-content">
                <h1>Welcome back, Faculty</h1>
                <p>Your assessment & grading hub</p>
                <hr className="header-divider" />
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
                        <div className="dashboard-details-title" style={{fontSize:'1.15em',marginBottom:10}}>
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
          <div className="manage-view">
            <div className="alumni-header">
              <div className="profile-ring">
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'rgba(10, 25, 47, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-main)', fontSize: '24px', fontWeight: 'bold'
                }}>
                  ⚙️
                </div>
              </div>
              <div className="header-text">
                <h1>Manage Courses</h1>
                <p className="tab-desc">Add, edit, or remove your courses and blocks</p>
                <hr className="header-divider" />
              </div>
            </div>
            <div className="manage-buttons">
              <button
                onClick={() => setOpenModal('addcourse')}
                className="primary-btn"
              >
                ➕ Add Course
              </button>
              <button
                onClick={() => setOpenModal('addblock')}
                className="outline-btn"
              >
                📦 Add Blocks
              </button>
              <button
                onClick={() => setOpenModal('addstudents')}
                className="outline-btn"
              >
                👥 Add Students
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="manage-courses-organized">
                {courses.map(course => (
                  <div key={course.id} className="organized-course-card">
                    <div className="organized-course-header">
                      <span className="course-title">{course.courseName}</span>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="card-delete-btn"
                        title="Delete Course"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="organized-blocks-list">
                      {course.blocks.length > 0 ? course.blocks.map(block => (
                        <BlockSection
                          key={block.name}
                          block={block}
                          course={course}
                          masterlist={masterlist}
                          handleRemoveBlock={handleRemoveBlock}
                          handleRemoveStudent={handleRemoveStudent}
                          setRenameBlockModal={setRenameBlockModal}
                          renameBlockModal={renameBlockModal}
                          setCourses={setCourses}
                          courses={courses}
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
          <div className="assessment-view">
            <div className="alumni-header">
              <div className="profile-ring">
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'rgba(10, 25, 47, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-main)', fontSize: '24px', fontWeight: 'bold'
                }}>
                  📋
                </div>
              </div>
              <div className="header-text">
                <h1>Assessment Setup</h1>
                <p>Configure Program Outcomes and grading methods for your courses</p>
                <hr className="header-divider" />
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
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.courseName}</option>
                      ))}
                    </select>
                  </div>

                  {courses.length === 0 && (
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
                    <button
                      onClick={() => setAssessmentStep(1)}
                      className="outline-btn"
                    >
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
                      <p className="help-text">Add questions and assign POs with weights (must total 100% per PO)</p>
                      
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
                      <p className="help-text">Create rubric criteria and assign POs with weights (must total 100% per PO)</p>
                      
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
                    <button
                      onClick={() => setAssessmentStep(2)}
                      className="outline-btn"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (!isWeightValid) {
                          const errors = getWeightErrors();
                          showToast(`Weights must total 100% per PO. Issues: ${errors.join(', ')}`);
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

                        // Save assessment
                        const updatedAssessments = {
                          ...courseAssessments,
                          [selectedCourseForAssessment]: {
                            pos: selectedPOs,
                            gradingMethod: gradingMethod,
                            questions: gradingMethod === 'finalExam' ? questions : [],
                            questionPOs: gradingMethod === 'finalExam' ? questionPOs : {},
                            rubrics: gradingMethod === 'rubrics' ? rubrics : [],
                            savedAt: new Date().toISOString()
                          }
                        };
                        setCourseAssessments(updatedAssessments);
                        localStorage.setItem('faculty_assessments', JSON.stringify(updatedAssessments));
                        showToast('Assessment setup saved successfully!');
                        setActiveTab('viewAssessments');
                      }}
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
          <div className="assessment-view">
            <div className="alumni-header">
              <div className="profile-ring">
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'rgba(10, 25, 47, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-main)', fontSize: '24px', fontWeight: 'bold'
                }}>
                  ✓
                </div>
              </div>
              <div className="header-text">
                <h1>Saved Assessments</h1>
                <p>View and manage your completed assessment configurations</p>
                <hr className="header-divider" />
              </div>
            </div>

            <div className="assessment-container">
              {Object.keys(courseAssessments).length > 0 ? (
                <div className="assessments-grid">
                  {Object.entries(courseAssessments).map(([courseId, assessment]) => {
                    const course = courses.find(c => c.id === courseId);
                    if (!course) return null;

                    return (
                      <div key={courseId} className="assessment-card portal-card">
                        <div className="assessment-card-header">
                          <div className="assessment-course-info">
                            <h3>{course.courseName}</h3>
                            <p className="method-badge">
                              {assessment.gradingMethod === 'finalExam' ? '📝 Final Exam' : '📊 Rubrics'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = { ...courseAssessments };
                              delete updated[courseId];
                              setCourseAssessments(updated);
                              localStorage.setItem('faculty_assessments', JSON.stringify(updated));
                              showToast('Assessment deleted');
                            }}
                            className="delete-btn"
                            title="Delete assessment"
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="assessment-details">
                          <div className="detail-section">
                            <h4>Program Outcomes</h4>
                            <div className="pos-display">
                              {assessment.pos.map(po => (
                                <span key={po} className="po-tag">PO-{po}</span>
                              ))}
                            </div>
                          </div>

                          {assessment.gradingMethod === 'finalExam' ? (
                            <div className="detail-section">
                              <h4>Questions ({assessment.questions.length})</h4>
                              <div className="questions-summary">
                                {assessment.questions.slice(0, 2).map((q, idx) => (
                                  <div key={idx} className="question-summary">
                                    <span className="q-num">Q{idx + 1}:</span>
                                    <span className="q-text">{q.text}</span>
                                  </div>
                                ))}
                                {assessment.questions.length > 2 && (
                                  <div className="more-questions">+{assessment.questions.length - 2} more questions</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="detail-section">
                              <h4>Rubric Criteria ({assessment.rubrics.length})</h4>
                              <div className="rubrics-summary">
                                {assessment.rubrics.slice(0, 2).map((r, idx) => (
                                  <div key={idx} className="rubric-summary">
                                    {r.name}
                                  </div>
                                ))}
                                {assessment.rubrics.length > 2 && (
                                  <div className="more-rubrics">+{assessment.rubrics.length - 2} more criteria</div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="detail-section">
                            <h4>PO Weight Distribution</h4>
                            <div className="weights-display">
                              {assessment.pos.map(po => {
                                let total = 0;
                                if (assessment.gradingMethod === 'finalExam') {
                                  assessment.questions.forEach((q, idx) => {
                                    total += (assessment.questionPOs[`${idx}-${po}`] || 0);
                                  });
                                } else {
                                  assessment.rubrics.forEach(r => {
                                    total += (r.poWeights?.[po] || 0);
                                  });
                                }
                                return (
                                  <div key={po} className="weight-row">
                                    <span className="po-label">PO-{po}:</span>
                                    <div className="weight-bar">
                                      <div className="weight-fill" style={{ width: `${total}%` }}></div>
                                    </div>
                                    <span className="weight-value">{total}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="assessment-actions">
                            <button
                              onClick={() => {
                                setSelectedCourseForAssessment(courseId);
                                const existing = courseAssessments[courseId];
                                setSelectedPOs(existing.pos);
                                setGradingMethod(existing.gradingMethod);
                                if (existing.gradingMethod === 'finalExam') {
                                  setQuestions(existing.questions);
                                  setQuestionPOs(existing.questionPOs);
                                } else {
                                  setRubrics(existing.rubrics);
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

                        {assessment.savedAt && (
                          <div className="assessment-meta">
                            Last updated: {new Date(assessment.savedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="assessment-empty-card">
                    <div className="assessment-empty-icon">📝</div>
                    <div className="assessment-empty-title">No Assessments Yet</div>
                    <div className="assessment-empty-sub">Get started by setting up your first assessment for your course.<br/>Assessments help track student outcomes and progress!</div>
                    <button
                      onClick={() => setActiveTab('assessment')}
                      className="primary-btn assessment-setup-btn"
                    >
                      <span className="assessment-btn-icon">➕</span> Start Assessment Setup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grading' && (
          <div className="grading-view">
            <div className="alumni-header">
              <div className="profile-ring">
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'rgba(10, 25, 47, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-main)', fontSize: '24px', fontWeight: 'bold'
                }}>
                  ⭐
                </div>
              </div>
              <div className="header-text">
                <h1>Grade Students</h1>
                <p>Evaluate student performance based on assessments</p>
                <hr className="header-divider" />
              </div>
            </div>

            {gradingView === 'list' ? (
              <div className="grading-selector">
                <hr className="header-divider" />
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
                    {courses.filter(c => courseAssessments[c.id]).map(c => (
                      <option key={c.id} value={c.id}>{c.courseName}</option>
                    ))}
                  </select>
                  {courses.filter(c => courseAssessments[c.id]).length === 0 && (
                    <p className="help-text">No courses with assessments available. Create assessments first.</p>
                  )}
                </div>

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
                      {courses.find(c => c.id === selectedCourseForGrading)?.blocks.map((b, idx) => (
                        <option key={idx} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCourseForGrading && selectedBlockForGrading && (
                  <div className="students-grading-list">
                    <h3>Students in {selectedBlockForGrading}</h3>
                    <div className="student-list-grading">
                      {courses
                        .find(c => c.id === selectedCourseForGrading)
                        ?.blocks.find(b => b.name === selectedBlockForGrading)
                        ?.students.map(studentId => {
                          const student = masterlist.find(s => s.id === studentId);
                          if (!student) return null;

                          const assessment = courseAssessments[selectedCourseForGrading];
                          const grade = calculateStudentGrade(studentId, selectedCourseForGrading, assessment);
                          const gradeNumber = grade ? Math.round(grade) : null;
                          const gradeColor = gradeNumber ? (gradeNumber >= 75 ? '#10b981' : gradeNumber >= 60 ? '#f59e0b' : '#ef4444') : '#94a3b8';

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
                                <h4>{student.name}</h4>
                                <p>{student.id}</p>
                              </div>
                              <div className="student-grade-display" style={{ borderColor: gradeColor }}>
                                {gradeNumber !== null ? (
                                  <>
                                    <div className="grade-circle" style={{ background: gradeColor }}>
                                      {gradeNumber}
                                    </div>
                                    <span className="grade-label">Grade</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="grade-circle" style={{ background: gradeColor }}>
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
                                {calculateStudentGrade(selectedStudentForGrading, selectedCourseForGrading, assessment) !== null ? (
                                  <div className="preview-grade">
                                    <span className="preview-label">Current Grade:</span>
                                    <span className="preview-value">{Math.round(calculateStudentGrade(selectedStudentForGrading, selectedCourseForGrading, assessment))}/100</span>
                                  </div>
                                ) : (
                                  <div className="preview-grade">
                                    <span className="preview-label">Status:</span>
                                    <span className="preview-value">Not Graded</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <hr className="header-divider" />
                          </div>

                          {assessment.gradingMethod === 'finalExam' ? (
                            <div className="grading-content">
                              <h3>Final Exam - Mark Questions</h3>
                              <p className="grading-subtitle">Check off questions the student answered correctly</p>
                              <div className="questions-checklist">
                                {assessment.questions.map((q, idx) => {
                                  const isCorrect = currentGrade?.scores?.[`q${idx}`] === true;
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
                                            updatedGrades[gradeKey].scores[`q${idx}`] = !isCorrect;
                                            setStudentGrades(updatedGrades);
                                          }}
                                        >
                                          {isCorrect ? '✓' : ''}
                                        </button>
                                        <div className="question-text">
                                          <span className="q-num">Q{idx + 1}</span>
                                          <span className="q-content">{q.text}</span>
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
                              <div className="exam-summary">
                                <h4>Answer Summary</h4>
                                <div className="summary-stats">
                                  <div className="stat-item correct">
                                    <span className="stat-value">
                                      {Object.keys(currentGrade?.scores || {}).filter(k => k.startsWith('q') && currentGrade?.scores?.[k] === true).length}
                                    </span>
                                    <span className="stat-label">Correct</span>
                                  </div>
                                  <div className="stat-item total">
                                    <span className="stat-value">{assessment.questions.length}</span>
                                    <span className="stat-label">Total</span>
                                  </div>
                                  <div className="stat-item score">
                                    <span className="stat-value">
                                      {Math.round(
                                        (Object.keys(currentGrade?.scores || {}).filter(k => k.startsWith('q') && currentGrade?.scores?.[k] === true).length / assessment.questions.length) * 100
                                      )}%
                                    </span>
                                    <span className="stat-label">Score</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grading-content">
                              <h3>Rubrics Assessment</h3>
                              <div className="rubrics-grading">
                                {assessment.rubrics.map((r, idx) => {
                                  const selectedLevel = currentGrade?.scores?.[`r${idx}`];
                                  const levelValues = { 'Excellent': 100, 'Good': 85, 'Fair': 70, 'Poor': 50 };
                                  const currentScore = levelValues[selectedLevel] || 0;

                                  return (
                                    <div key={idx} className="rubric-card">
                                      <div className="rubric-card-header">
                                        <h4>{r.name}</h4>
                                        {selectedLevel && (
                                          <div className="level-score-badge">
                                            <span className="score-value">{currentScore}</span>
                                            <span className="score-label">pts</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="level-buttons">
                                        {['Excellent', 'Good', 'Fair', 'Poor'].map(level => (
                                          <button
                                            key={level}
                                            className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
                                            onClick={() => {
                                              const updatedGrades = { ...studentGrades };
                                              if (!updatedGrades[gradeKey]) {
                                                updatedGrades[gradeKey] = { scores: {} };
                                              }
                                              updatedGrades[gradeKey].scores[`r${idx}`] = level;
                                              setStudentGrades(updatedGrades);
                                            }}
                                          >
                                            <div className="level-icon">
                                              {level === 'Excellent' && '⭐'}
                                              {level === 'Good' && '✓'}
                                              {level === 'Fair' && '→'}
                                              {level === 'Poor' && '✗'}
                                            </div>
                                            <div className="level-name">{level}</div>
                                            <div className="level-score">{levelValues[level]}</div>
                                          </button>
                                        ))}
                                      </div>

                                      <div className="rubric-description">
                                        {selectedLevel === 'Excellent' && <p>Exceptional work demonstrating mastery of the criteria</p>}
                                        {selectedLevel === 'Good' && <p>Solid performance meeting the criteria effectively</p>}
                                        {selectedLevel === 'Fair' && <p>Adequate performance with some gaps in the criteria</p>}
                                        {selectedLevel === 'Poor' && <p>Below expectations, needs significant improvement</p>}
                                        {!selectedLevel && <p className="empty-desc">Select a level above</p>}
                                      </div>

                                      <div className="rubric-pos-mapping">
                                        <span className="pos-label">Weighted to:</span>
                                        {assessment.pos.map(po => {
                                          const weight = r.poWeights?.[po] || 0;
                                          return (
                                            <div key={po} className="po-mapping-badge">
                                              <span className="po-tag-small">PO-{po}</span>
                                              <span className="po-weight-small">{weight}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="grading-po-breakdown">
                            <h3>Program Outcome Scores</h3>
                            <div className="po-scores">
                              {assessment.pos.map(po => {
                                const poScore = getPoScores(selectedStudentForGrading, selectedCourseForGrading, assessment)[po];
                                return (
                                  <div key={po} className="po-score-card">
                                    <div className="po-score-header">
                                      <span className="po-badge">PO-{po}</span>
                                    </div>
                                    <div className="po-score-bar">
                                      <div className="po-score-fill" style={{ width: `${Math.round(poScore)}%` }}></div>
                                    </div>
                                    <div className="po-score-value">{Math.round(poScore)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grading-actions">
                            <button
                              onClick={() => {
                                const updatedGrades = { ...studentGrades };
                                updatedGrades[gradeKey] = {
                                  ...updatedGrades[gradeKey],
                                  scores: currentGrade?.scores || {},
                                  savedAt: new Date().toISOString()
                                };
                                setStudentGrades(updatedGrades);
                                localStorage.setItem('faculty_grades', JSON.stringify(updatedGrades));
                                showToast('Grades saved successfully!');
                                setGradingView('list');
                                setSelectedStudentForGrading('');
                              }}
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
              </div>

              {showCourseDropdown && !courseInput ? (
                <div className="courses-dropdown">
                  {(() => {
                    const filteredCourses = ALL_COURSES.filter(course => 
                      course.toLowerCase().includes(courseSearchTerm.toLowerCase()) &&
                      !courses.some(c => c.courseName === course)
                    );
                    return filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <button
                          key={course}
                          className="dropdown-item"
                          onClick={() => {
                            setCourseInput(course);
                            setCourseSearchTerm(course);
                            setShowCourseDropdown(false);
                          }}
                        >
                          {course}
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
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} ({c.blocks.length}/2)
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
          }}>
            <div className="modal-box portal-card modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>👥 Add Students</h2>
                <button className="close-btn" onClick={() => {
                  setOpenModal(null);
                  setSearchTerm('');
                  setSelectedBatch('');
                  setSortBy('batch-desc');
                }}>✕</button>
              </div>
              
              <div className="form-group">
                <label>Select Course</label>
                <select
                  value={selectedCourseForStudents}
                  onChange={(e) => {
                    setSelectedCourseForStudents(e.target.value);
                    setSelectedBlockForStudents('');
                  }}
                  className="form-input"
                >
                  <option value="">Choose a course...</option>
                  {courses.filter(c => c.blocks.length > 0).map(c => (
                    <option key={c.id} value={c.id}>{c.courseName}</option>
                  ))}
                </select>
              </div>

              {selectedCourseForStudents && (
                <div className="form-group">
                  <label>Select Block</label>
                  <select
                    value={selectedBlockForStudents}
                    onChange={(e) => setSelectedBlockForStudents(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Choose a block...</option>
                    {courses.find(c => c.id === selectedCourseForStudents)?.blocks.map((b, idx) => (
                      <option key={idx} value={b.name}>{b.name}</option>
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
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />

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

                {Object.keys(selectedStudents).filter(id => selectedStudents[id]).length > 0 && (
                  <div className="selected-students-chips">
                    {Object.keys(selectedStudents).filter(id => selectedStudents[id]).map(studentId => {
                      const student = masterlist.find(s => s.id === studentId);
                      return student ? (
                        <div key={studentId} className="student-chip-selection">
                          <span>{student.name}</span>
                          <button 
                            onClick={() => {
                              setSelectedStudents(prev => ({
                                ...prev,
                                [studentId]: false
                              }));
                            }}
                            className="chip-remove"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
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
                          {studentsByBatch[batch].map(student => (
                            <button
                              key={student.id}
                              className={`student-card ${selectedStudents[student.id] ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedStudents(prev => ({
                                  ...prev,
                                  [student.id]: !prev[student.id]
                                }));
                              }}
                            >
                              <div className="card-content">
                                <div className="student-name">{student.name}</div>
                                <div className="student-id">{student.id}</div>
                              </div>
                              <div className="card-check">{selectedStudents[student.id] ? '✓' : ''}</div>
                            </button>
                          ))}
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
                }} className="outline-btn">Cancel</button>
                <button onClick={handleAddStudents} className="primary-btn">Add Students</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
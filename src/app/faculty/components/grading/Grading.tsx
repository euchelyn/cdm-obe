// Grading.jsx
import { useEffect, useState } from 'react';
import { getAllStudentAssessments, getAllGrades as getGradesFromTable, getQuestionResults, getRubricResults } from '@/services/assessmentService';
import { createStudentAssessment } from '@/services/assessmentService';
import { updateQuestionResult } from '@/services/assessmentService';
import { createQuestionResult } from '@/services/assessmentService';
import { updateRubricResult } from '@/services/assessmentService';
import { createRubricResult } from '@/services/assessmentService';
import { createGrade } from '@/services/facultyService';
import { updateGrade } from '@/services/facultyService';

import GradingList from './GradingList';

export default function Grading({
  activeTab,
  masterlist,
  courseAssessments,
  assessments,
  facultyCourses,
  currentUser,
  showToast
}) {
  const [studentGrades, setStudentGrades] = useState({});
  const [selectedCourseForGrading, setSelectedCourseForGrading] = useState('');
  const [selectedBlockForGrading, setSelectedBlockForGrading] = useState('');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState('');
  const [questionScores, setQuestionScores] = useState({});
  const [rubricScores, setRubricScores] = useState({});
  const [gradingView, setGradingView] = useState('list');

  // ✅ fetchGradesFromDB lives HERE — sets local studentGrades state
  const fetchGradesFromDB = async () => {
    try {
      if (!assessments?.length || !facultyCourses?.length) return;

      const facultyAssessments = assessments.filter(
        a => a.created_by?.toString() === currentUser?.link?.roleAccount?._id?.toString()
      );

      if (!facultyAssessments.length) return;

      const gradesMap = {};

      for (const assessment of facultyAssessments) {
        const isFinalExam = assessment.type === 'final_exam';
        const questions = assessment.questions || [];
        const rubrics = assessment.rubrics || [];

        const submissions = await getAllStudentAssessments({
          assessment_id: assessment._id,
        });

        for (const submission of submissions) {
          const studentAssessmentId = submission._id;
          const studentId = submission.student_id;

          const fc = facultyCourses.find(
            fc => fc._id?.toString() === assessment.faculty_course_id?.toString()
          );

          if (!fc) continue;

          const gradeKey = `${fc._id}_${studentId}`;

          const grades = await getGradesFromTable({
            student_assessment_id: studentAssessmentId,
          });

          if (!grades.length) continue;

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
              if (result?.level) scores[`r${idx}`] = result.level;
            });
          }

          gradesMap[gradeKey] = {
            scores,
            overall_grade: grade.overall_grade,
            savedAt: grade.submitted_at,
            grade_id: grade._id,
            student_assessment_id: studentAssessmentId,
          };
        }
      }

      setStudentGrades(gradesMap);
    } catch (e) {
      console.error('fetchGradesFromDB error:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'grading' && assessments.length > 0 && facultyCourses.length > 0) {
      fetchGradesFromDB();
    }
  }, [activeTab, assessments, facultyCourses]);

  // ✅ handleSaveGrades also needs to be here or passed in
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

      console.log('🔍 DEBUG handleSaveGrades - All IDs:');
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

      console.log('🔍 DEBUG handleSaveGrades - Assessment:');
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

      console.log('🔍 DEBUG handleSaveGrades - studentAssessmentId:', studentAssessmentId);

      // ─────────────────────────────────────────────────────────────
      // STEP 3: SAVE QUESTION RESULTS (Final Exam)
      // ─────────────────────────────────────────────────────────────

      console.log('🔍 DEBUG handleSaveGrades - questionScores:', questionScores);
      console.log('🔍 DEBUG handleSaveGrades - isFinalExam:', isFinalExam);
      console.log('🔍 DEBUG handleSaveGrades - questions.length:', questions.length);

      if (isFinalExam && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];

          const isCorrect = questionScores[`q${i}`] === true;

          console.log('🔍 DEBUG - Question', i, ':', question._id, 'isCorrect:', isCorrect);

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
            console.log('🔍 DEBUG - Updating question result:', existingResult._id);
            await updateQuestionResult(existingResult._id, isCorrect);
          } else {
            console.log('🔍 DEBUG - Creating new question result');
            await createQuestionResult(payload);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 3b: SAVE RUBRIC RESULTS (Rubrics)
      // ─────────────────────────────────────────────────────────────

      console.log('🔍 DEBUG handleSaveGrades - rubricScores:', rubricScores);
      console.log('🔍 DEBUG handleSaveGrades - isFinalExam:', isFinalExam);
      console.log('🔍 DEBUG handleSaveGrades - rubrics.length:', rubrics.length);

      if (!isFinalExam && rubrics.length > 0) {
        for (let i = 0; i < rubrics.length; i++) {
          const rubric = rubrics[i];
          const level = rubricScores[`r${i}`];
          
          // ✅ Convert level to lowercase!
          const levelLower = level?.toLowerCase();

          console.log('🔍 DEBUG - Rubric', i, ':', rubric._id);
          console.log('🔍 DEBUG - Rubric', i, 'level:', level);
          console.log('🔍 DEBUG - Rubric', i, 'levelLower:', levelLower);

          if (!level) {
            console.log('🔍 DEBUG - Skipping rubric', i, '- no level selected');
            continue;
          }

          const existingResults = await getRubricResults(studentAssessmentId);
          console.log('🔍 DEBUG - existingResults:', existingResults);

          const existingResult = existingResults.results?.find(
            (r) => String(r.rubric?._id) === String(rubric._id)
          );

          console.log('🔍 DEBUG - existingResult:', existingResult);

          const payload = {
            student_assessment_id: studentAssessmentId,
            rubric_id: rubric._id,
            level: levelLower,  // ✅ Use lowercase!
          };

          console.log('🔍 DEBUG - payload:', payload);

          if (existingResult) {
            console.log('🔍 DEBUG - Updating rubric result:', existingResult._id);
            await updateRubricResult(existingResult._id, levelLower);  // ✅ Use lowercase!
          } else {
            console.log('🔍 DEBUG - Creating new rubric result');
            await createRubricResult(payload);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 4: CALCULATE & SAVE GRADE
      // ─────────────────────────────────────────────────────────────

      const gradeKey = `${courseId}_${studentId}`;

      let totalScore = 0;
      let totalItems = 0;

      if (isFinalExam) {
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

      let overallGrade;
      if (percentage >= 75) overallGrade = 1.0;
      else if (percentage >= 60) overallGrade = 2.5;
      else if (percentage >= 50) overallGrade = 3.5;
      else overallGrade = 5.0;

      const remarks = overallGrade <= 3.0 ? 'PASSED' : 'FAILED';

      const existingGrades = await getGradesFromTable({
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

      await fetchGradesFromDB();
      window.dispatchEvent(new Event('grades-updated'));
    } catch (error) {
      showToast(error.message || 'Failed to save grades');
      console.error('handleSaveGrades error:', error);
    }
  };

  const getPoScores = (student, course, assessment) => {
    console.log('PO SCORES');
    return {};
  };

  return (
    <>
      {activeTab === 'grading' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="pc-header" style={{ marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Grade Students</h1>
              <p style={{ color: 'var(--text-sub)' }}>Evaluate student performance based on assessments</p>
            </div>
          </div>
          <GradingList
            gradingView={gradingView}
            setGradingView={setGradingView}
            selectedCourseForGrading={selectedCourseForGrading}
            setSelectedCourseForGrading={setSelectedCourseForGrading}
            selectedBlockForGrading={selectedBlockForGrading}
            setSelectedBlockForGrading={setSelectedBlockForGrading}
            setSelectedStudentForGrading={setSelectedStudentForGrading}
            setQuestionScores={setQuestionScores}
            setRubricScores={setRubricScores}
            facultyCourses={facultyCourses}
            masterlist={masterlist}
            studentGrades={studentGrades}
            setStudentGrades={setStudentGrades}
            assessments={assessments}
            handleSaveGrades={handleSaveGrades}
            courseAssessment={courseAssessments}
            getPoScores={getPoScores}
            questionScores={questionScores}
            rubricScores={rubricScores}
          />
        </div>
      )}
    </>
  );
}
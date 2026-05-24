import { useState } from "react";

//======================================
// COMPONENTS
//======================================
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Assessments({
    currentUser,
    assessmentStep, setAssessmentStep,
    activeTab, setActiveTab,
    facultyCourses,
    fetchFacultyData,
    questions, setQuestions,
    questionPOs, setQuestionPOs,
    currentQuestion, setCurrentQuestion,
    rubrics, setRubrics,
    rubricName, setRubricName,
    selectedCourseForAssessment,
    setSelectedCourseForAssessment,
    courseAssessments,
    selectPOs, setSelectPOs,
    gradingMethod, setGradingMethod,
    showToast
}) {

    return(
        <>
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

                    <StepOne 
                        assessmentStep={assessmentStep}
                        setAssessmentStep={setAssessmentStep}
                        facultyCourses={facultyCourses}
                        selectedCourseForAssessment={selectedCourseForAssessment}
                        setSelectedCourseForAssessment={setSelectedCourseForAssessment}
                        courseAssessments={courseAssessments}
                        setSelectedPOs={setSelectPOs}
                        setGradingMethod={setGradingMethod}

                    />

                    <StepTwo 
                        assessmentStep={assessmentStep}
                        selectedCourseForAssessment={selectedCourseForAssessment}
                        selectedPOs={selectPOs}
                        setSelectedPOs={setSelectPOs}
                        gradingMethod={gradingMethod}
                        setGradingMethod={setGradingMethod}
                        setAssessmentStep={setAssessmentStep}
                        showToast={showToast}
                    />

                    <StepThree 
                        currentUser={currentUser}
                        setActiveTab={setActiveTab}
                        fetchFacultyData={fetchFacultyData}
                        assessmentStep={assessmentStep}
                        setAssessmentStep={setAssessmentStep}
                        selectedCourseForAssessment={selectedCourseForAssessment}
                        setSelectedCourseForAssessment={setSelectedCourseForAssessment}
                        gradingMethod={gradingMethod}
                        setGradingMethod={setGradingMethod}
                        selectedPOs={selectPOs}
                        setSelectedPOs={setSelectPOs}
                        questionPOs={questionPOs}
                        setQuestionPOs={setQuestionPOs}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        showToast={showToast}
                        rubrics={rubrics}
                        setRubrics={setRubrics}
                        rubricName={rubricName}
                        setRubricName={setRubricName}
                    />
                    </div>
                </div>
            )}
        </>
    )
}
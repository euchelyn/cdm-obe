//========================================
// COMPONENTS
//========================================
import { deleteAssessment } from "@/services/assessmentService";

export default function ViewAssessment({
    activeTab, setActiveTab,
    assessments, setAssessments,
    ALL_COURSES,
    setSelectedCourseForAssessment,
    setSelectedPOs,
    setGradingMethod,
    setQuestions,
    setQuestionPOs,
    setRubrics,
    setAssessmentStep,
    showToast,
}) {

    return(
        <>
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
        </>
    )
}
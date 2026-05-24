import { useState, useEffect } from "react";

//==================================
// SERVICES
//==================================
import { 
    createAssessment,
    createQuestion,
    createRubric,
    getQuestionsByAssessmentId,
} from "@/services/assessmentService";


export default function StepThree({
    currentUser,
    setActiveTab,
    fetchFacultyData,
    assessmentStep, setAssessmentStep,
    selectedCourseForAssessment, setSelectedCourseForAssessment,
    gradingMethod, setGradingMethod,
    selectedPOs, setSelectedPOs,
    questionPOs, setQuestionPOs,
    currentQuestion, setCurrentQuestion,
    showToast,
    rubrics, setRubrics,
    rubricName, setRubricName
}) {

    useEffect(() => {
    if (!selectedCourseForAssessment) return;

    getQuestions();

        console.log("Questions", questions);
    }, [selectedCourseForAssessment]);

    const [questions, setQuestions] = useState([]);

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

    const getWeightErrors = () => {
        const errors = [];
        Object.entries(poWeightTotals).forEach(([po, total]) => {
        if (total !== 100) {
            errors.push(`PO-${po}: ${total}%`);
        }
        });
        return errors;
    };

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

        console.log(currentUser)
        
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

    const poWeightTotals = getPoWeightTotals();
    const isWeightValid = Object.values(poWeightTotals).every(total => total === 100);

    const getQuestions = async () => {
    try {
        const res = await getQuestionsByAssessmentId(selectedCourseForAssessment);
        setQuestions(res.questions || []);
    } catch (err: any) {
        console.error(err);
        showToast(err.message);
    }
    };

    console.log("Questions", questions);

    return(
        <>
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
        </>
    )
}
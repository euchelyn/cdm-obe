//====================================
// CONCEPT
//====================================
import { PO_LIST } from "../../constants/constants";


export default function StepTwo({
    assessmentStep,
    selectedCourseForAssessment,
    selectedPOs, setSelectedPOs,
    gradingMethod, setGradingMethod,
    setAssessmentStep,
    showToast
}) {

    return(
        <>
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
        </>
    )
}
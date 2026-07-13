import { useState, useEffect } from "react";
import { PO_DEFINITIONS } from "@/shared/constants/constants";
import BackToSurvey from "./BackToSurvey";
import MainMenu from "./MainMenu";
import SurveyTopMenu from "./SurveyTopMenu";
import Respondents from "./Respondents";
import SurveyDetailCard from "./SurveyDetailCard";
import POQuestionCard from "./POQuestionCard";

//================================================
// SERVICES
//================================================
import { 
    createSurvey,
    updateSurvey,
    getSurveysByVersion
} from "@/services/surveyServices";

const EMPTY_SURVEY = {
    version: "2024",
    type: "",
    title: "",
    description: "",
    questions: {},
};

export default function Indirect({
    selectedSurveyView, setSelectedSurveyView,
    surveySubTab, setSurveySubTab,
    surveyDetailBatch, setSurveyDetailBatch,
    surveyDetailStudents,
    openSurveyModal,
    tracerRate,
    poRate,
    showToast
}) {


    // ─── Map type to view key ─────────────────────────────────────────────────────
    const TYPE_TO_VIEW: Record<string, string> = {
        'so_survey':       '1stYear',
        'graduate_survey': '3to5Year',
        'tracer_study':    'gts',
    };

    // ─── Store DB ids so we know whether to POST or PUT ──────────────────────────
    const [surveyIds, setSurveyIds] = useState<Record<string, string | null>>({
        '1stYear':  null,
        '3to5Year': null,
        'gts':      null,
    });

const [currentVersion, setCurrentVersion] = useState('2024');
const CURRENT_VERSION = new Date().getFullYear().toString();

useEffect(() => {
    const loadSurveys = async () => {
        try {
            // 1. FORCE FULL RESET FIRST (this is key)
            const freshPayload = {
                '1stYear': { ...EMPTY_SURVEY, type: 'so_survey', version: currentVersion },
                '3to5Year': { ...EMPTY_SURVEY, type: 'graduate_survey', version: currentVersion },
                'gts': { ...EMPTY_SURVEY, type: 'tracer_study', version: currentVersion },
            };

            const freshIds = {
                '1stYear': null,
                '3to5Year': null,
                'gts': null,
            };

            setSurveyPayload(freshPayload);
            setSurveyIds(freshIds);
            setActiveQuestionId(null);
            setHoveredQuestionId(null);

            // 2. FETCH NEW DATA
            const results = await getSurveysByVersion(currentVersion);

            if (results?.length) {
                const updatedPayload = { ...freshPayload };
                const updatedIds = { ...freshIds };

                results.forEach((survey) => {
                    const view = TYPE_TO_VIEW[survey.type];
                    if (!view) return;

                    updatedPayload[view] = {
                        version: survey.version,
                        type: survey.type,
                        title: survey.title || "",
                        description: survey.description || "",
                        questions: survey.questions || {},
                    };

                    updatedIds[view] = survey._id;
                });

                setSurveyPayload(updatedPayload);
                setSurveyIds(updatedIds);
            }

        } catch (e) {
            console.error("Failed to load surveys:", e);
        }
    };

    loadSurveys();
}, [currentVersion]);
// ─── Save: POST if new, PUT if exists ────────────────────────────────────────
const saveFromDatabase = async () => {
    try {
        const existingId = surveyIds[selectedSurveyView];

        if (existingId) {
            await updateSurvey(existingId, {
                version:     activeSurvey.version,
                type:        activeSurvey.type,
                title:       activeSurvey.title,
                description: activeSurvey.description,
                questions:   activeSurvey.questions,
            });
            showToast('Survey updated successfully!', 'success');
        } else {
            const result = await createSurvey({
                version:     activeSurvey.version,
                type:        activeSurvey.type,
                title:       activeSurvey.title,
                description: activeSurvey.description,
                questions:   activeSurvey.questions,
            });
            // store the new id so next save will PUT
            setSurveyIds((prev) => ({
                ...prev,
                [selectedSurveyView]: result.id,
            }));
            showToast('Survey saved successfully!', 'success');
        }
    } catch (e: any) {
        showToast(`Failed to save survey: ${e.message}`, 'error');
    }
};

    // ─── Single state object keyed by view ────────────────────────────────────
    const [surveyPayload, setSurveyPayload] = useState({
        '1stYear':  { ...EMPTY_SURVEY, type: 'so_survey' },
        '3to5Year': { ...EMPTY_SURVEY, type: 'graduate_survey' },
        'gts':      { ...EMPTY_SURVEY, type: 'tracer_study' },
    });

    const activeSurvey = surveyPayload[selectedSurveyView] ?? { ...EMPTY_SURVEY };
    const questions = Object.values(activeSurvey.questions);

    const setActiveSurvey = (updater) => {
        setSurveyPayload((prev) => {
            const current = prev[selectedSurveyView] ?? { ...EMPTY_SURVEY };
            return {
                ...prev,
                [selectedSurveyView]: typeof updater === 'function'
                    ? updater(current)
                    : updater,
            };
        });
    };
    // ─────────────────────────────────────────────────────────────────────────

    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [hoveredQuestionId, setHoveredQuestionId] = useState(null);

    const addQuestion = () => {
        const existingNumbers = Object.keys(activeSurvey.questions)
            .map((id) => {
                const match = id.match(/^q(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            });

        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        const newId = `q${nextNumber}`;

        const newQuestion = {
            id: newId,
            poId: null,
            type: "likert",
            text: "Untitled Question",
            options: ["Option 1"],
            weight: 0,
        };

        setActiveSurvey((prev) => ({
            ...prev,
            questions: { ...prev.questions, [newId]: newQuestion },
        }));

        setActiveQuestionId(newId);
    };

    const updateQuestion = (id, key, value) => {
        setActiveSurvey((prev) => {
            const question = prev.questions[id];
            if (!question) return prev;

            const updated = { ...question, [key]: value };

            if (key === "type" && ["radio", "checkbox", "dropdown"].includes(value) && (!updated.options || updated.options.length === 0)) {
                updated.options = ["Option 1"];
            }

            return { ...prev, questions: { ...prev.questions, [id]: updated } };
        });
    };

    const deleteQuestion = (id) => {
        setActiveSurvey((prev) => {
            const updated = { ...prev.questions };
            delete updated[id];
            return { ...prev, questions: updated };
        });
        setActiveQuestionId((prev) => (prev === id ? null : prev));
    };

    const handleOptionTextChange = (questionId, optionIndex, value) => {
        setActiveSurvey((prev) => {
            const question = prev.questions[questionId];
            if (!question) return prev;
            const options = [...(question.options || [])];
            options[optionIndex] = value;
            return { ...prev, questions: { ...prev.questions, [questionId]: { ...question, options } } };
        });
    };

    const handleAddOption = (questionId) => {
        setActiveSurvey((prev) => {
            const question = prev.questions[questionId];
            if (!question) return prev;
            return {
                ...prev,
                questions: {
                    ...prev.questions,
                    [questionId]: { ...question, options: [...(question.options || []), "New Option"] },
                },
            };
        });
    };

    const handleRemoveOption = (questionId, optionIndex) => {
        setActiveSurvey((prev) => {
            const question = prev.questions[questionId];
            if (!question) return prev;
            const options = [...(question.options || [])];
            options.splice(optionIndex, 1);
            return { ...prev, questions: { ...prev.questions, [questionId]: { ...question, options } } };
        });
    };

    return (
        <>
            <div style={{ animation: 'fadeIn 0.3s ease' }}>

                <div className="pc-header" style={{ marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Indirect Assessment</h1>
                        <p style={{ color: 'var(--text-sub)' }}>Manage survey deployments and build custom questionnaires.</p>
                    </div>
                </div>

                {!selectedSurveyView ? (
                    <MainMenu
                        setSelectedSurveyView={setSelectedSurveyView}
                        setSurveySubTab={setSurveySubTab}
                        tracerRate={tracerRate}
                        poRate={poRate}
                    />
                ) : (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>

                        <BackToSurvey
                            selectedSurveyView={selectedSurveyView}
                            setSelectedSurveyView={setSelectedSurveyView}
                        />

                        <SurveyTopMenu
                            surveySubTab={surveySubTab}
                            setSurveySubTab={setSurveySubTab}
                        />

                        {surveySubTab === 'respondents' && (
                            <Respondents
                                surveyDetailBatch={surveyDetailBatch}
                                setSurveyDetailBatch={setSurveyDetailBatch}
                                surveyDetailStudents={surveyDetailStudents}
                                selectedSurveyView={selectedSurveyView}
                                openSurveyModal={openSurveyModal}
                            />
                        )}

                        {surveySubTab === 'builder' && (
                            <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                <div style={{ width: '35%', position: 'sticky', top: '0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <SurveyDetailCard
                                        surveyPayload={activeSurvey}
                                        setSurveyPayload={setActiveSurvey}
                                        saveFormToDatabase={saveFromDatabase}
                                        setCurrentVersion={setCurrentVersion}
                                    />
                                </div>

                                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '100px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>Survey Questions</h2>
                                        <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>{questions.length} Items</span>
                                    </div>

                                    {selectedSurveyView === '1stYear' ? (
                                        <POQuestionCard
                                            surveyPayload={activeSurvey}
                                            setSurveyPayload={setActiveSurvey}
                                        />
                                    ) : (
                                        <>
                                            {questions.map((q, index) => {
                                                const isActive = activeQuestionId === q.id;
                                                const isHovered = hoveredQuestionId === q.id;

                                                return (
                                                    <div
                                                        key={q.id}
                                                        className="portal-card"
                                                        onMouseEnter={() => setHoveredQuestionId(q.id)}
                                                        onMouseLeave={() => setHoveredQuestionId(null)}
                                                        onClick={() => setActiveQuestionId(q.id)}
                                                        style={{
                                                            padding: '25px',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            borderLeft: isActive ? '4px solid #3b82f6' : (isHovered ? '4px solid #eab308' : '4px solid transparent'),
                                                            boxShadow: isActive ? '0 8px 16px rgba(0,0,0,0.2)' : (isHovered ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'),
                                                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                                            backgroundColor: isActive ? 'var(--bg-card)' : (isHovered ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.2)'),
                                                            transform: isHovered && !isActive ? 'translateY(-2px)' : 'none'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                                            <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '8px' }}>{index + 1}.</div>
                                                            <div style={{ flex: 1 }}>
                                                                <input
                                                                    type="text"
                                                                    value={q.text}
                                                                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                                                    placeholder="Type question here..."
                                                                    style={{ width: '100%', fontSize: '1.1rem', background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', padding: '10px 0', borderBottom: isActive || isHovered ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                />

                                                                <div style={{ marginTop: '15px', transition: 'opacity 0.3s' }}>
                                                                    {q.type === 'likert' && (
                                                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-sub)', fontSize: '0.9rem', alignItems: 'center', opacity: 0.5, pointerEvents: 'none' }}>
                                                                            <span>1</span><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><span>5</span>
                                                                        </div>
                                                                    )}
                                                                    {q.type === 'yesno' && (
                                                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-sub)', opacity: 0.5, pointerEvents: 'none' }}>
                                                                            <label><input type="radio" disabled /> Yes</label>
                                                                            <label><input type="radio" disabled /> No</label>
                                                                        </div>
                                                                    )}
                                                                    {q.type === 'text' && <div style={{ borderBottom: '1px dashed var(--text-sub)', width: '100%', height: '20px', opacity: 0.5, pointerEvents: 'none' }}></div>}
                                                                    {q.type === 'textarea' && <div style={{ border: '1px dashed var(--text-sub)', width: '100%', height: '60px', borderRadius: '4px', opacity: 0.5, pointerEvents: 'none' }}></div>}
                                                                    {q.type === 'email' && <div style={{ borderBottom: '1px dashed var(--text-sub)', width: '60%', height: '20px', opacity: 0.5, pointerEvents: 'none' }}></div>}
                                                                    {q.type === 'date' && <input type="date" disabled style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-sub)', padding: '8px', borderRadius: '6px', cursor: 'not-allowed', opacity: 0.5 }} />}

                                                                    {['radio', 'checkbox', 'dropdown'].includes(q.type) && isActive && (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                                                            {(q.options || ['Option 1']).map((opt, optIndex) => (
                                                                                <div key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                    {q.type === 'radio' && <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-sub)' }}></div>}
                                                                                    {q.type === 'checkbox' && <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid var(--text-sub)' }}></div>}
                                                                                    {q.type === 'dropdown' && <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>{optIndex + 1}.</span>}
                                                                                    <input
                                                                                        type="text"
                                                                                        value={opt}
                                                                                        onChange={(e) => handleOptionTextChange(q.id, optIndex, e.target.value)}
                                                                                        style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)', padding: '5px', outline: 'none' }}
                                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                                    />
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveOption(q.id, optIndex); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }} title="Remove Option">×</button>
                                                                                </div>
                                                                            ))}
                                                                            <button onClick={(e) => { e.stopPropagation(); handleAddOption(q.id); }} style={{ alignSelf: 'flex-start', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px', marginTop: '8px' }}>+ Add Option</button>
                                                                        </div>
                                                                    )}

                                                                    {['radio', 'checkbox', 'dropdown'].includes(q.type) && !isActive && (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-sub)', opacity: 0.5, pointerEvents: 'none' }}>
                                                                            {(q.options || ['Option 1']).slice(0, 2).map((opt, i) => (
                                                                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                    {q.type === 'radio' && <input type="radio" disabled />}
                                                                                    {q.type === 'checkbox' && <input type="checkbox" disabled />}
                                                                                    {q.type === 'dropdown' && <span>{i + 1}.</span>}
                                                                                    {opt}
                                                                                </label>
                                                                            ))}
                                                                            {(q.options?.length || 0) > 2 && <span style={{ fontSize: '0.85rem', marginLeft: '25px' }}>...and {q.options.length - 2} more</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            marginTop: isActive || isHovered ? '20px' : '0',
                                                            paddingTop: isActive || isHovered ? '20px' : '0',
                                                            borderTop: isActive || isHovered ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px',
                                                            maxHeight: isActive || isHovered ? '100px' : '0',
                                                            opacity: isActive || isHovered ? 1 : 0,
                                                            overflow: 'hidden',
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <select
                                                                className="correction-textbox"
                                                                value={q.type}
                                                                onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                                style={{ width: 'max-content', minWidth: '220px', margin: 0 }}
                                                            >
                                                                <option value="text">📝 Short answer</option>
                                                                <option value="textarea">📄 Paragraph</option>
                                                                <option value="email">📧 Email</option>
                                                                <option value="date">📅 Date</option>
                                                                <option value="yesno">✔️ Yes / No Option</option>
                                                                <option value="radio">🔘 Multiple Choice</option>
                                                                <option value="checkbox">☑️ Checkboxes (Multiple)</option>
                                                                <option value="dropdown">🔽 Dropdown</option>
                                                                <option value="likert">📊 Linear scale (1-5)</option>
                                                            </select>

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <button
                                                onClick={addQuestion}
                                                style={{
                                                    border: '2px dashed rgba(234, 179, 8, 0.5)',
                                                    background: 'transparent',
                                                    color: 'var(--gold)',
                                                    padding: '25px',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)';
                                                    e.currentTarget.style.borderColor = 'var(--gold)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
                                                    e.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>➕</span> Add New Question
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
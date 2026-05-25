import { useState } from "react";

//====================================
// CONSTANTS
//====================================
import { PO_DEFINITIONS } from "@/shared/constants/constants";

//====================================
// COMPONENTS
//====================================
import BackToSurvey from "./BackToSurvey";
import MainMenu from "./MainMenu";
import SurveyTopMenu from "./SurveyTopMenu";
import Respondents from "./Respondents";
import SurveyDetailCard from "./SurveyDetailCard";
import POQuestionCard from "./POQuestionCard";

export default function Indirect({
    selectedSurveyView, setSelectedSurveyView,
    surveySubTab, setSurveySubTab,
    surveyDetailBatch, setSurveyDetailBatch,
    surveyDetailStudents,
    openSurveyModal,
    tracerRate,
    poRate,
}) {

    const saveFromDatabase = () => {

    }


const DEFAULT_PO_QUESTIONS = [
    { id: 'qA1', poId: 'A', type: 'likert', text: 'Knowledge on mathematics and scientific concepts', weight: 30, options: ['Knows basic mathematical concepts related to engineering problems', 'Knows basic scientific concepts related to engineering problems', 'Knows how to solve mathematical complex problems related to engineering', 'Knows how to solve scientific complex problems related to engineering'] },
    { id: 'qA2', poId: 'A', type: 'likert', text: 'Ability to apply knowledge in complex engineering problems', weight: 70, options: ['Able to apply and solve mathematical complex related engineering problems', 'Able to apply and solve scientific complex related engineering problems'] },
    { id: 'qB1', poId: 'B', type: 'likert', text: 'Ability do design Laboratory experiments', weight: 20, options: ['Able to understand the objectives of the experiment', 'Able to understand the constraints of the experiment'] },
    { id: 'qB2', poId: 'B', type: 'likert', text: 'Ability to conduct laboratory experiments', weight: 40, options: ['Ability to follow and practice safety precautions', 'Ability to strictly follow procedures correctly', 'Ability to set-up the apparatus and equipment properly'] },
    { id: 'qB3', poId: 'B', type: 'likert', text: 'Ability to analyze and interpret laboratory experiments', weight: 40, options: ['Ability to collect relevant data during observation', 'Ability to interpret results correctly', 'Ability to formulate appropriate and reliable conclusion'] },
    { id: 'qC1', poId: 'C', type: 'likert', text: 'Knowledge in designing a system or process', weight: 30, options: ['Able to identify the desired', 'Able to identify different needs constraints', 'Knowledge of Codes in safety and Health Standards'] },
    { id: 'qC2', poId: 'C', type: 'likert', text: 'Ability to design and doing a system of process', weight: 70, options: ['Apply the appropriate and scientific mathematical and scientific concepts', 'Consider the applicable constraints in reference to standard', 'Ability to follow design guidelines and procedures', 'Validate the design'] },
    { id: 'qD1', poId: 'D', type: 'likert', text: 'Personality Traits', weight: 30, options: ['Treat people with respect', 'Good communication skills', 'Cooperative and unbiased', 'Good Team Player'] },
    { id: 'qD2', poId: 'D', type: 'likert', text: 'Working in Multidisciplinary Traits', weight: 70, options: ['Accepts responsibility', 'Contributor', 'Supportive to team mates', 'Achieve Results'] },
    { id: 'qE1', poId: 'E', type: 'likert', text: 'Identify engineering problems', weight: 30, options: ['Understand the source of the engineering problems', 'Uses literature/journals to identify problem', 'Uses modem tools or equivalent to identify problem'] },
    { id: 'qE2', poId: 'E', type: 'likert', text: 'Formulate the solutions to solve engineering problems', weight: 70, options: ['Use of modern tools to formulate and solve engineering problem', 'Implement the engineering solution', 'Validate the engineering solution'] },
    { id: 'qF1', poId: 'F', type: 'likert', text: 'Professional Responsibility', weight: 50, options: ['Knowledge of professional norms and practices', 'Knowledge on engineering laws', 'Understanding the principles of code of ethics', 'Understanding the plagiarisms'] },
    { id: 'qF2', poId: 'F', type: 'likert', text: 'Ethical Responsibility', weight: 50, options: ['Knowledge on Code of Ethics', 'Knowledge on Plagiarism', 'Understanding the principles of code of ethics', 'Understanding the plagiarisms'] },
    { id: 'qG1', poId: 'G', type: 'likert', text: 'Listening', weight: 20, options: ['Good listening skills', 'Good Comprehension'] },
    { id: 'qG2', poId: 'G', type: 'likert', text: 'Able to deliver good oral communication skills', weight: 40, options: ['Articulate and correct grammar', 'Clear and Organized Delivery', 'Good Gestures'] },
    { id: 'qG3', poId: 'G', type: 'likert', text: 'Able to deliver good Written communication skills', weight: 40, options: ['Correct grammar', 'Organization and Sentence Fluency'] },
    { id: 'qH1', poId: 'H', type: 'likert', text: 'Global Economic', weight: 50, options: ['Knowledge of global and economic impact of engineering solutions', 'Knowledge of the solution that will have good impact', 'Understands global & economic impact of engineering solutions', 'Understands the solution that will have good impact'] },
    { id: 'qH2', poId: 'H', type: 'likert', text: 'Environmental Societal', weight: 50, options: ['Knowledge of Environmental impact of engineering solutions', 'Knowledge of societal impact of engineering solutions', 'Understands Environmental impact of engineering solutions', 'Understands societal impact of engineering solutions'] },
    { id: 'qI1', poId: 'I', type: 'likert', text: 'Awareness of the need for lifelong learning', weight: 40, options: ['Recognizes the concept of life- long learning', 'Recognizes the need for life- long learning', 'Understands the concept of life- long learning', 'Understands the need for life- long learning'] },
    { id: 'qI2', poId: 'I', type: 'likert', text: 'Life-long learning activities', weight: 60, options: ['Identifies activities that contribute to life-long learning', 'Pursues activities that contribute to life-long learning', 'Participates in activities', 'Shares life-long learning'] },
    { id: 'qJ1', poId: 'J', type: 'likert', text: 'Knowledge/awareness of contemporary issues', weight: 40, options: ['Awareness of contemporary issues', 'Concern about contemporary issues', 'Action taken about contemporary issues'] },
    { id: 'qJ2', poId: 'J', type: 'likert', text: 'Application of contemporary issues in research and/or thesis', weight: 60, options: ['Relevance of the Study', 'Implementation of the Study', 'Understanding the impact of the research to the contemporary issues'] },
    { id: 'qK1', poId: 'K', type: 'likert', text: 'Knowledge of techniques, skills and engineering tools for engineering practice', weight: 30, options: ['Knowledge on different techniques for engineering practices', 'Skills possess to engineering practices', 'Modern engineering tools (BSCpE)'] },
    { id: 'qK2', poId: 'K', type: 'likert', text: 'Ability to apply techniques, skills and engineering tools for engineering practice', weight: 70, options: ['Able to apply different techniques for engineering practices', 'Able to apply different skills in engineering practices', 'Modern engineering tools (BSCpE)'] },
    { id: 'qL1', poId: 'L', type: 'likert', text: 'As a member', weight: 40, options: ['Knowledge and understanding of engineering management principles', 'Apply engineering and management principles', 'Participative/Contributor'] },
    { id: 'qL2', poId: 'L', type: 'likert', text: 'As a Leader', weight: 60, options: ['Knowledge and understanding of engineering management principles', 'Apply engineering and management principles', 'Achieve project objective'] }
];

    // Convert array to object keyed by id
    const questionsToObject = (questionsArray) => {
        return questionsArray.reduce((acc, q) => {
            acc[q.id] = q;
            return acc;
        }, {});
    };

    const [surveyPayload, setSurveyPayload] = useState({
        version: "2024",
        type: "",
        title: "",
        description: "",
        questions: questionsToObject(DEFAULT_PO_QUESTIONS),
    });

    return(
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
                                setSurveyPayload={setSurveyPayload}
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
                                            {/* Survey Detail Card */}
                                            <SurveyDetailCard 
                                                surveyPayload={surveyPayload}
                                                setSurveyPayload={setSurveyPayload}
                                                saveFormToDatabase={saveFromDatabase}
                                            />

                                        </div>

                                        <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '100px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>Survey Questions</h2>
                                                <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>{surveyPayload?.questions.length} Items</span>
                                            </div>

                                    {selectedSurveyView === '1stYear' ? (
                                        <POQuestionCard 
                                            surveyPayload={surveyPayload}
                                            setSurveyPayload={setSurveyPayload}
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
                                                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-sub)', fontSize: '0.9rem', alignItems: 'center', opacity: 0.5, pointerEvents: 'none' }}><span>1</span><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><input type="radio" disabled /><span>5</span></div>
                                                                    )}
                                                                    {q.type === 'yesno' && (
                                                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-sub)', opacity: 0.5, pointerEvents: 'none' }}><label><input type="radio" disabled /> Yes</label><label><input type="radio" disabled /> No</label></div>
                                                                    )}
                                                                    {q.type === 'text' && (
                                                                        <div style={{ borderBottom: '1px dashed var(--text-sub)', width: '100%', height: '20px', opacity: 0.5, pointerEvents: 'none' }}></div>
                                                                    )}
                                                                    {q.type === 'textarea' && (
                                                                        <div style={{ border: '1px dashed var(--text-sub)', width: '100%', height: '60px', borderRadius: '4px', opacity: 0.5, pointerEvents: 'none' }}></div>
                                                                    )}
                                                                    {q.type === 'email' && (
                                                                        <div style={{ borderBottom: '1px dashed var(--text-sub)', width: '60%', height: '20px', opacity: 0.5, pointerEvents: 'none' }}></div>
                                                                    )}
                                                                    {q.type === 'date' && (
                                                                        <input type="date" disabled style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-sub)', padding: '8px', borderRadius: '6px', cursor: 'not-allowed', opacity: 0.5 }} />
                                                                    )}
                                                                    
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
                                                                            {(q.options?.length || 0) > 2 && <span style={{ fontSize: '0.85rem', marginLeft: '25px' }}>...and {(q.options.length) - 2} more</span>}
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
    )
}
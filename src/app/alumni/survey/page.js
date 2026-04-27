'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './survey.css';
import '../alumni-globals.css';

const PO_DEFINITIONS = [
    {   id: 'A', 
        title: 'Engineering Knowledge', 
        desc: 'Apply knowledge of mathematics, natural science, engineering fundamentals and an engineering specialization to the solution of complex engineering problems.' 
    },
    { id: 'B', title: 'Problem Analysis', desc: 'Conduct investigations of complex engineering problems using research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of information to provide valid conclusions.' },
    { id: 'C', title: 'Design/Development of Solutions', desc: 'Design solutions for complex engineering problems and design systems, components or processes that meet specified needs with appropriate consideration for public health and safety, cultural, societal, and environmental considerations.' },
    { id: 'D', title: 'Individual and Team Work', desc: 'Function effectively as an individual, and as a member or leader in diverse teams and in multi-disciplinary settings.' },
    { id: 'E', title: 'Modern Tool Usage', desc: 'Identify, formulate, research literature and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences and engineering sciences.' },
    { id: 'F', title: 'The Engineer and Society', desc: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.' },
    { id: 'G', title: 'Communication', desc: 'Communicate effectively on complex engineering activities with the engineering community and with society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.' },
    { id: 'H', title: 'Environment and Sustainability', desc: 'Understand and evaluate the sustainability and impact of professional engineering work in the solution of complex engineering problems in societal and environmental context.' },
    { id: 'I', title: 'Life-long Learning', desc: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.' },
    { id: 'J', title: 'Ethics', desc: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to professional engineering practice and solutions to complex engineering problems.' },
    { id: 'K', title: 'Investigation', desc: 'Create, select and apply appropriate techniques, resources, and modern engineering and IT tools, including prediction and modelling, to complex engineering problems with an understanding of the limitations.' },
    { id: 'L', title: 'Project Management and Finance', desc: 'Demonstrate knowledge and understanding of engineering management principles and economic decision-making and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.' }
];

export default function DynamicPOSurvey() {
    const router = useRouter();
    const [answers, setAnswers] = useState({});
    
    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDesc, setSurveyDesc] = useState('');
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const existingSchema = localStorage.getItem('obe_form_po');
        
        if (existingSchema) {
            const parsed = JSON.parse(existingSchema);
            setSurveyTitle(parsed.title || 'Program Outcomes Survey');
            setSurveyDesc(parsed.desc || 'Evaluate your proficiency.');
            setSurveyQuestions(parsed.questions || []);
        } else {
            setSurveyTitle('Program Outcomes Survey (PO)');
            setSurveyDesc('Evaluate your proficiency based on the scale: 1 (Lowest) to 5 (Highest).');
            setSurveyQuestions([
                { id: 'q1', type: 'likert', text: '1. How well can you apply mathematics to engineering problems?' },
                { id: 'q2', type: 'yesno', text: '2. Did the curriculum prepare you for industrial standards?' },
                { id: 'q3', type: 'text', text: '3. What specific skills learned were most useful in your first job?' }
            ]);
        }
        setIsLoading(false);
    }, []);

    let totalSubItems = 0;
    surveyQuestions.forEach(q => {
        if (q.type === 'likert' && q.options) {
            totalSubItems += q.options.length;
        } else {
            totalSubItems += 1;
        }
    });

    const answeredSubItems = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;
    const progressPercent = totalSubItems === 0 ? 0 : Math.round((answeredSubItems / totalSubItems) * 100);

    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        if (answeredSubItems < totalSubItems) {
            alert('Please complete all questions before submitting.');
            return;
        }

        const session = JSON.parse(localStorage.getItem('current_user') || '{}');
        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');

        if (session && session.id) {
            const updatedDb = db.map(student => {
                if (student.id === session.id) {
                    const currentAnswers = student.surveyAnswers || {};
                    return { ...student, surveyAnswers: { ...currentAnswers, po: answers }, surveyProgress: '100%' };
                }
                return student;
            });

            localStorage.setItem('obe_masterlist', JSON.stringify(updatedDb));
            alert('Survey Submitted Successfully! Your progress is now 100%.');
            router.push('/alumni');
        } else {
            alert('Session expired. Please log in again.');
            router.push('/');
        }
    };

    const groupedQuestions = {};
    surveyQuestions.forEach(q => {
        const key = q.poId || 'General';
        if (!groupedQuestions[key]) groupedQuestions[key] = [];
        groupedQuestions[key].push(q);
    });

    const poOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'General'];
    const sortedPoKeys = Object.keys(groupedQuestions).sort((a, b) => {
        return poOrder.indexOf(a) - poOrder.indexOf(b);
    });

    const incompletePOs = [];
    sortedPoKeys.forEach(poKey => {
        let isComplete = true;
        groupedQuestions[poKey].forEach(q => {
            if (q.type === 'likert' && q.options) {
                q.options.forEach((opt, optIndex) => {
                    const subItemId = `${q.id}_sub_${optIndex}`;
                    if (!answers[subItemId]) isComplete = false;
                });
            } else {
                if (!answers[q.id] || answers[q.id].length === 0) isComplete = false;
            }
        });

        if (!isComplete) {
            const poInfo = PO_DEFINITIONS.find(p => p.id === poKey);
            if (poInfo) {
                incompletePOs.push(poInfo);
            } else if (poKey === 'General') {
                incompletePOs.push({ id: 'General', title: 'General Questions' });
            }
        }
    });

    if (isLoading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Survey Configuration...</div>;

    return (
        <div className="portal-layout">
            <main className="main-content" style={{ overflowY: 'auto', padding: '40px', position: 'relative' }}>
                
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    <div className="survey-container" style={{ flex: 1 }}>
                        
                        <div className="portal-card" style={{ padding: '30px', marginBottom: '40px', borderTop: '6px solid var(--gold)', borderRadius: '12px' }}>
                            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '10px' }}>{surveyTitle}</h1>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>{surveyDesc}</p>
                        </div>

                        {sortedPoKeys.map(poKey => {
                            const poInfo = PO_DEFINITIONS.find(p => p.id === poKey);
                            return (
                                <div key={poKey} style={{ marginBottom: '40px' }}>
                                    {poInfo && (
                                        <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                            <h2 style={{ color: 'var(--gold)', margin: '0 0 5px 0', fontSize: '1.4rem' }}>PO-{poInfo.id}: {poInfo.title}</h2>
                                            <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{poInfo.desc}</p>
                                        </div>
                                    )}

                                    {groupedQuestions[poKey].map((q, index) => (
                                        <div key={q.id} className="portal-card" style={{ marginBottom: '25px', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.5', flex: 1, paddingRight: '20px' }}>
                                                    {index + 1}. {q.text}
                                                </h3>
                                                {q.weight && (
                                                    <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--gold)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(234, 179, 8, 0.3)', whiteSpace: 'nowrap' }}>
                                                        {q.weight}% Weight
                                                    </span>
                                                )}
                                            </div>

                                            {q.type === 'likert' && q.options && (
                                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
                                                        <div style={{ flex: 1 }}></div>
                                                        <div style={{ display: 'flex', width: '250px', justifyContent: 'space-between', color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 'bold', paddingRight: '15px' }}>
                                                            <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {q.options.map((opt, optIndex) => {
                                                        const subItemId = `${q.id}_sub_${optIndex}`;
                                                        return (
                                                            <div key={optIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: optIndex < q.options.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none' }}>
                                                                <div style={{ flex: 1, paddingRight: '20px', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                                    {opt}
                                                                </div>
                                                                <div style={{ display: 'flex', width: '250px', justifyContent: 'space-between', alignItems: 'center', paddingRight: '15px' }}>
                                                                    {[5, 4, 3, 2, 1].map(val => (
                                                                        <input 
                                                                            key={val}
                                                                            type="radio" 
                                                                            name={subItemId} 
                                                                            onChange={() => handleOptionChange(subItemId, val)} 
                                                                            checked={answers[subItemId] === val} 
                                                                            style={{ width: '20px', height: '20px', accentColor: 'var(--gold)', cursor: 'pointer' }} 
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {q.type === 'yesno' && (
                                                <div style={{ display: 'flex', gap: '20px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="radio" name={q.id} onChange={() => handleOptionChange(q.id, 'Yes')} checked={answers[q.id] === 'Yes'} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} /> <span style={{ color: 'var(--text-main)' }}>Yes</span></label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="radio" name={q.id} onChange={() => handleOptionChange(q.id, 'No')} checked={answers[q.id] === 'No'} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} /> <span style={{ color: 'var(--text-main)' }}>No</span></label>
                                                </div>
                                            )}

                                            {q.type === 'text' && (
                                                <input type="text" className="correction-textbox" style={{ width: '100%', padding: '15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }} placeholder="Type your response here..." onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                            )}
                                            
                                            {q.type === 'textarea' && (
                                                <textarea className="correction-textbox" style={{ width: '100%', height: '100px', padding: '15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', resize: 'vertical' }} placeholder="Type your response here..." onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''}></textarea>
                                            )}

                                            {q.type === 'email' && (
                                                <input type="email" className="correction-textbox" style={{ width: '100%', padding: '15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }} placeholder="Email Address..." onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                            )}

                                            {q.type === 'date' && (
                                                <input type="date" className="correction-textbox" style={{ padding: '10px 15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', colorScheme: 'dark' }} onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                            )}

                                            {q.type === 'radio' && q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {q.options.map((opt, i) => (
                                                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-main)' }}>
                                                            <input type="radio" name={q.id} value={opt} onChange={() => handleOptionChange(q.id, opt)} checked={answers[q.id] === opt} style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'dropdown' && q.options && (
                                                <select 
                                                    className="correction-textbox" 
                                                    style={{ width: '100%', padding: '15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
                                                    value={answers[q.id] || ''}
                                                    onChange={(e) => handleOptionChange(q.id, e.target.value)}
                                                >
                                                    <option value="" disabled>Select an option...</option>
                                                    {q.options.map((opt, i) => (
                                                        <option key={i} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {q.type === 'checkbox' && q.options && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {q.options.map((opt, i) => {
                                                        const currentAnswers = answers[q.id] || [];
                                                        const isChecked = currentAnswers.includes(opt);
                                                        return (
                                                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-main)' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        let newArr = [...currentAnswers];
                                                                        if (e.target.checked) newArr.push(opt);
                                                                        else newArr = newArr.filter(item => item !== opt);
                                                                        handleOptionChange(q.id, newArr);
                                                                    }}
                                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }} 
                                                                />
                                                                {opt}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                        {PO_DEFINITIONS.filter(po => !groupedQuestions[po.id]).map(poInfo => (
                            <div key={poInfo.id} style={{ marginBottom: '40px', opacity: 0.5 }}>
                                <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                    <h2 style={{ color: 'var(--text-sub)', margin: '0 0 5px 0', fontSize: '1.4rem' }}>PO-{poInfo.id}: {poInfo.title}</h2>
                                    <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{poInfo.desc}</p>
                                </div>
                                <div className="portal-card" style={{ padding: '30px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-sub)', margin: 0 }}>No questions currently assigned to this outcome.</p>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '40px', paddingBottom: '60px' }}>
                            <button className="outline-btn" onClick={() => router.back()} style={{ padding: '15px 40px', borderRadius: '8px', fontWeight: 'bold' }}>Cancel</button>
                            <button className="primary-btn" onClick={handleSubmit} disabled={progressPercent !== 100} style={{ padding: '15px 60px', borderRadius: '8px', border: 'none', fontWeight: 'bold', opacity: progressPercent === 100 ? 1 : 0.5, cursor: progressPercent === 100 ? 'pointer' : 'not-allowed' }}>Submit Evaluation</button>
                        </div>
                    </div>

                    <div style={{ position: 'sticky', top: '40px', width: '310px', flexShrink: 0, height: 'fit-content' }}>
                        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '25px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--text-sub)', fontSize: '1.2rem' }}>⚙️</span>
                                    <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>Completion Progress</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '15px' }}>{progressPercent}<span style={{ fontSize: '1.8rem', color: 'var(--text-sub)' }}>%</span></div>
                            <div style={{ width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '20px' }}>
                                <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--gold)', borderRadius: '12px', transition: 'width 0.4s' }}></div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Submit the form to sync your final status.</p>

                            {incompletePOs.length > 0 && (
                                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                    <p style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>Pending Sections:</p>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {incompletePOs.map(po => (
                                            <li key={po.id} style={{ fontSize: '0.85rem', color: 'var(--text-sub)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ef4444' }}>•</span>
                                                <span><strong>PO-{po.id}</strong>: {po.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './tracer.css';
import '../alumni-globals.css';

export default function DynamicTracerStudy() {
    const router = useRouter();
    const [answers, setAnswers] = useState({});
    
    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDesc, setSurveyDesc] = useState('');
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        const existingSchema = localStorage.getItem('obe_form_gts');
        
        if (existingSchema) {
            const parsed = JSON.parse(existingSchema);
            setSurveyTitle(parsed.title || 'Graduate Tracer Study');
            setSurveyDesc(parsed.desc || 'Please answer the following questions.');
            setSurveyQuestions(parsed.questions || []);
        } else {
            setSurveyTitle('Graduate Tracer Study');
            setSurveyDesc('Please complete this tracer survey.');
            setSurveyQuestions([
                { id: 'q1', type: 'yesno', text: 'Are you currently employed?' },
                { id: 'q2', type: 'text', text: 'What is your current job title?' }
            ]);
        }
        setIsLoading(false);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCheckboxChange = (questionId, optionValue) => {
        setAnswers(prev => {
            const currentArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            if (currentArr.includes(optionValue)) {
                return { ...prev, [questionId]: currentArr.filter(v => v !== optionValue) };
            } else {
                return { ...prev, [questionId]: [...currentArr, optionValue] };
            }
        });
    };

    const visibleQuestions = surveyQuestions.filter((q) => {
        const isEmployed = answers['q16']; 
        if (q.id === 'q17') return isEmployed === 'No';
        
        const qNum = parseInt(q.id.replace('q', ''));
        if (qNum >= 18 && qNum <= 33) return isEmployed === 'Yes';

        return true;
    });

    const totalQuestions = visibleQuestions.length;
    const answeredQuestions = visibleQuestions.filter(q => {
        const ans = answers[q.id];
        if (Array.isArray(ans)) return ans.length > 0;
        return ans !== undefined && ans !== '';
    }).length;
    
    const progressPercent = totalQuestions === 0 ? 0 : Math.round((answeredQuestions / totalQuestions) * 100);

    const handleSubmit = () => {
        if (answeredQuestions < totalQuestions) {
            alert('Please complete all required questions before submitting.');
            return;
        }

        const session = JSON.parse(localStorage.getItem('current_user') || '{}');
        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');

        if (session && session.id) {
            const updatedDb = db.map(student => {
                if (student.id === session.id) {
                    const currentAnswers = student.surveyAnswers || {};
                    return { ...student, surveyAnswers: { ...currentAnswers, gts: answers }, tracerProgress: '100%', jobTitle: answers['q19'] || answers['q3'] || student.jobTitle };
                }
                return student;
            });

            localStorage.setItem('obe_masterlist', JSON.stringify(updatedDb));
            
            alert('Graduate Tracer Study Submitted Successfully! Your progress is now 100%.');
            router.push('/alumni');
        } else {
            alert('Session expired. Please log in again.');
            router.push('/');
        }
    };

    if (isLoading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Tracer Configuration...</div>;

    return (
        <div className="portal-layout" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .glass-header {
                    background: rgba(15, 23, 42, 0.9) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
                    border-bottom: 1px solid rgba(234, 179, 8, 0.2) !important;
                }
                .interactive-input:focus {
                    border-color: var(--gold) !important;
                    box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
                }
            `}</style>

            <header className="glass-header" style={{ padding: '25px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>Graduate Tracer Study</h1>
                    <p style={{ color: 'var(--gold)', margin: '5px 0 0 0', fontSize: '0.9rem', letterSpacing: '1px' }}>INSTITUTIONAL QUESTIONNAIRE</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="outline-btn" onClick={toggleTheme} style={{ padding: '8px 20px', borderRadius: '6px' }}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="outline-btn" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: '6px' }}>
                        Cancel & Exit
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, padding: '40px', display: 'flex', gap: '40px', justifyContent: 'center' }}>
                
                <div className="survey-container" style={{ flex: 1, maxWidth: '800px' }}>
                    
                    <div className="portal-card" style={{ padding: '35px', marginBottom: '30px', borderTop: '6px solid var(--gold)', borderRadius: '12px', animation: 'fadeInUp 0.6s ease forwards' }}>
                        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '15px' }}>{surveyTitle}</h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-sub)', lineHeight: '1.6' }}>{surveyDesc}</p>
                    </div>

                    {visibleQuestions.length === 0 ? (
                         <div className="portal-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
                             No tracer questions configured by the Program Chair yet.
                         </div>
                    ) : (
                        visibleQuestions.map((q, index) => {
                            // DIRECTLY READING THE OPTIONS FROM PROGRAM CHAIR'S BUILDER!
                            const options = q.options || [];
                            const cleanText = q.text;

                            const commonInputStyle = { width: '100%', padding: '15px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' };

                            return (
                                <div 
                                    key={q.id} 
                                    className="portal-card" 
                                    style={{ 
                                        marginBottom: '25px', 
                                        padding: '30px', 
                                        opacity: 0, 
                                        animation: `fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                                        animationDelay: `${Math.min(index * 0.05, 0.5)}s`, 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.4)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '25px', lineHeight: '1.5' }}>
                                        {cleanText}
                                    </h3>

                                    {q.type === 'likert' && (
                                        <div className="likert-scale" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Lowest</span>
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <label key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                                                    <input type="radio" name={q.id} onChange={() => handleOptionChange(q.id, val)} checked={answers[q.id] === val} style={{ width: '22px', height: '22px', accentColor: 'var(--gold)', marginBottom: '8px', cursor: 'pointer' }} />
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{val}</span>
                                                </label>
                                            ))}
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Highest</span>
                                        </div>
                                    )}

                                    {q.type === 'yesno' && (
                                        <div style={{ display: 'flex', gap: '30px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', border: answers[q.id] === 'Yes' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', backgroundColor: answers[q.id] === 'Yes' ? 'rgba(234, 179, 8, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                                                <input type="radio" name={q.id} onChange={() => handleOptionChange(q.id, 'Yes')} checked={answers[q.id] === 'Yes'} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} /> 
                                                <span style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>Yes</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', border: answers[q.id] === 'No' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', backgroundColor: answers[q.id] === 'No' ? 'rgba(234, 179, 8, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                                                <input type="radio" name={q.id} onChange={() => handleOptionChange(q.id, 'No')} checked={answers[q.id] === 'No'} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }} /> 
                                                <span style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>No</span>
                                            </label>
                                        </div>
                                    )}

                                    {q.type === 'text' && (
                                        <input type="text" className="interactive-input" style={commonInputStyle} placeholder="Type your answer here..." onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                    )}

                                    {q.type === 'email' && (
                                        <input type="email" className="interactive-input" style={commonInputStyle} placeholder="e.g., juandelacruz@gmail.com" onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                    )}

                                    {q.type === 'date' && (
                                        <input type="date" className="interactive-input" style={commonInputStyle} onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''} />
                                    )}

                                    {q.type === 'textarea' && (
                                        <textarea className="interactive-input" style={{ ...commonInputStyle, height: '120px', resize: 'vertical' }} placeholder="Type your detailed response here..." onChange={(e) => handleOptionChange(q.id, e.target.value)} value={answers[q.id] || ''}></textarea>
                                    )}

                                    {q.type === 'radio' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {options.map((opt, i) => (
                                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: answers[q.id] === opt ? '1px solid var(--gold)' : '1px solid transparent', backgroundColor: answers[q.id] === opt ? 'rgba(234, 179, 8, 0.05)' : 'transparent', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = answers[q.id] === opt ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = answers[q.id] === opt ? 'rgba(234, 179, 8, 0.05)' : 'transparent'}>
                                                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => handleOptionChange(q.id, e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)', cursor: 'pointer' }} />
                                                    <span style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'checkbox' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {options.map((opt, i) => {
                                                const isChecked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                                                return (
                                                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: isChecked ? '1px solid var(--gold)' : '1px solid transparent', backgroundColor: isChecked ? 'rgba(234, 179, 8, 0.05)' : 'transparent', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isChecked ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isChecked ? 'rgba(234, 179, 8, 0.05)' : 'transparent'}>
                                                        <input type="checkbox" value={opt} checked={isChecked} onChange={() => handleCheckboxChange(q.id, opt)} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)', cursor: 'pointer' }} />
                                                        <span style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'dropdown' && (
                                        <select className="interactive-input" style={{ ...commonInputStyle, cursor: 'pointer', appearance: 'auto' }} value={answers[q.id] || ''} onChange={(e) => handleOptionChange(q.id, e.target.value)}>
                                            <option value="" disabled>Select an option...</option>
                                            {options.map((opt, i) => (
                                                <option key={i} value={opt} style={{ backgroundColor: '#1f2937', color: 'white' }}>{opt}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            );
                        })
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', paddingBottom: '60px' }}>
                        <button className="outline-btn" onClick={() => router.back()} style={{ padding: '15px 40px', borderRadius: '8px', fontWeight: 'bold' }}>Cancel</button>
                        <button className="primary-btn" onClick={handleSubmit} disabled={progressPercent !== 100} style={{ padding: '15px 60px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', opacity: progressPercent === 100 ? 1 : 0.5, cursor: progressPercent === 100 ? 'pointer' : 'not-allowed', boxShadow: progressPercent === 100 ? '0 10px 25px rgba(234, 179, 8, 0.4)' : 'none', transition: 'all 0.3s' }}>
                            Submit Tracer
                        </button>
                    </div>
                </div>

                <div style={{ width: '340px', position: 'sticky', top: '120px', height: 'fit-content' }}>
                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'var(--text-sub)', fontSize: '1.2rem' }}>📈</span>
                                <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>Completion Progress</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '3.5rem', fontWeight: '700', color: progressPercent === 100 ? '#10b981' : 'var(--text-main)', marginBottom: '15px', transition: 'color 0.3s' }}>
                            {progressPercent}<span style={{ fontSize: '1.8rem', color: 'var(--text-sub)' }}>%</span>
                        </div>
                        <div style={{ width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? '#10b981' : 'var(--gold)', borderRadius: '12px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s' }}></div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                            {progressPercent === 100 ? 'All required questions answered! You may now submit.' : `Answer ${totalQuestions - answeredQuestions} more required questions.`}
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
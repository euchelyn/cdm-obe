'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './pc.css';
import '../alumni/alumni-globals.css';

//==================================================
// COMPONENTS
//==================================================
import PCSidebar from './components/PCSidebar';
import ProgramOverview from './components/program_overview/ProgramOverview';
import Masterlist from './components/masterlist/Masterlist';
import Direct from './components/direct/Direct';
import Indirect from './components/indirect/Indirect';
import Determinants from './components/determinants/Determinants';

//==================================================
// SERVICES
//==================================================
import { getObeAttainment } from '@/services/obeAttainmentService';
import { getAnsweredSurveysByStudent } from '@/services/answeredSurveyService';
import { getPcReports } from '@/services/pcReportsService';

//==================================================
// CONSTANTS
//==================================================
import {
    PO_DEFINITIONS,
    CPE_CURRICULUM,
} from '@/shared/constants/constants';

export default function ProgramChairDashboard() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(true);
    
    const [activeMenu, setActiveMenu] = useState('overview');
    const [indirectTab, setIndirectTab] = useState('status'); 
    
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [evalAttainment, setEvalAttainment] = useState(null);
    const [evalSurveys, setEvalSurveys] = useState(null);
    const [evalLoading, setEvalLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const [selectedMappingCourse, setSelectedMappingCourse] = useState(null);
    const [courseMappings, setCourseMappings] = useState({}); 
    const [courseWeights, setCourseWeights] = useState({}); 

    const [formBatchYear, setFormBatchYear] = useState('2026');
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [questions, setQuestions] = useState([]);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [hoveredQuestionId, setHoveredQuestionId] = useState(null);

    const [surveyModalStudent, setSurveyModalStudent] = useState(null);
    const [surveyModalType, setSurveyModalType] = useState(null);
    const [surveyModalAnswers, setSurveyModalAnswers] = useState({});
    const [surveyModalQuestions, setSurveyModalQuestions] = useState([]);
    const [respondentTab, setRespondentTab] = useState('answers');
    const [isEditingSurvey, setIsEditingSurvey] = useState(false);

    const [reportType, setReportType] = useState('direct');
    const [indirectReportTab, setIndirectReportTab] = useState('1stYear');
    const [tracerSchema, setTracerSchema] = useState([]);
    const [checklistBatch, setChecklistBatch] = useState('All');

    const [selectedSurveyView, setSelectedSurveyView] = useState(null); 
    const [surveySubTab, setSurveySubTab] = useState('respondents');
    const [surveyDetailBatch, setSurveyDetailBatch] = useState('All');
    
    const [gtsReportTab, setGtsReportTab] = useState('raw');
    const [selectedGtsCols, setSelectedGtsCols] = useState(['q1', 'q16', 'q18', 'q19', 'q30']); 
    const [gtsAnalyticsField, setGtsAnalyticsField] = useState('q18');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        } else {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        const existingDB = localStorage.getItem('obe_masterlist');
        if (existingDB) {
            setStudents(JSON.parse(existingDB));
        }

        const savedMappings = localStorage.getItem('obe_course_mappings');
        if (savedMappings) {
            setCourseMappings(JSON.parse(savedMappings));
        } else {
            setCourseMappings({
                "COEN 4202 CPE Practice and Design 2": { A: true, C: true, E: true, L: true },
                "COEN 3103 Logic, Circuit and Design (lec)": { A: true, B: true }
            });
        }

        const savedWeights = localStorage.getItem('obe_course_weights');
        if (savedWeights) {
            setCourseWeights(JSON.parse(savedWeights));
        } else {
            setCourseWeights({
                "A": { "MATH 2074 Differential & Integral Calculus 1": 40, "NASC 2053 Physics 1(lec)": 30, "COEN 4202 CPE Practice and Design 2": 30 },
                "B": { "MATH 2074 Differential & Integral Calculus 1": 50, "NASC 2053 Physics 1(lec)": 50 }
            });
        }
    }, []);

    useEffect(() => {
        if (activeMenu === 'indirect' && surveySubTab === 'builder' && selectedSurveyView) {
            const sType = selectedSurveyView === '1stYear' ? 'po' :
                          selectedSurveyView === '3to5Year' ? 'peo' : 'gts';
            const baseKey = sType === 'po' ? 'obe_form_po' :
                            sType === 'peo' ? 'obe_form_peo' : 'obe_form_gts';
            
            const dbKey = `${baseKey}_${formBatchYear}`;
            let savedData = localStorage.getItem(dbKey);
            
            if (!savedData) {
                savedData = localStorage.getItem(baseKey);
            }

            if (savedData) {
                const parsed = JSON.parse(savedData);
                setFormTitle(parsed.title);
                setFormDesc(parsed.desc);
                setQuestions(parsed.questions || []);
            } else {
                if (sType === 'po') {
                    setFormTitle('SO Survey (Yearly Update)');
                    setFormDesc('Evaluate your proficiency based on the scale: 1 (Lowest) to 5 (Highest).');
                    setQuestions(DEFAULT_PO_QUESTIONS);
                } else if (sType === 'peo') {
                    setFormTitle('3-5 Year PEO Survey');
                    setFormDesc('Evaluate your attainment of the Program Educational Objectives.');
                    setQuestions(DEFAULT_PEO_QUESTIONS);
                } else {
                    setFormTitle('Graduate Tracer Study');
                    setFormDesc('In compliance with the Commission on Higher Education (CHED) Memorandum Order. Please complete this questionnaire as accurately and frankly as possible.');
                    setQuestions(DEFAULT_GTS_QUESTIONS);
                }
            }
            setActiveQuestionId(null);
            setHoveredQuestionId(null);
        }
    }, [activeMenu, selectedSurveyView, surveySubTab, formBatchYear]);

    // ─── Load the real evaluation record when a student is opened ────────────
    useEffect(() => {
        if (!selectedStudent?._id) {
            setEvalAttainment(null);
            setEvalSurveys(null);
            return;
        }

        let cancelled = false;

        (async () => {
            setEvalLoading(true);
            try {
                const [att, surveys] = await Promise.all([
                    getObeAttainment(selectedStudent._id),
                    getAnsweredSurveysByStudent(selectedStudent._id),
                ]);

                if (cancelled) return;

                setEvalAttainment(att);

                // Map survey_type -> 'answered' if any record is answered
                const map = {};
                (Array.isArray(surveys) ? surveys : []).forEach((s) => {
                    if (map[s.survey_type] !== 'answered') {
                        map[s.survey_type] = s.status;
                    }
                });
                setEvalSurveys(map);
            } catch (e) {
                console.error('Failed to load evaluation record:', e);
            } finally {
                if (!cancelled) setEvalLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [selectedStudent?._id]);

    // ─── Load Reports & Analytics data when that tab is opened ───────────────
    useEffect(() => {
        if (activeMenu !== 'analytics') return;

        let cancelled = false;
        (async () => {
            setReportLoading(true);
            try {
                const d = await getPcReports();
                if (cancelled) return;
                setReportData(d);

                // Default the analytics variable to the first categorical question
                const vars = (d?.gts?.schema || []).filter(q =>
                    ['radio', 'dropdown', 'yesno', 'checkbox'].includes(q.type)
                );
                setGtsAnalyticsField(prev =>
                    vars.find(v => v.id === prev) ? prev : (vars[0]?.id || '')
                );
            } catch (e) {
                console.error('Failed to load reports:', e);
            } finally {
                if (!cancelled) setReportLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [activeMenu]);

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

    const saveEvaluation = () => {
        if (!selectedStudent) return;
        const isGraded = selectedStudent.det1Grade || selectedStudent.det2Grade || selectedStudent.det3Grade;
        const finalStudentData = { ...selectedStudent, obeStatus: isGraded ? 'Graded' : 'Pending' };
        const updatedStudents = students.map(s => s.id === selectedStudent.id ? finalStudentData : s);
        setStudents(updatedStudents);
        localStorage.setItem('obe_masterlist', JSON.stringify(updatedStudents));
        showToast(`Grade evaluation for ${selectedStudent.name} saved successfully!`, 'success');
        setSelectedStudent(null);
    };

    const showToast = (msg, type = 'success') => {
        setToastMessage({ text: msg, type });
        setTimeout(() => setToastMessage(null), 5000);
    };

    const openSurveyModal = (student, surveyTypeView) => {
        let baseKey = '';
        let sType = '';
        if (surveyTypeView === '1stYear') { baseKey = 'obe_form_po'; sType = 'po'; }
        else if (surveyTypeView === '3to5Year') { baseKey = 'obe_form_peo'; sType = 'peo'; }
        else if (surveyTypeView === 'gts') { baseKey = 'obe_form_gts'; sType = 'gts'; }
        
        const dbKey = `${baseKey}_${student.batch}`;
        let savedData = localStorage.getItem(dbKey);
        if (!savedData) {
            savedData = localStorage.getItem(baseKey);
        }

        let parsedQuestions = [];
        if (savedData) {
            parsedQuestions = JSON.parse(savedData).questions || [];
        } else {
            if (sType === 'po') parsedQuestions = DEFAULT_PO_QUESTIONS;
            else if (sType === 'peo') parsedQuestions = DEFAULT_PEO_QUESTIONS;
            else if (sType === 'gts') parsedQuestions = DEFAULT_GTS_QUESTIONS;
        }
        
        setSurveyModalQuestions(parsedQuestions);
        setSurveyModalAnswers(student.surveyAnswers?.[sType] || {});
        setSurveyModalType(sType);
        setSurveyModalStudent(student);
        setRespondentTab('answers');
        setIsEditingSurvey(false);
    };

    const handleSurveyAnswerChange = (qId, val) => {
        setSurveyModalAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const saveSurveyAnswers = () => {
        if (!surveyModalStudent) return;
        const updatedStudents = students.map(s => {
            if (s.id === surveyModalStudent.id) {
                const currentAnswers = s.surveyAnswers || {};
                return {
                    ...s,
                    surveyAnswers: { ...currentAnswers, [surveyModalType]: surveyModalAnswers },
                    surveyProgress: surveyModalType === 'po' ? '100%' : s.surveyProgress,
                    peoProgress: surveyModalType === 'peo' ? '100%' : (s.peoProgress || '0%'),
                    tracerProgress: surveyModalType === 'gts' ? '100%' : s.tracerProgress,
                };
            }
            return s;
        });
        setStudents(updatedStudents);
        localStorage.setItem('obe_masterlist', JSON.stringify(updatedStudents));
        showToast(`Survey responses for ${surveyModalStudent.name} updated!`, 'success');
        setSurveyModalStudent(null);
    };









    const handleExportPDF = () => {
        window.print();
    };

    const activeStudents = students.filter(s => !s.isDeleted);
    
    let displayStudents = activeStudents;
    if (selectedBatch !== 'All') {
        displayStudents = displayStudents.filter(s => s.batch === selectedBatch);
    }

    const pendingDirectAssessments = activeStudents.filter(s => s.obeStatus === 'Pending').length;
    const completedTracer = activeStudents.filter(s => s.tracerProgress === '100%').length;
    const completedPO = activeStudents.filter(s => s.surveyProgress === '100%').length;
    const totalActive = activeStudents.length;
    
    const tracerRate = totalActive === 0 ? 0 : Math.round((completedTracer / totalActive) * 100);
    const poRate = totalActive === 0 ? 0 : Math.round((completedPO / totalActive) * 100);

    const filteredChecklist = checklistBatch === 'All' ? activeStudents : activeStudents.filter(s => s.batch === checklistBatch);
    const totalChecklist = filteredChecklist.length;
    const c_poCompleted = filteredChecklist.filter(s => s.surveyProgress === '100%').length;
    const c_tracerCompleted = filteredChecklist.filter(s => s.tracerProgress === '100%').length;
    const c_poRate = totalChecklist === 0 ? 0 : Math.round((c_poCompleted / totalChecklist) * 100);
    const c_tracerRate = totalChecklist === 0 ? 0 : Math.round((c_tracerCompleted / totalChecklist) * 100);

    const surveyDetailStudents = surveyDetailBatch === 'All' ? activeStudents : activeStudents.filter(s => s.batch === surveyDetailBatch);

    // ─── Direct Assessment determinant groups (computed from PO attainment) ───
    const DET_GROUPS = [
        { label: 'Det 1', range: 'PO A–D', pos: ['A', 'B', 'C', 'D'] },
        { label: 'Det 2', range: 'PO E–H', pos: ['E', 'F', 'G', 'H'] },
        { label: 'Det 3', range: 'PO I–L', pos: ['I', 'J', 'K', 'L'] },
    ];
    const detAverage = (poIds) => {
        const pos = evalAttainment?.pos || {};
        const vals = poIds.map(p => pos[p]?.attainment).filter(v => v != null);
        if (!vals.length) return null;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    };
    const surveyStatusLabel = (type) => {
        const s = evalSurveys?.[type];
        return s === 'answered' ? 'Completed' : 'Pending';
    };

    // ─── Reports & Analytics derived data (from the DB) ──────────────────────
    const reportStudents = reportData?.students || [];
    const reportFiltered = checklistBatch === 'All'
        ? reportStudents
        : reportStudents.filter(s => s.batch === checklistBatch);

    const r_total = reportFiltered.length;
    const r_soCompleted = reportFiltered.filter(s => s.so_answered).length;
    const r_peoCompleted = reportFiltered.filter(s => s.peo_answered).length;
    const r_soRate = r_total ? Math.round((r_soCompleted / r_total) * 100) : 0;

    const gtsSchema = reportData?.gts?.schema || [];
    const gtsResponses = reportData?.gts?.responses || [];
    const gtsAnalyticsVariables = gtsSchema.filter(q =>
        ['radio', 'dropdown', 'yesno', 'checkbox'].includes(q.type)
    );

    const gtsAnalyticsResults = (() => {
        const counts = {};
        let total = 0;
        gtsResponses.forEach(r => {
            const val = r.answers?.[gtsAnalyticsField];
            if (val == null || val === '') return;
            (Array.isArray(val) ? val : [val]).forEach(v => {
                counts[v] = (counts[v] || 0) + 1;
                total++;
            });
        });
        return Object.entries(counts).map(([k, v]) => ({
            _id: k,
            frequency: v,
            percent: total ? (v / total) * 100 : 0,
        }));
    })();
    const gtsTotalRespondents = gtsResponses.length;
    const gtsAnswerTotal = gtsAnalyticsResults.reduce((sum, r) => sum + r.frequency, 0);

    const fmtPct = (v) => (v == null ? 'N/A' : `${v}%`);

    return (
        <div className="portal-layout">

            <PCSidebar 
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
                router={router}
            />

            <main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
                {activeMenu === 'overview' && (
                    <ProgramOverview 
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        setSelectedSurveyView={setSelectedSurveyView}
                        setSurveySubTab={setSurveySubTab}
                    />
                )}

                {activeMenu === 'masterlist' && (
                    <Masterlist
                        selectedBatch={selectedBatch}
                        setSelectedBatch={setSelectedBatch}
                        displayStudents={displayStudents}
                        setSelectedStudent={setSelectedStudent}
                    />
                )}

                {activeMenu === 'direct' && (
                    <Direct 
                        showToast={showToast}
                        courseWeights={courseWeights}
                        setCourseWeights={setCourseWeights}
                        courseMappings={courseMappings}
                    />
                )}

                {activeMenu === 'indirect' && (
                    <Indirect 
                        selectedSurveyView={selectedSurveyView}
                        setSelectedSurveyView={setSelectedSurveyView}
                        surveySubTab={surveySubTab}
                        setSurveySubTab={setSurveySubTab}
                        surveyDetailBatch={surveyDetailBatch}
                        setSurveyDetailBatch={setSurveyDetailBatch}
                        surveyDetailStudents={surveyDetailBatch}
                        openSurveyModal={openSurveyModal}
                        tracerRate={tracerRate}
                        poRate={poRate}
                        showToast={showToast}

                    />

                )}

                {activeMenu === 'determinants' && (
                    <Determinants 
                        courseMappings={courseMappings}
                        setCourseMappings={setCourseMappings}
                        showToast={showToast}
                    />

                )}
        
                {activeMenu === 'analytics' && (
                    <div id="printable-report" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Print-only letterhead (hidden on screen) */}
                        <div className="print-only report-letterhead">
                            <div className="letterhead-top">
                                <img src="/cdm-logo.png" alt="CDM Logo" className="letterhead-logo" />
                                <div className="letterhead-titles">
                                    <p className="lh-republic">Republic of the Philippines</p>
                                    <h2 className="lh-school">COLEGIO DE MUNTINLUPA</h2>
                                    <p className="lh-dept">Department of Computer Engineering</p>
                                    <p className="lh-system">Outcomes-Based Education Management System</p>
                                </div>
                                <img src="/cpe-logo.png" alt="CpE Logo" className="letterhead-logo" />
                            </div>
                            <div className="letterhead-divider" />
                            <div className="letterhead-meta">
                                <h1 className="lh-report-title">
                                    {reportType === 'direct' ? 'Direct Assessment Report'
                                        : reportType === 'indirect' ? 'Indirect Assessment Report'
                                        : 'Graduate Tracer Study Report'}
                                </h1>
                                <div className="lh-report-sub">
                                    <span>B.S. Computer Engineering</span>
                                    <span>A.Y. 2025–2026</span>
                                    <span>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pc-header screen-only" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Reports & Analytics</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Select a report module to view collected data and export to PDF.</p>
                            </div>
                            <button className="primary-btn" onClick={handleExportPDF} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                🖨️ Export as PDF
                            </button>
                        </div>

                        <div className="tab-container screen-only" style={{ marginBottom: '20px' }}>
                            <button className={`tab-btn ${reportType === 'direct' ? 'active' : ''}`} onClick={() => setReportType('direct')}>
                                📝 Direct Assessment
                            </button>
                            <button className={`tab-btn ${reportType === 'indirect' ? 'active' : ''}`} onClick={() => setReportType('indirect')}>
                                📊 Indirect Assessment
                            </button>
                            <button className={`tab-btn ${reportType === 'gts' ? 'active' : ''}`} onClick={() => setReportType('gts')}>
                                🎓 Graduate Tracer Study
                            </button>
                        </div>

                        <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease' }}>
                            
                            {reportType === 'direct' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>Direct Assessment Grades</h3>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '5px' }}>Evaluated outcomes based on mapped courses.</p>
                                        </div>
                                        <select className="correction-textbox" style={{ height: '35px', padding: '0 10px', width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }} value={checklistBatch} onChange={(e) => setChecklistBatch(e.target.value)}>
                                            <option value="All">All Batches</option>
                                            <option value="2024">Batch 2024</option>
                                            <option value="2025">Batch 2025</option>
                                            <option value="2026">Batch 2026</option>
                                            <option value="2027">Batch 2027</option>
                                            <option value="2028">Batch 2028</option>
                                        </select>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Name</th>
                                                    <th>Batch</th>
                                                    <th>Det 1 (PO a-d)</th>
                                                    <th>Det 2 (PO e-h)</th>
                                                    <th>Det 3 (PO i-l)</th>
                                                    <th>Final Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportFiltered.map((student, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                        <td>{student.batch}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{fmtPct(student.det1)}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{fmtPct(student.det2)}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{fmtPct(student.det3)}</td>
                                                        <td>
                                                            <span className={`status-badge ${student.directStatus === 'Pending' ? 'badge-pending' : 'badge-passed'}`}>
                                                                {student.directStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {!reportLoading && reportFiltered.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                            No records found for this batch.
                                                        </td>
                                                    </tr>
                                                )}
                                                {reportLoading && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                            Loading…
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {reportType === 'indirect' && (
                                <>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <button 
                                            onClick={() => setIndirectReportTab('1stYear')} 
                                            style={{ 
                                                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                                                border: indirectReportTab === '1stYear' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', 
                                                backgroundColor: indirectReportTab === '1stYear' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(0,0,0,0.2)', 
                                                color: indirectReportTab === '1stYear' ? 'var(--gold)' : 'var(--text-main)', 
                                                fontWeight: indirectReportTab === '1stYear' ? 'bold' : 'normal'
                                            }}
                                        >
                                            SO Survey (Yearly Update)
                                        </button>
                                        <button 
                                            onClick={() => setIndirectReportTab('3to5Year')} 
                                            style={{ 
                                                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                                                border: indirectReportTab === '3to5Year' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', 
                                                backgroundColor: indirectReportTab === '3to5Year' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(0,0,0,0.2)', 
                                                color: indirectReportTab === '3to5Year' ? 'var(--gold)' : 'var(--text-main)', 
                                                fontWeight: indirectReportTab === '3to5Year' ? 'bold' : 'normal'
                                            }}
                                        >
                                            3-5 Year (PEO Survey)
                                        </button>
                                    </div>

                                    {indirectReportTab === '1stYear' && (
                                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <div>
                                                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>SO Survey Compliance</h3>
                                                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '5px' }}>Yearly update respondents tracking.</p>
                                                </div>
                                                <select className="correction-textbox" style={{ height: '35px', padding: '0 10px', width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }} value={checklistBatch} onChange={(e) => setChecklistBatch(e.target.value)}>
                                                    <option value="All">All Batches</option>
                                                    <option value="2024">Batch 2024</option>
                                                    <option value="2025">Batch 2025</option>
                                                    <option value="2026">Batch 2026</option>
                                                    <option value="2027">Batch 2027</option>
                                                    <option value="2028">Batch 2028</option>
                                                </select>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <h4 style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '10px' }}>Total Target Respondents</h4>
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{r_total}</div>
                                                </div>
                                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <h4 style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '10px' }}>SO Survey Completion Rate</h4>
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{r_soRate}%</div>
                                                </div>
                                            </div>

                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Student ID</th>
                                                            <th>Name</th>
                                                            <th>Batch</th>
                                                            <th>SO Survey Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportFiltered.map((student, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                                <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                                <td>{student.batch}</td>
                                                                <td>
                                                                    <span className={`status-badge ${student.so_answered ? 'badge-passed' : 'badge-pending'}`}>
                                                                        {student.so_answered ? 'Completed' : 'Pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {!reportLoading && reportFiltered.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                                    No records found for this batch.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {indirectReportTab === '3to5Year' && (
                                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <div>
                                                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>PEO Survey Compliance</h3>
                                                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '5px' }}>3-5 Year Graduate respondents tracking.</p>
                                                </div>
                                                <select className="correction-textbox" style={{ height: '35px', padding: '0 10px', width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }} value={checklistBatch} onChange={(e) => setChecklistBatch(e.target.value)}>
                                                    <option value="All">All Batches</option>
                                                    <option value="2024">Batch 2024</option>
                                                    <option value="2025">Batch 2025</option>
                                                    <option value="2026">Batch 2026</option>
                                                    <option value="2027">Batch 2027</option>
                                                    <option value="2028">Batch 2028</option>
                                                </select>
                                            </div>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Student ID</th>
                                                            <th>Name</th>
                                                            <th>Batch</th>
                                                            <th>PEO Survey Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportFiltered.map((student, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                                <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                                <td>{student.batch}</td>
                                                                <td>
                                                                    <span className={`status-badge ${student.peo_answered ? 'badge-passed' : 'badge-pending'}`}>
                                                                        {student.peo_answered ? 'Completed' : 'Pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {!reportLoading && reportFiltered.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                                    No records found for this batch.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                </>
                            )}

                            {reportType === 'gts' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>Graduate Tracer Study Responses</h3>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '5px' }}>Individual answers mapped from the dynamic questionnaire.</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className={`outline-btn ${gtsReportTab === 'raw' ? 'active' : ''}`} onClick={() => setGtsReportTab('raw')} style={{ padding: '8px 16px', backgroundColor: gtsReportTab === 'raw' ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: gtsReportTab === 'raw' ? 'var(--gold)' : '' }}>Full Data</button>
                                            <button className={`outline-btn ${gtsReportTab === 'custom' ? 'active' : ''}`} onClick={() => setGtsReportTab('custom')} style={{ padding: '8px 16px', backgroundColor: gtsReportTab === 'custom' ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: gtsReportTab === 'custom' ? 'var(--gold)' : '' }}>Custom Builder</button>
                                            <button className={`outline-btn ${gtsReportTab === 'analytics' ? 'active' : ''}`} onClick={() => setGtsReportTab('analytics')} style={{ padding: '8px 16px', backgroundColor: gtsReportTab === 'analytics' ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: gtsReportTab === 'analytics' ? 'var(--gold)' : '' }}>Analytics</button>
                                        </div>
                                    </div>

                                    {gtsReportTab === 'custom' && (
                                        <div style={{ marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.3s ease' }}>
                                            <h4 style={{ margin: '0 0 15px 0', color: 'var(--gold)', fontSize: '1.1rem' }}>Select Columns to Display</h4>
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {gtsSchema.map(q => (
                                                    <label key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', border: selectedGtsCols.includes(q.id) ? '1px solid var(--gold)' : '1px solid transparent' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedGtsCols.includes(q.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedGtsCols([...selectedGtsCols, q.id]);
                                                                else setSelectedGtsCols(selectedGtsCols.filter(id => id !== q.id));
                                                            }}
                                                            style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }}
                                                        />
                                                        {q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {gtsReportTab === 'analytics' && (
                                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                                <select
                                                    className="control-select custom-select-arrow"
                                                    style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', width: '250px' }}
                                                    value={gtsAnalyticsField}
                                                    onChange={(e) => setGtsAnalyticsField(e.target.value)}
                                                >
                                                    {gtsAnalyticsVariables.length === 0 && <option value="">No categorical questions</option>}
                                                    {gtsAnalyticsVariables.map(v => (
                                                        <option key={v.id} value={v.id}>{v.text}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                                    <thead style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                                                        <tr>
                                                            <th style={{ padding: '15px 20px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>Category Variables</th>
                                                            <th style={{ padding: '15px 20px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>Frequency (f)</th>
                                                            <th style={{ padding: '15px 20px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>Percentage (%)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gtsAnalyticsResults.map((item, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{item._id}</td>
                                                                <td style={{ padding: '12px 20px', textAlign: 'center' }}>{item.frequency}</td>
                                                                <td style={{ padding: '12px 20px', textAlign: 'center' }}>{item.percent.toFixed(2)}%</td>
                                                            </tr>
                                                        ))}
                                                        {gtsAnalyticsResults.length === 0 && (
                                                            <tr>
                                                                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)' }}>
                                                                    No responses for this question yet.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                                            <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Total Responses (N)</td>
                                                            <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: 'bold' }}>{gtsAnswerTotal}</td>
                                                            <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: 'bold' }}>{gtsAnswerTotal ? '100.00%' : '0.00%'}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {(gtsReportTab === 'raw' || gtsReportTab === 'custom') && (
                                        <div style={{ overflowX: 'auto', maxHeight: '65vh', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                                <thead style={{ backgroundColor: 'rgba(0,0,0,0.6)', position: 'sticky', top: 0, zIndex: 10 }}>
                                                    <tr>
                                                        <th style={{ padding: '15px 20px', minWidth: '200px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>Alumni Name</th>
                                                        <th style={{ padding: '15px 20px', minWidth: '120px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>Batch</th>
                                                        {(gtsReportTab === 'custom' ? gtsSchema.filter(q => selectedGtsCols.includes(q.id)) : gtsSchema).map(q => (
                                                            <th key={q.id} style={{ padding: '15px 20px', minWidth: '220px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{q.text}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gtsResponses.map((response, idx) => (
                                                        <tr
                                                            key={idx}
                                                            style={{ backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background-color 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                                                        >
                                                            <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: 'var(--text-main)' }}>{response.name}</td>
                                                            <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>Batch {response.batch}</td>
                                                            {(gtsReportTab === 'custom' ? gtsSchema.filter(q => selectedGtsCols.includes(q.id)) : gtsSchema).map(q => {
                                                                const ans = response.answers?.[q.id];
                                                                const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || '-');
                                                                return (
                                                                    <td key={q.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                                                        {displayAns}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                    {!reportLoading && gtsResponses.length === 0 && (
                                                        <tr>
                                                            <td colSpan={2 + (gtsReportTab === 'custom' ? gtsSchema.filter(q => selectedGtsCols.includes(q.id)).length : gtsSchema.length)} style={{ padding: '25px', textAlign: 'center', color: 'var(--text-sub)' }}>
                                                                No tracer study responses submitted yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Print-only footer / signatories */}
                        <div className="print-only report-footer">
                            <div className="footer-signatories">
                                <div className="sign-block">
                                    <div className="sign-line" />
                                    <p className="sign-name">Program Chair</p>
                                    <p className="sign-role">Department of Computer Engineering</p>
                                </div>
                                <div className="sign-block">
                                    <div className="sign-line" />
                                    <p className="sign-name">Dean</p>
                                    <p className="sign-role">College of Engineering</p>
                                </div>
                            </div>
                            <p className="footer-note">
                                This report was generated by the CDM-OBE Centralized Management System. Figures are computed from official records as of the generation date.
                            </p>
                        </div>
                    </div>
                )}

                {toastMessage && (
                    <div style={{
                        position: 'fixed', bottom: '30px', right: '30px', 
                        backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#3b82f6', 
                        color: 'white', padding: '15px 25px',
                        borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px',
                        zIndex: 1000, animation: 'fadeIn 0.3s ease'
                    }}>
                        <span style={{ fontWeight: '500' }}>
                            {toastMessage.type === 'success' && '✅ '}
                            {toastMessage.type === 'trash' && '🗑️ '}
                            {toastMessage.text}
                        </span>
                        <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0 0 10px', marginLeft: 'auto' }}>×</button>
                    </div>
                )}

            </main>

            {selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '650px', width: '90%' }}>
                        <h2 style={{ color: 'var(--gold)', marginBottom: '5px' }}>Alumni Evaluation Record</h2>
                        
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedStudent.name}</h3>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: '5px 0' }}>
                                {selectedStudent.id} | Batch {selectedStudent.batch} | {selectedStudent.program}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '10px' }}>Employment Profile</h4>
                                <p style={{ fontSize: '1rem', fontWeight: '500', textTransform: 'capitalize' }}>
                                    {selectedStudent.employment_status || 'Not Updated'}
                                </p>
                                {selectedStudent.employment_status === 'employed' && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '5px' }}>
                                        {selectedStudent.job_title || 'No title'} @ {selectedStudent.company_name || 'No company'}
                                    </p>
                                )}
                            </div>
                            <div style={{ flex: '1 1 200px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '10px' }}>Indirect Assessment {evalLoading && <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>· loading…</span>}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Yearly (SO) Survey:</span>
                                    <span style={{ fontSize: '0.9rem', color: surveyStatusLabel('so_survey') === 'Completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{surveyStatusLabel('so_survey')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Tracer Study:</span>
                                    <span style={{ fontSize: '0.9rem', color: surveyStatusLabel('tracer_study') === 'Completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{surveyStatusLabel('tracer_study')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>PEO Survey:</span>
                                    <span style={{ fontSize: '0.9rem', color: surveyStatusLabel('graduate_survey') === 'Completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{surveyStatusLabel('graduate_survey')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Employer Form:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'capitalize' }}>{selectedStudent.employer_status || 'Pending'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,215,0,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '25px' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '10px' }}>Direct Assessment (OBE Grading)</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '15px', lineHeight: '1.4' }}>
                                Outcome attainment computed from the student's graded determinant courses (weighted per Program Outcome).
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {DET_GROUPS.map(group => {
                                    const avg = detAverage(group.pos);
                                    const color = avg == null ? 'var(--text-sub)' : avg >= 75 ? '#10b981' : avg >= 50 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <div key={group.label}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>{group.label} <span style={{ color: 'var(--text-sub)', fontWeight: 'normal' }}>({group.range})</span></label>
                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color }}>{avg == null ? 'Pending' : `${avg}%`}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${avg == null ? 0 : Math.min(avg, 100)}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {!evalLoading && !evalAttainment?.hasGrades && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                                        No graded determinant courses yet for this student.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                className="cancel-btn outline-btn"
                                onClick={() => setSelectedStudent(null)}
                                style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {surveyModalStudent && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <h2 style={{ color: 'var(--gold)', margin: 0 }}>Respondent Answers</h2>
                            {!isEditingSurvey && respondentTab === 'answers' && (
                                <button
                                    className="outline-btn"
                                    onClick={() => setIsEditingSurvey(true)}
                                    style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px' }}
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{surveyModalStudent.name}</h3>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: '5px 0' }}>
                                {surveyModalStudent.id} | Batch {surveyModalStudent.batch}
                            </p>
                        </div>

                        <div className="tab-container" style={{ marginBottom: '20px', marginTop: '15px' }}>
                            <button className={`tab-btn ${respondentTab === 'answers' ? 'active' : ''}`} onClick={() => setRespondentTab('answers')}>
                                📝 Respondent Answers
                            </button>
                            <button className={`tab-btn ${respondentTab === 'info' ? 'active' : ''}`} onClick={() => setRespondentTab('info')}>
                                👤 Respondent Information
                            </button>
                        </div>

                        {respondentTab === 'answers' ? (
                            <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {surveyModalQuestions.length === 0 ? (
                                    <p style={{ color: 'var(--text-sub)' }}>No questions found in this survey schema.</p>
                                ) : (
                                    surveyModalQuestions.map((q, idx) => (
                                        <div key={q.id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1rem' }}>{idx + 1}. {q.text}</p>
                                            
                                            {q.type === 'text' || q.type === 'email' || q.type === 'date' ? (
                                                <input type={q.type === 'date' ? 'date' : 'text'} className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: isEditingSurvey ? 1 : 0.7 }} disabled={!isEditingSurvey} value={surveyModalAnswers[q.id] || ''} onChange={e => handleSurveyAnswerChange(q.id, e.target.value)} />
                                            ) : q.type === 'textarea' ? (
                                                <textarea className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', height: '80px', resize: 'vertical', opacity: isEditingSurvey ? 1 : 0.7 }} disabled={!isEditingSurvey} value={surveyModalAnswers[q.id] || ''} onChange={e => handleSurveyAnswerChange(q.id, e.target.value)} />
                                            ) : q.type === 'likert' ? (
                                                <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: isEditingSurvey ? 1 : 0.7 }} disabled={!isEditingSurvey} value={surveyModalAnswers[q.id] || ''} onChange={e => handleSurveyAnswerChange(q.id, e.target.value)}>
                                                    <option value="">Select rating...</option>
                                                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            ) : q.type === 'yesno' ? (
                                                <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: isEditingSurvey ? 1 : 0.7 }} disabled={!isEditingSurvey} value={surveyModalAnswers[q.id] || ''} onChange={e => handleSurveyAnswerChange(q.id, e.target.value)}>
                                                    <option value="">Select option...</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            ) : (q.type === 'radio' || q.type === 'dropdown') ? (
                                                <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: isEditingSurvey ? 1 : 0.7 }} disabled={!isEditingSurvey} value={surveyModalAnswers[q.id] || ''} onChange={e => handleSurveyAnswerChange(q.id, e.target.value)}>
                                                    <option value="">Select option...</option>
                                                    {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : q.type === 'checkbox' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {q.options?.map((opt, i) => {
                                                        const currentAns = Array.isArray(surveyModalAnswers[q.id]) ? surveyModalAnswers[q.id] : [];
                                                        return (
                                                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: isEditingSurvey ? 'pointer' : 'default', opacity: isEditingSurvey ? 1 : 0.7 }}>
                                                                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} disabled={!isEditingSurvey} checked={currentAns.includes(opt)} onChange={(e) => {
                                                                    let newArr = [...currentAns];
                                                                    if (e.target.checked) newArr.push(opt);
                                                                    else newArr = newArr.filter(v => v !== opt);
                                                                    handleSurveyAnswerChange(q.id, newArr);
                                                                }} />
                                                                {opt}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ color: 'var(--gold)', marginBottom: '15px', marginTop: 0 }}>Student Profile</h3>
                                    <p><strong>Name:</strong> {surveyModalStudent.name}</p>
                                    <p><strong>Student ID:</strong> {surveyModalStudent.id}</p>
                                    <p><strong>Batch Year:</strong> {surveyModalStudent.batch}</p>
                                    <p><strong>Program:</strong> {surveyModalStudent.program || 'B.S. Computer Engineering'}</p>
                                    
                                    <h3 style={{ color: 'var(--gold)', marginBottom: '15px', marginTop: '25px' }}>Compliance Status</h3>
                                    <p><strong>SO Survey (Yearly Update):</strong> <span className={`status-badge ${surveyModalStudent.surveyProgress === '100%' ? 'badge-passed' : 'badge-pending'}`} style={{ marginLeft: '10px' }}>{surveyModalStudent.surveyProgress === '100%' ? 'Completed' : 'Pending'}</span></p>
                                    <p style={{ marginTop: '10px' }}><strong>Graduate Tracer Study:</strong> <span className={`status-badge ${surveyModalStudent.tracerProgress === '100%' ? 'badge-passed' : 'badge-pending'}`} style={{ marginLeft: '10px' }}>{surveyModalStudent.tracerProgress === '100%' ? 'Completed' : 'Pending'}</span></p>
                                    <p style={{ marginTop: '10px' }}><strong>PEO Survey (3-5 Years):</strong> <span className={`status-badge ${surveyModalStudent.peoProgress === '100%' ? 'badge-passed' : 'badge-pending'}`} style={{ marginLeft: '10px' }}>{surveyModalStudent.peoProgress === '100%' ? 'Completed' : 'Pending'}</span></p>

                                    <h3 style={{ color: 'var(--gold)', marginBottom: '15px', marginTop: '25px' }}>Employment Details</h3>
                                    <p><strong>Current Status:</strong> <span style={{ textTransform: 'capitalize' }}>{surveyModalStudent.employmentStatus || 'Not Updated'}</span></p>
                                    {surveyModalStudent.employmentStatus === 'employed' && (
                                        <>
                                            <p style={{ marginTop: '5px' }}><strong>Job Title:</strong> {surveyModalStudent.jobTitle || 'N/A'}</p>
                                            <p style={{ marginTop: '5px' }}><strong>Company:</strong> {surveyModalStudent.companyName || 'N/A'}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="cancel-btn outline-btn" onClick={() => setSurveyModalStudent(null)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}>
                                    {isEditingSurvey ? 'Cancel' : 'Close'}
                                </button>
                                {isEditingSurvey && (
                                    <button className="primary-btn" onClick={saveSurveyAnswers} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1, border: 'none' }}>Save Changes</button>
                                )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: var(--bg-main);
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: var(--gold);
                }

                /* Print-only elements are hidden on screen */
                .print-only { display: none; }

                @media print {
                    @page {
                        margin: 20mm;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-report, #printable-report * {
                        visibility: visible;
                    }
                    #printable-report {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .sidebar, .primary-btn, .outline-btn, .tab-btn, .screen-only {
                        display: none !important;
                    }

                    /* ── Print-only branded letterhead ───────────────────── */
                    .print-only { display: block !important; }

                    .report-letterhead { text-align: center; margin-bottom: 8px; }
                    .letterhead-top {
                        display: flex; align-items: center; justify-content: center; gap: 24px;
                    }
                    .letterhead-logo {
                        width: 80px; height: 80px; object-fit: contain;
                        -webkit-print-color-adjust: exact; print-color-adjust: exact;
                    }
                    .letterhead-titles { text-align: center; }
                    .lh-republic { margin: 0; font-size: 11px; color: #000 !important; }
                    .lh-school {
                        margin: 2px 0; font-size: 22px; font-weight: 800;
                        color: #000 !important; letter-spacing: 1px;
                    }
                    .lh-dept { margin: 2px 0; font-size: 13px; color: #000 !important; }
                    .lh-system { margin: 2px 0; font-size: 11px; font-style: italic; color: #333 !important; }
                    .letterhead-divider { border-bottom: 3px double #000; margin: 10px 0 12px; }
                    .letterhead-meta { text-align: center; margin-bottom: 6px; }
                    .lh-report-title {
                        margin: 0; font-size: 18px; font-weight: 700;
                        color: #000 !important; text-transform: uppercase; letter-spacing: 0.5px;
                    }
                    .lh-report-sub {
                        display: flex; justify-content: center; gap: 20px;
                        font-size: 11px; color: #333 !important; margin-top: 5px;
                    }

                    /* ── Print-only footer / signatories ─────────────────── */
                    .report-footer { margin-top: 28px; page-break-inside: avoid; }
                    .footer-signatories {
                        display: flex; justify-content: space-around; gap: 50px; margin-top: 45px;
                    }
                    .sign-block { text-align: center; flex: 1; }
                    .sign-line { border-top: 1px solid #000; margin: 0 auto 6px; width: 85%; }
                    .sign-name { margin: 0; font-weight: bold; font-size: 12px; color: #000 !important; }
                    .sign-role { margin: 2px 0 0; font-size: 10px; color: #333 !important; }
                    .footer-note {
                        margin-top: 24px; font-size: 9px; color: #555 !important;
                        text-align: center; font-style: italic;
                        border-top: 1px solid #ccc; padding-top: 8px;
                    }
                    .portal-card, div[style*="overflow"], div[style*="maxHeight"] {
                        box-shadow: none !important;
                        border: none !important;
                        background: transparent !important;
                        overflow: visible !important;
                        max-height: none !important;
                        height: auto !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-top: 20px;
                        table-layout: fixed !important; /* Pinipigilan ang table na lumagpas sa papel */
                    }
                    th, td {
                        border: 1px solid #000000 !important;
                        padding: 12px 10px !important;
                        color: #000000 !important;
                        background-color: transparent !important;
                        white-space: normal !important;
                        word-wrap: break-word;
                    }
                    th {
                        background-color: #f2f2f2 !important;
                        -webkit-print-color-adjust: exact;
                        font-weight: bold !important;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    
                    div[style*="justify-content: flex-end"] {
                        justify-content: flex-start !important;
                        margin-bottom: 5px !important;
                    }
                    select.control-select {
                        appearance: none;
                        -webkit-appearance: none;
                        border: none !important;
                        background: transparent !important;
                        color: #000000 !important;
                        font-size: 1.4rem !important;
                        font-weight: bold !important;
                        padding: 0 !important;
                        width: 100% !important;
                        text-align: left !important;
                        white-space: normal !important;
                        word-wrap: break-word !important;
                        pointer-events: none;
                    }
                }
            `}} />
        </div>
    );
}
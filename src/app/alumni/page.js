'use client';

import React, { useState, useEffect, act } from 'react';
import { useRouter } from 'next/navigation';
import './alumni-globals.css';

//==================================
// COMPONENTS
//==================================
import AlumniSidebar from './components/AlumniSidebar';
import DataCorrection from './components/DataCorrection';
import StartPEO from './components/StartPEO';

//==================================
// SERVICES
//==================================
import { getAccountLink } from '@/services/accountLinkService';
import { getSurveysByVersionAndType, getSurveyById } from '@/services/surveyServices';
import { getAnsweredSurveysByTypeAndVersion } from '@/services/answeredSurveyService';
import { createAnsweredSurvey } from '@/services/answeredSurveyService';
import { updateStudent } from '@/services/masterlistService';
import { getObeAttainment } from '@/services/obeAttainmentService';

//==================================
// HOOKS
//==================================
import { useCurrentUser } from '@/hooks/useCurrentUser';

//==================================
// UTILS
//==================================
import { isGraduate, getGraduationYear } from '@/shared/utils/graduation';


const PO_DEFINITIONS = [
    { id: 'A', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics, natural science, engineering fundamentals and an engineering specialization to the solution of complex engineering problems.' },
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

export default function AlumniDashboard() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [surveyTab, setSurveyTab] = useState('peo');

    const [surveyModalType, setSurveyModalType] = useState(null);
    const [surveyModalQuestions, setSurveyModalQuestions] = useState([]);
    const [surveyModalAnswers, setSurveyModalAnswers] = useState({});

    const [activeModal, setActiveModal] = useState(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [dbUser, setDbUser] = useState(null);

    // Computed PO attainment from the student's actual course grades
    const [poAttainment, setPoAttainment] = useState({});
    const [obeHasGrades, setObeHasGrades] = useState(false);

    const [employerStatus, setEmployerStatus] = useState('Pending');
    const [employmentStatus, setEmploymentStatus] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [savedJobStatus, setSavedJobStatus] = useState('Not Updated');
    const [showInviteBtn, setShowInviteBtn] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [accountLink, setAccountLink] = useState(null);
    const [loadingAccountLink, setLoadingAccountLink] = useState(true);

    const [userData, setUserData] = useState({
        id: '',
        name: 'Loading...',
        batch: '2026',
        program: 'Loading...',
        initials: '...'
    });

    const [surveys, setSurveys] = useState({
        so_survey: null,
        graduate_survey: null,
        tracer_study: null,
    });

    const [surveyStatus, setSurveyStatus] = useState({
    so_survey: false,
    graduate_survey: false,
    tracer_study: false
});

const [surveyInitLoading, setSurveyInitLoading] = useState(true);
    const currentUser = useCurrentUser();

    useEffect(() => {
        if (!currentUser?.auth?.id) return;

        const loadAccountLink = async () => {
            try {
                const res = await getAccountLink({
                    user_account_id: currentUser.auth.id,
                });

                setAccountLink(res);

                const roleAccount = res?.roleAccount;

                if (roleAccount) {
                    const nameParts = (roleAccount.name || '').split(' ').filter(Boolean);
                    let initials = 'AL';
                    if (nameParts.length >= 2) {
                        initials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase();
                    } else if (nameParts.length === 1) {
                        initials = nameParts[0].substring(0, 2).toUpperCase();
                    }

                    setUserData({
                        id: res?.roleAccount?._id || '',
                        name: res?.roleAccount?.name || 'Unknown',
                        batch: res?.roleAccount?.batch || '2026',
                        program: res?.roleAccount?.program || 'BS Computer Engineering',
                        initials,
                    });

                    setDbUser(roleAccount);

                    // Hydrate the employment / employer-evaluation state from the DB
                    setSavedJobStatus(roleAccount.employment_status || 'Not Updated');
                    setEmployerStatus(roleAccount.employer_status || 'Pending');
                }

                console.log('✅ Account Link loaded:', res);
                console.log('✅ roleAccount:', res?.roleAccount);
                console.log('✅ userData set:', {
                    name: res?.roleAccount?.name,
                    batch: res?.roleAccount?.batch,
                    program: res?.roleAccount?.program,
                });
                
                console.log('TEST', res)



            } catch (err) {
                console.error('❌ loadAccountLink error:', err);
            } finally {
                setLoadingAccountLink(false);
            }
        };

        loadAccountLink();
    }, [currentUser?.auth?.id]);

useEffect(() => {
    if (!userData?.id) return;

    if (typeof window === "undefined") return;

    window.localStorage.setItem(
        "current_user",
        JSON.stringify(userData)
    );
}, [userData]);

    useEffect(() => {
        async function initSurveys() {
            try {
                setSurveyInitLoading(true);

                const currentYear = new Date().getFullYear().toString();

                const session = JSON.parse(localStorage.getItem('current_user') || '{}');

                if (!session?.id) return;

                const surveyTypes = [
                    'so_survey',
                    'graduate_survey',
                    'tracer_study'
                ];

                const resultMap = {
                    so_survey: false,
                    graduate_survey: false,
                    tracer_study: false
                };

                await Promise.all(
                    surveyTypes.map(async (type) => {
                        const data = await getAnsweredSurveysByTypeAndVersion(
                            type,
                            currentYear
                        );

                        // Scope to THIS user only — the endpoint returns
                        // every student's records for the type + version.
                        const userRecords = (data || []).filter(
                            (item) => item.student_id === session.id
                        );

                        // No record for this user → create one
                        if (userRecords.length === 0) {
                            await createAnsweredSurvey({
                                student_id: session.id,
                                batch: session.batch,
                                program: session.program,
                                name: session.name,
                                survey_id: null,
                                survey_type: type,
                                survey_version: currentYear,
                                answers: null,
                                status: "pending"
                            });

                            resultMap[type] = false;
                            return;
                        }

                        // Mark complete only if THIS user has an answered record
                        const isAnswered = userRecords.some(
                            (item) => item.status === "answered"
                        );

                        resultMap[type] = isAnswered;
                    })
                );

                setSurveyStatus(resultMap);

            } catch (error) {
                console.error("Survey init failed:", error);
            } finally {
                setSurveyInitLoading(false);
            }
        }

        initSurveys();
    }, []);

    // Compute the student's PO attainment from their actual course grades.
    // This single call also supplies the Curriculum Mapping (course + weight
    // per PO, sourced from the determinants mapping like the PC Direct page).
    useEffect(() => {
        if (!userData?.id) return;

        async function loadAttainment() {
            try {
                const result = await getObeAttainment(userData.id);
                setPoAttainment(result?.pos || {});
                setObeHasGrades(!!result?.hasGrades);
            } catch (err) {
                console.error('Failed to load PO attainment:', err);
            }
        }

        loadAttainment();
    }, [userData?.id]);

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

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('current_user');
            router.push('/');
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Prefill the modal with the current values, then open it
    const openJobUpdate = () => {
        setEmploymentStatus(dbUser?.employment_status || '');
        setJobTitle(dbUser?.job_title || '');
        setCompanyName(dbUser?.company_name || '');
        setActiveModal('jobUpdate');
    };

    const handleSaveJobUpdate = async () => {
        if (!dbUser) return;

        if (!employmentStatus) {
            showToast('Please select an employment status.');
            return;
        }

        const isEmployed = employmentStatus === 'employed';

        // Employer evaluation only applies when employed.
        // Preserve an in-progress evaluation; otherwise reset to Pending.
        const nextEmployerStatus = isEmployed
            ? (dbUser.employer_status || 'Pending')
            : 'Pending';

        const updates = {
            employment_status: employmentStatus,
            job_title: isEmployed ? jobTitle : '',
            company_name: isEmployed ? companyName : '',
            employer_status: nextEmployerStatus,
        };

        try {
            // Persist to the student document (matched by student-number `id`)
            await updateStudent(dbUser.id, updates);

            setDbUser({ ...dbUser, ...updates });
            setSavedJobStatus(employmentStatus);
            setEmployerStatus(nextEmployerStatus);
            setActiveModal(null);
            showToast('Job Status Updated!');
        } catch (err) {
            console.error('Failed to update employment status:', err);
            showToast('Failed to update. Please try again.');
        }
    };

    const handleSendInvite = async () => {
        if (!dbUser) return;

        try {
            await updateStudent(dbUser.id, { employer_status: 'sent' });

            setDbUser({ ...dbUser, employer_status: 'sent' });
            setEmployerStatus('sent');
            setIsInviteOpen(false);
            showToast('Official Invitation Sent!');
        } catch (err) {
            console.error('Failed to send invitation:', err);
            showToast('Failed to send invitation. Please try again.');
        }
    };

    const openReviewModal = async (sType) => {
        // Map the dashboard tab to the answered_survey survey_type
        const typeMap = {
            po: 'so_survey',
            yearly: 'so_survey',
            peo: 'graduate_survey',
            gts: 'tracer_study',
        };
        const surveyType = typeMap[sType];

        // Open the modal right away (questions/answers fill in once loaded)
        setSurveyModalQuestions([]);
        setSurveyModalAnswers({});
        setSurveyModalType(sType);

        if (!surveyType) return;

        try {
            const currentYear = new Date().getFullYear().toString();
            const session = JSON.parse(localStorage.getItem('current_user') || '{}');

            // Query answered_survey and keep only THIS user's record
            const data = await getAnsweredSurveysByTypeAndVersion(
                surveyType,
                currentYear
            );

            const record = (data || []).find(
                (item) => item.student_id === session.id
            );

            if (!record) return;

            // Answers come directly from the user's answered_survey record
            setSurveyModalAnswers(record.answers || {});

            // The question schema lives in the survey template (by survey_id),
            // falling back to the current year's template for this type.
            let survey = null;
            if (record.survey_id) {
                survey = await getSurveyById(record.survey_id);
            }
            if (!survey?.questions) {
                const fallback = await getSurveysByVersionAndType(
                    currentYear,
                    surveyType
                );
                survey = fallback?.[0] || null;
            }

            setSurveyModalQuestions(Object.values(survey?.questions || {}));
        } catch (err) {
            console.error('Failed to load review responses:', err);
        }
    };

    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(userData.batch) || currentYear;
    const yearsSinceGrad = currentYear - gradYear;

    // Graduation gate for the Graduate Tracer Study.
    // GTS unlocks only once the student has graduated
    // (current year > graduation year, where graduation year
    //  defaults to batch + 4 unless explicitly set).
    const studentForGrad = dbUser || userData;
    const graduationYear = getGraduationYear(studentForGrad);
    const isGTSAvailable = isGraduate(studentForGrad, currentYear);

    const isPOCompleted = dbUser?.surveyProgress === '100%';
    // Driven by the DB answered-status checks (see surveyStatus)
    const isGTSCompleted = surveyStatus.tracer_study;
    const isYearlyCompleted = surveyStatus.so_survey;
    const isPEOCompleted = dbUser?.peoProgress === '100%';

    const isPEORequired = yearsSinceGrad >= 3;
    const peoUnlockYear = gradYear + 3;

    // Required tasks: Yearly Update + Employment are always required;
    // GTS only after graduation; PEO only 3+ years after graduation.
    let requiredTasks = 2;
    if (isGTSAvailable) requiredTasks++;
    if (isPEORequired) requiredTasks++;

    let completedTasks = 0;
    let pendingList = [];

    // Yearly Update (so_survey) — always required
    if (surveyStatus.so_survey) completedTasks++; else pendingList.push(`Yearly Update (${currentYear})`);

    // Graduate Tracer Study — only once the student has graduated
    if (isGTSAvailable) {
        if (surveyStatus.tracer_study) completedTasks++; else pendingList.push('Graduate Tracer Study');
    }

    // PEO survey — only 3+ years after graduation
    if (isPEORequired) {
        if (surveyStatus.graduate_survey) completedTasks++; else pendingList.push('3-5 Year (PEO Survey)');
    }

    // Employment status — always required
    if (savedJobStatus === 'Not Updated') {
        pendingList.push('Update Employment Status');
    } else if (savedJobStatus === 'employed' && employerStatus === 'Pending') {
        pendingList.push('Send Employer Invitation');
    } else {
        completedTasks++;
    }

    const progressPercent = requiredTasks === 0 ? 0 : Math.round((completedTasks / requiredTasks) * 100);

    const activeTabStyle = {
        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold', fontSize: '0.9rem',
        backgroundColor: 'var(--gold)', color: '#111827', border: 'none', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)', display: 'flex', alignItems: 'center', gap: '8px'
    };

    const inactiveTabStyle = {
        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500', fontSize: '0.9rem',
        backgroundColor: 'transparent', color: 'var(--text-sub)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px'
    };

    const renderSurveyTabContent = () => {
        if (surveyTab === 'po') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>1st Year (PO Survey)</h2>
                        <span style={{ backgroundColor: isPOCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isPOCompleted ? '#10b981' : '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isPOCompleted ? 'Completed ✅' : 'Available 🟢'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Required for 1st-year graduates to assess early career alignment and basic attainment of Program Outcomes.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Estimated time to complete: 5-10 minutes.</li>
                            <li>Evaluates proficiency in core engineering principles.</li>
                            <li>Your responses are kept strictly confidential.</li>
                        </ul>
                    </div>
                    <button className={isPOCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => isPOCompleted ? openReviewModal('po') : router.push('/alumni/survey')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isPOCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                        {isPOCompleted ? 'Review Responses' : 'Start PO Survey'}
                    </button>
                </div>
            );
        }

        if (surveyTab === 'peo') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>3-5 Year (PEO Survey)</h2>
                        <span style={{ backgroundColor: isPEORequired ? (isPEOCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'rgba(255,255,255,0.1)', color: isPEORequired ? (isPEOCompleted ? '#10b981' : '#3b82f6') : 'var(--text-sub)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isPEORequired ? (isPEOCompleted ? 'Completed ✅' : 'Available 🟢') : 'Locked 🔒'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Evaluates career progression and advanced professional skills 3 to 5 years after graduation.
                    </p>

                   <StartPEO 
                        isPEOAnswered={surveyStatus.graduate_survey}
                        batch={userData.batch}
                        openReviewModal={openReviewModal}
                        router={router}
                   />
                </div>
            );
        }

        if (surveyTab === 'yearly') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Yearly Update Survey</h2>
                        <span style={{ backgroundColor: isYearlyCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: isYearlyCompleted ? '#10b981' : '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {isYearlyCompleted ? 'Completed ✅' : 'Available 🟢'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        A quick annual check-in to keep your employment profile updated for A.Y. <strong>{currentYear}</strong>.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Required annually to track alumni success.</li>
                            <li>Updates current job title and industry sector.</li>
                            <li>Takes less than 3 minutes.</li>
                        </ul>
                    </div>
                    <button className={isYearlyCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => isYearlyCompleted ? openReviewModal('yearly') : router.push('/alumni/survey')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isYearlyCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                        {isYearlyCompleted ? 'Review Responses' : 'Start Yearly Survey'}
                    </button>
                </div>
            );
        }

        if (surveyTab === 'gts') {
            return (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ margin: '0', fontSize: '1.5rem', color: 'var(--text-main)' }}>Graduate Tracer Study (GTS)</h2>
                        <span style={{ backgroundColor: !isGTSAvailable ? 'rgba(255,255,255,0.1)' : isGTSCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: !isGTSAvailable ? 'var(--text-sub)' : isGTSCompleted ? '#10b981' : '#f59e0b', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {!isGTSAvailable ? 'Locked 🔒' : isGTSCompleted ? 'Completed ✅' : 'Pending 🟡'}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        The comprehensive tracer study required by CHED to evaluate overall curriculum relevance.
                    </p>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>📋 Details</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>Tracks alumni, evaluating the relevance of their curriculum to workplace demands and assessing employment outcomes.</li>
                            <li>Covers complete educational & employment history.</li>
                            <li>Takes roughly 10-15 minutes.</li>
                        </ul>
                    </div>
                    {!isGTSAvailable ? (
                        <button className="outline-btn" disabled style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed', opacity: 0.6, marginTop: '20px' }}>
                            🔒 Unlocks after graduation{graduationYear ? ` (${graduationYear})` : ''}
                        </button>
                    ) : (
                        <button className={isGTSCompleted ? 'outline-btn' : 'primary-btn'} onClick={() => isGTSCompleted ? openReviewModal('gts') : router.push('/alumni/tracer')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: isGTSCompleted ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', marginTop: '20px' }}>
                            {isGTSCompleted ? 'Review Responses' : 'Start Tracer Study'}
                        </button>
                    )}
                </div>
            );
        }
    };

    console.log("User Data", userData);
    
    console.log("Survey", surveys)
    return (
        <div className="portal-layout" style={{ height: '100vh', overflow: 'hidden' }}>

            {/* Alumni Sidebar */}
            <AlumniSidebar
                isDarkMode={isDarkMode}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
            />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', padding: '40px', position: 'relative' }}>
                <header className="alumni-header">
                    <div className="profile-ring">
                        <div className="profile-pic" style={{ backgroundColor: '#ffd700', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '500' }}>
                            {userData.initials}
                        </div>
                    </div>
                    <div className="header-text">
                        <h1>Hello, Engineer !</h1>
                        <p><strong>{userData.name}</strong> | {userData.program} | Batch {userData.batch}</p>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, overflowX: 'auto', paddingBottom: '5px' }}>
                            {/*
                            <button
                                onClick={() => setSurveyTab('po')}
                                style={surveyTab === 'po' ? activeTabStyle : inactiveTabStyle}
                            >
                                📊 PO Survey
                            </button>
                            */}
                            <button
                                onClick={() => setSurveyTab('peo')}
                                style={surveyTab === 'peo' ? activeTabStyle : inactiveTabStyle}
                            >
                                📈 PEO Survey
                                {!isPEORequired && <span style={{ marginLeft: '4px', fontSize: '0.8rem', opacity: 0.7 }}>🔒</span>}
                            </button>
                            <button
                                onClick={() => setSurveyTab('yearly')}
                                style={surveyTab === 'yearly' ? activeTabStyle : inactiveTabStyle}
                            >
                                📅 Yearly Update
                            </button>
                            <button
                                onClick={() => setSurveyTab('gts')}
                                style={surveyTab === 'gts' ? activeTabStyle : inactiveTabStyle}
                            >
                                🎓 Tracer Study
                                {!isGTSAvailable && <span style={{ marginLeft: '4px', fontSize: '0.8rem', opacity: 0.7 }}>🔒</span>}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                {renderSurveyTabContent()}
                            </div>

                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Completion Progress</h3>
                                </div>

                                <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: progressPercent === 100 ? '#10b981' : 'var(--text-main)', lineHeight: '1', marginBottom: '15px' }}>
                                    {progressPercent}<span style={{ fontSize: '1.8rem', color: 'var(--text-sub)' }}>%</span>
                                </div>

                                <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '20px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--gold)', borderRadius: '6px', transition: 'width 1s ease' }}></div>
                                </div>

                                <div style={{ paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {pendingList.length > 0 ? (
                                        <>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Pending Action Items:</p>
                                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--gold)', lineHeight: '1.6' }}>
                                                {pendingList.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                                            ✅ All required tasks completed!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employer' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                        <div className="pc-header" style={{ marginBottom: '20px' }}>
                            <h1 style={{ fontSize: '1.8rem', marginBottom: '5px', color: 'var(--gold)' }}>PEO Employer Tracker</h1>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>Manage your employment status and request employer feedback for PEO compliance.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ fontSize: '1.8rem' }}>💼</div>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Current Work Status</h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0', fontSize: '0.95rem' }}>
                                    <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                        Status: <span style={{ float: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>{savedJobStatus.toUpperCase()}</span>
                                    </li>
                                    {savedJobStatus === 'employed' && (
                                        <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                            Company: <span style={{ float: 'right', color: 'var(--text-main)', textAlign: 'right', maxWidth: '60%' }}>{dbUser?.company_name || 'Not specified'}</span>
                                        </li>
                                    )}
                                </ul>

                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--gold)', margin: '0 0 8px 0' }}>💡 Why keep this updated?</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.5' }}>
                                        Accurate records help us align our curriculum with industry trends, ensuring graduates remain highly competitive in the job market.
                                    </p>
                                </div>

                                <button className="outline-btn" onClick={openJobUpdate} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold', width: '100%', marginTop: '20px' }}>
                                    ✎ Update Work Status
                                </button>
                            </div>

                            <div className="portal-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.1rem' }}>Employer Evaluation Status</h3>
                                    <span style={{ fontSize: '1.3rem' }}>
                                        {(savedJobStatus === 'unemployed' || savedJobStatus === 'Not Updated') ? '🚫' : employerStatus === 'Pending' ? '⏳' : employerStatus === 'sent' ? '✉️' : '✅'}
                                    </span>
                                </div>

                                {(savedJobStatus === 'unemployed' || savedJobStatus === 'self-employed' || savedJobStatus === 'Not Updated') ? (
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1rem' }}><strong>Status:</strong> Not Applicable</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>
                                            {savedJobStatus === 'self-employed'
                                                ? "Employer evaluation is not required for self-employed alumni or business owners."
                                                : savedJobStatus === 'Not Updated'
                                                    ? "Please update your employment status to determine if this section is applicable."
                                                    : "Employer evaluation is not required for your current employment status."}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}><strong>Status:</strong> {
                                                employerStatus === 'Pending' ? <span style={{ color: '#f59e0b' }}>Waiting to invite employer</span> :
                                                    employerStatus === 'sent' ? <span style={{ color: '#3b82f6' }}>Invitation Sent!</span> :
                                                        <span style={{ color: '#10b981' }}>Evaluation Completed!</span>
                                            }</p>

                                            {showInviteBtn && employerStatus === 'Pending' && (
                                                <button
                                                    className="primary-btn"
                                                    onClick={() => { setIsInviteOpen(true); setShowInviteBtn(false); }}
                                                    style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}
                                                >
                                                    + Send Invitation
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6', marginBottom: isInviteOpen ? '15px' : '0' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.5' }}>
                                                <strong>How it works:</strong> Your employer receives a secure link to provide confidential feedback based on PEOs. This directly supports program quality improvement.
                                            </p>
                                        </div>

                                        <div style={{ maxHeight: isInviteOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <input type="text" placeholder="HR / Supervisor Name" className="correction-textbox" style={{ height: '40px', padding: '0 15px', fontSize: '0.9rem', backgroundColor: 'var(--bg-main)' }} />
                                                <input type="email" placeholder="Company Email Address" className="correction-textbox" style={{ height: '40px', padding: '0 15px', fontSize: '0.9rem', backgroundColor: 'var(--bg-main)' }} />

                                                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                                    <button className="outline-btn cancel-btn" onClick={() => { setIsInviteOpen(false); setTimeout(() => setShowInviteBtn(true), 400); }} style={{ padding: '10px', borderRadius: '6px', flex: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Cancel</button>
                                                    <button className="primary-btn" onClick={handleSendInvite} style={{ padding: '10px', borderRadius: '6px', flex: 1, border: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>Send Link</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'determinants' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                        <div className="portal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', flexShrink: 0, borderLeft: obeHasGrades ? '6px solid #10b981' : '6px solid #f59e0b' }}>
                            <div>
                                <h2 style={{ color: 'var(--gold)', margin: '0 0 5px 0', fontSize: '1.5rem' }}>Direct Assessment Portfolio</h2>
                                <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>Official Outcome-Based Education (OBE) grades evaluated by the Program Chair.</p>
                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: '10px 0 0 0', fontStyle: 'italic' }}>Grades are computed based on your performance in the determinant courses mapped to specific Program Outcomes.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ backgroundColor: obeHasGrades ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: obeHasGrades ? '#10b981' : '#f59e0b', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: `1px solid ${obeHasGrades ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}>
                                    {obeHasGrades ? '✅ Fully Evaluated' : '⏳ Pending Evaluation'}
                                </span>
                            </div>
                        </div>

                        <h3 style={{ color: 'var(--gold)', margin: '10px 0 0 0', fontSize: '1.2rem' }}>Evaluated Determinants</h3>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: '0 0 5px 0' }}>
                            Each Program Outcome's achievement is the sum of your grade in each determinant course multiplied by the percentage that course occupies on the PO.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                            {PO_DEFINITIONS.map(po => {
                                const data = poAttainment[po.id];
                                if (!data || !data.courses || data.courses.length === 0) return null;

                                const attained = data.attainment; // number | null
                                const barColor = attained == null ? 'var(--text-sub)'
                                    : attained >= 75 ? '#10b981'
                                    : attained >= 50 ? '#f59e0b'
                                    : '#ef4444';

                                return (
                                    <div key={po.id} className="portal-card" style={{ padding: '25px', borderTop: `4px solid ${barColor}`, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ backgroundColor: 'var(--gold)', color: '#111827', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>PO-{po.id}</span>
                                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{po.title}</h3>
                                            </div>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: barColor, whiteSpace: 'nowrap' }}>
                                                {attained == null ? 'Pending' : `${attained}%`}
                                            </span>
                                        </div>

                                        <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                                            <div style={{ height: '100%', width: `${attained == null ? 0 : Math.min(attained, 100)}%`, backgroundColor: barColor, transition: 'width 0.4s ease' }} />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {data.courses.map((c, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.3', flex: 1, paddingRight: '12px' }}>{c.key}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span title="Weight toward this PO" style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.8rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '3px 7px', borderRadius: '4px' }}>{c.weight}%</span>
                                                        <span title="Your grade" style={{ fontWeight: 'bold', fontSize: '0.85rem', minWidth: '60px', textAlign: 'right', color: c.graded ? '#10b981' : 'var(--text-sub)' }}>
                                                            {c.graded ? `${c.percentage}%` : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                                            {data.gradedWeight} / {data.totalWeight} weight evaluated · gold = course weight, green = your grade
                                        </p>
                                    </div>
                                );
                            })}
                            {Object.keys(poAttainment).length === 0 && (
                                <div style={{ color: 'var(--text-sub)', fontStyle: 'italic', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    No determinant grades available yet.
                                </div>
                            )}
                        </div>

                        <h3 style={{ color: 'var(--gold)', margin: '20px 0 0 0', fontSize: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>Curriculum Mapping (Synced from PC)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
                            {PO_DEFINITIONS.map(po => {
                                const data = poAttainment[po.id];
                                if (!data || !data.courses || data.courses.length === 0) return null;

                                return (
                                    <div key={po.id} className="portal-card" style={{ padding: '25px', borderTop: '4px solid var(--gold)', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                            <span style={{ backgroundColor: 'var(--gold)', color: '#111827', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>PO-{po.id}</span>
                                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{po.title}</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {data.courses.map((c, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.3', flex: 1, paddingRight: '15px' }}>{c.key}</span>
                                                    <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                                        {c.weight}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(poAttainment).length === 0 && (
                                <div style={{ color: 'var(--text-sub)', fontStyle: 'italic', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    No curriculum mapping synced from the Program Chair yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {toastMessage && (
                    <div style={{
                        position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px',
                        borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px',
                        zIndex: 1000, fontWeight: 'bold'
                    }}>
                        ✅ {toastMessage}
                    </div>
                )}
            </main>

            {surveyModalType && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <h2 style={{ color: 'var(--gold)', margin: 0 }}>Your Responses</h2>
                        </div>
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{userData.name}</h3>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: '5px 0' }}>
                                {dbUser?.id} | Batch {userData.batch}
                            </p>
                        </div>
                        <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {surveyModalQuestions.length === 0 ? (
                                <p style={{ color: 'var(--text-sub)' }}>No questions found in this survey schema.</p>
                            ) : (
                                surveyModalQuestions.map((q, idx) => (
                                    <div key={q.id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1rem' }}>{idx + 1}. {q.text}</p>

                                        {q.type === 'text' || q.type === 'email' || q.type === 'date' ? (
                                            <input type={q.type === 'date' ? 'date' : 'text'} className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: 0.7 }} disabled value={surveyModalAnswers[q.id] || ''} />
                                        ) : q.type === 'textarea' ? (
                                            <textarea className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', height: '80px', resize: 'vertical', opacity: 0.7 }} disabled value={surveyModalAnswers[q.id] || ''} />
                                        ) : q.type === 'likert' ? (
                                            (q.options && q.options.length > 0) ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {q.options.map((opt, oi) => {
                                                        const subId = `${q.id}_sub_${oi}`;
                                                        return (
                                                            <div key={oi} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', flex: 1 }}>{opt}</span>
                                                                <select className="correction-textbox" style={{ width: '110px', padding: '8px', backgroundColor: 'var(--bg-main)', opacity: 0.7 }} disabled value={surveyModalAnswers[subId] ?? ''}>
                                                                    <option value="">—</option>
                                                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                                </select>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: 0.7 }} disabled value={surveyModalAnswers[q.id] ?? ''}>
                                                    <option value="">Select rating...</option>
                                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            )
                                        ) : q.type === 'yesno' ? (
                                            <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: 0.7 }} disabled value={surveyModalAnswers[q.id] || ''}>
                                                <option value="">Select option...</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        ) : (q.type === 'radio' || q.type === 'dropdown') ? (
                                            <select className="correction-textbox" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-main)', opacity: 0.7 }} disabled value={surveyModalAnswers[q.id] || ''}>
                                                <option value="">Select option...</option>
                                                {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : q.type === 'checkbox' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {q.options?.map((opt, i) => {
                                                    const currentAns = Array.isArray(surveyModalAnswers[q.id]) ? surveyModalAnswers[q.id] : [];
                                                    return (
                                                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'default', opacity: 0.7 }}>
                                                            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} disabled checked={currentAns.includes(opt)} />
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
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="cancel-btn outline-btn" onClick={() => setSurveyModalType(null)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'guide' && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ margin: '0 0 15px 0', color: 'var(--gold)' }}>System Guide & FAQs</h2>
                        <div style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            <p style={{ marginBottom: '5px', color: 'var(--gold)' }}><strong>How are surveys unlocked?</strong></p>
                            <p style={{ margin: '0 0 15px 0', color: 'var(--text-sub)' }}>The system automatically unlocks specific surveys based on your graduation batch. The PEO survey will only be available 3 years after your graduation year.</p>

                            <p style={{ marginBottom: '5px', color: 'var(--gold)' }}><strong>Why is my Employer Tracker pending?</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-sub)' }}>If you are currently employed in a company, you need to provide your HR or Supervisor's email so the system can send them a brief feedback form regarding your performance.</p>
                        </div>
                        <button className="outline-btn" onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>Close Guide</button>
                    </div>
                </div>
            )}
            
            {/* DATA CORRECTION MODAL */}
            <DataCorrection 
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                showToast={showToast}
                student_id={userData.id}
                batch={userData.batch}
                program={userData.program}
                name={userData.name}
            />

            {activeModal === 'jobUpdate' && (
                <div className="modal-overlay">
                    <div className="modal-box portal-card" style={{ maxWidth: '450px' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: 'var(--gold)' }}>Update Employment Status</h2>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>Please update your current employment details to keep the alumni records accurate.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <select
                                className="correction-textbox"
                                style={{ height: '45px', padding: '0 15px', color: 'var(--text-main)', backgroundColor: 'var(--bg-main)' }}
                                value={employmentStatus}
                                onChange={(e) => setEmploymentStatus(e.target.value)}
                            >
                                <option value="" disabled>Select Employment Status...</option>
                                <option value="employed">Employed</option>
                                <option value="self-employed">Self-Employed / Business Owner</option>
                                <option value="unemployed">Unemployed</option>
                            </select>

                            {employmentStatus === 'employed' && (
                                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Current Job Title (e.g., Software Engineer)"
                                        className="correction-textbox"
                                        style={{ height: '45px', padding: '0 15px', backgroundColor: 'var(--bg-main)' }}
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        className="correction-textbox"
                                        style={{ height: '45px', padding: '0 15px', backgroundColor: 'var(--bg-main)' }}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="outline-btn cancel-btn" onClick={() => { setActiveModal(null); setEmploymentStatus(''); }} style={{ padding: '10px', borderRadius: '8px', flex: 1, fontWeight: 'bold' }}>Cancel</button>
                            <button className="primary-btn" onClick={handleSaveJobUpdate} style={{ padding: '10px', borderRadius: '8px', flex: 1, border: 'none', fontWeight: 'bold' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './pc.css';
import '../alumni/alumni-globals.css';

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

const CPE_CURRICULUM = [
    {
        year: "4th Year",
        courses: [
            "COEN 4103 Computer Architecture and Organization (lec)", "COEN 4101 Computer Architecture and Organization (lab)",
            "COEN 4113 Embedded Systems (lec)", "COEN 4111 Embedded Systems (lab)",
            "COEN 4202 CPE Practice and Design 2", "COEN 4123 Digital Signal Processing (lec)",
            "COEN 4121 Digital Signal Processing (lab)", "GECE 2213 GEC Elective 2 (Gender & Society)",
            "COEN 4203 Computer Networks and Security (lec)", "COEN 4201 Computer Networks and Security (lab)",
            "COEN 4211 Seminars and Fieldtrips", "COEN 4212 CPE Laws and Professional Practice",
            "ENSC 4003 Technopreneurship", "GECE 4103 GEC Free Elective 3 (Foreign Language)",
            "HIST 1023 Life and Works of Rizal", "ENSC 2033 Basic Occupational Health and Safety",
            "COEN 4223 Cognate Elective 3 (CISCO 3)"
        ]
    },
    {
        year: "3rd Year",
        courses: [
            "COEN 3103 Logic, Circuit and Design (lec)", "COEN 3101 Logic, Circuit and Design (lab)",
            "COEN 3113 Operating System", "COEN 3123 Intro to Networks, Data and Digital Comm (CISCO 1)",
            "COEN 3133 Methods of Research", "COEN 3143 Feedback and Control System",
            "COEN 3153 Fundamentals of Mixed Signals and Sensors", "COEN 3111 Computer Engineering Drafting and Design",
            "PHIL 1013 Ethics", "COEN 3203 Microprocessors (lec)", "COEN 3201 Microprocessors (lab)",
            "COEN 3211 Introduction to HDL", "COEN 3221 CPE Project Design 1", "COEN 3213 Emerging Technologies in CPE",
            "COEN 3212 Programmable Logic Control, Robotics and Mechatronics Applications", "GECE 2203 GEC Elective 1",
            "COEN 3223 Cognate Elective 2(CISCO 2)", "COEN 3223 On-the-Job Training"
        ]
    },
    {
        year: "2nd Year",
        courses: [
            "ENSC 2021 Computer-Aided Drafting", "ELEN 2123 Fundamentals of Electrical Circuits (lec)",
            "ELEN 2121 Fundamentals of Electrical Circuits (lab)", "MATH 2123 Differential Equations",
            "COEN 2102 Data Structures and Algorithms", "NASC 2063 Physics 2 (lec)", "NASC 2061 Physics 2 (lab)",
            "ENSC 2063 Engineering Economics", "COEN 2112 Fundamentals of Computer Hardware",
            "PFIT 2102 PATHFit 3(Sports and Dance)", "COEN 2203 Numerical Methods", "COEN 2213 Software Design (lec)",
            "COEN 2201 Software Design (lab)", "COEN 2223 Discrete Mathematics",
            "ECEN 2103 Fundamentals of Electronic Engineering (lec)", "ECEN 2101 Fundamentals of Electronic Engineering (lab)",
            "HIST 1013 Reading in Philippine History", "PFIT 2202 PATHFit 4(Team Sports)", "COEN 2233 Cognate Elective 1"
        ]
    },
    {
        year: "1st Year",
        courses: [
            "SOCI 1103 Contemporary World", "MATH 1013 Mathematics in the Modern World",
            "MATH 2033 College and Advanced Algebra", "MATH 2044 Plane & Spherical Trig, Analytic & Solid Geo",
            "COEN 1101 Computer Engineering as Discipline", "COEN 1102 Programming Logic and Design",
            "ENGL 1103 Purposive Communication", "PSYC 1013 Understanding the Self", "PFIT 1102 PATHFIt 1",
            "NSTP 1013 National Service Training Program 1", "HUMA 1013 Art Appreciation",
            "MATH 2074 Differential & Integral Calculus 1", "ENSC 1013 Science, Technology and Society",
            "COEN 1202 Object Oriented Programming", "ENSC 1203 Engineering Data Analysis",
            "NASC 2013 Chemistry for Engineers (lec)", "NASC 2011 Chemistry for Engineers (lab)",
            "PFIT 1202 PATHFit 2", "NSTP 1023 National Service Training Program 2",
            "NASC 2053 Physics 1(lec)", "NASC 2051 Physics 1(lab)", "MATH 2094 Differential & Integral Calculus 2"
        ]
    }
];

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
    { id: 'qF1', poId: 'F', type: 'likert', text: 'Professional Responsibility', weight: 50, options: ['Knowledge of professional norms and practices', 'Knowledge on engineering laws', 'Understanding of professional norms and practices', 'Understanding of engineering laws'] },
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
    { id: 'qL1', poId: 'L', type: 'likert', text: 'As a member', weight: 40, options: ['Knowledge and understanding of engineering and management principles', 'Apply engineering and management principles', 'Participative/Contributor'] },
    { id: 'qL2', poId: 'L', type: 'likert', text: 'As a Leader', weight: 60, options: ['Knowledge and understanding of engineering and management principles', 'Apply engineering and management principles', 'Achieve project objective'] }
];

    const DEFAULT_PEO_QUESTIONS = [
    { id: 'q1', type: 'likert', text: 'How effectively are you leading complex engineering projects?' }
];

const DEFAULT_GTS_QUESTIONS = [
    { id: 'q1', type: 'text', text: 'Name' },
    { id: 'q2', type: 'textarea', text: 'Permanent Address' },
    { id: 'q3', type: 'email', text: 'E-mail Address' },
    { id: 'q4', type: 'text', text: 'Telephone or Contact Number(s)' },
    { id: 'q5', type: 'text', text: 'Mobile Number' },
    { id: 'q6', type: 'radio', text: 'Civil Status', options: ['Single', 'Married', 'Separated', 'Widow/Widower', 'Single Parent'] },
    { id: 'q7', type: 'radio', text: 'Sex', options: ['Male', 'Female'] },
    { id: 'q8', type: 'date', text: 'Birthday' },
    { id: 'q9', type: 'dropdown', text: 'Region of Origin', options: ['Region 1', 'Region 2', 'Region 3', 'Region 4A', 'Region 4B', 'Region 5', 'Region 6', 'Region 7', 'Region 8', 'Region 9', 'Region 10', 'Region 11', 'Region 12', 'NCR', 'CAR', 'ARMM', 'CARAGA'] },
    { id: 'q10', type: 'text', text: 'Province' },
    { id: 'q11', type: 'radio', text: 'Location of Residence', options: ['City', 'Municipality'] },
    { id: 'q12', type: 'text', text: 'Educational Attainment (Degree & Specialization)' },
    { id: 'q13', type: 'textarea', text: 'Professional examination(s) Passed (with Rating & Date)' },
    { id: 'q14', type: 'checkbox', text: 'Reason(s) for taking the course(s) or pursuing degree(s)', options: ['High grades in course/subject area', 'Good grades in high school', 'Influence of parents or relatives', 'Peer Influence', 'Inspired by a role model', 'Strong passion for the profession', 'Prospect for immediate employment', 'Status or prestige of the profession', 'Availability of course offering', 'Prospect of career advancement', 'Affordable for the family', 'Prospect of attractive compensation', 'Opportunity for employment abroad', 'No particular choice', 'Other reason(s)'] },
    { id: 'q15', type: 'textarea', text: 'Training(s) / Advance Studies Attended After College & Reasons' },
    { id: 'q16', type: 'yesno', text: 'Are you presently employed?' },
    { id: 'q17', type: 'checkbox', text: 'If not employed, please state reason(s) why.', options: ['Advance or further study', 'Family concern and decided not to find a job', 'Health-related reason(s)', 'Lack of work experience', 'No job opportunity', 'Did not look for a job', 'Other reason(s)'] },
    { id: 'q18', type: 'dropdown', text: 'Present Employment Status', options: ['Regular', 'Temporary', 'Casual', 'Contractual', 'Self-employed'] },
    { id: 'q19', type: 'text', text: 'Present occupation / Job Title' },
    { id: 'q20', type: 'textarea', text: 'Name of Company/Organization and Major line of business' },
    { id: 'q21', type: 'radio', text: 'Place of Work', options: ['Local', 'Abroad'] },
    { id: 'q22', type: 'yesno', text: 'Is this your first job after college?' },
    { id: 'q23', type: 'checkbox', text: 'What are your reason(s) for staying on the job?', options: ['Salaries and benefits', 'Career challenge', 'Related to special skills', 'Related to course or program of study', 'Proximity to residence', 'Peer influence', 'Family influence', 'Other reason(s)'] },
    { id: 'q24', type: 'checkbox', text: 'What were your reasons for accepting the job?', options: ['Salaries & benefits', 'Career challenge', 'Related to special skills', 'Proximity to residence', 'Other reason(s)'] },
    { id: 'q25', type: 'checkbox', text: 'What were your reason(s) for changing job?', options: ['Salaries & benefits', 'Career challenge', 'Related to special skills', 'Proximity to residence', 'Other reason(s)'] },
    { id: 'q26', type: 'textarea', text: 'Additional reasons for changing job (if applicable)' },
    { id: 'q27', type: 'dropdown', text: 'How long did you stay in your first job?', options: ['Less than a month', '1 to 6 months', '7 to 11 months', '1 year to less than 2 years', '2 years to less than 3 years', '3 years to less than 4 years', 'Others'] },
    { id: 'q28', type: 'dropdown', text: 'How did you find your first job?', options: ['Response to an advertisement', 'As walk-in applicant', 'Recommended by someone', 'Information from friends', 'Arranged by placement officer', 'Family business', 'Job Fair / PESO', 'Others'] },
    { id: 'q29', type: 'dropdown', text: 'How long did it take you to land your first job?', options: ['Less than a month', '1 to 6 months', '7 to 11 months', '1 year to less than 2 years', '2 years to less than 3 years', '3 years to less than 4 years', 'Others'] },
    { id: 'q30', type: 'dropdown', text: 'Job Level Position', options: ['Rank or Clerical', 'Professional, Technical or Supervisory', 'Managerial or Executive', 'Self-employed'] },
    { id: 'q31', type: 'dropdown', text: 'What is your initial gross monthly earning in your first job after college?', options: ['Below P5,000.00', 'P5,000.00 to less than P10,000.00', 'P10,000.00 to less than P15,000.00', 'P15,000.00 to less than P20,000.00', 'P20,000.00 to less than P25,000.00', 'P25,000.00 and above'] },
    { id: 'q32', type: 'yesno', text: 'Was the curriculum you had in college relevant to your first job?' },
    { id: 'q33', type: 'checkbox', text: 'If YES, what competencies learned in college did you find very useful in your first job?', options: ['Communication skills', 'Human Relations skills', 'Entrepreneurial skills', 'Information Technology skills', 'Problem-solving skills', 'Critical Thinking skills', 'Other skills'] },
    { id: 'q34', type: 'textarea', text: 'List down suggestions to further improve your course curriculum' }
];

export default function ProgramChairDashboard() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(true);
    
    const [activeMenu, setActiveMenu] = useState('overview');
    const [indirectTab, setIndirectTab] = useState('status'); 
    
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const [mappingSearchQuery, setMappingSearchQuery] = useState('');
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
    const [selectedGtsCols, setSelectedGtsCols] = useState(['q9', 'q10', 'q11']); // Pre-select Region, Province, and Location

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        } else {
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
                    setQuestions([
                        { id: 'q1', type: 'text', text: 'Name' },
                        { id: 'q2', type: 'textarea', text: 'Permanent Address' },
                        { id: 'q3', type: 'email', text: 'E-mail Address' },
                        { id: 'q4', type: 'text', text: 'Telephone or Contact Number(s)' },
                        { id: 'q5', type: 'text', text: 'Mobile Number' },
                        { id: 'q6', type: 'radio', text: 'Civil Status', options: ['Single', 'Married', 'Separated', 'Widow/Widower', 'Single Parent'] },
                        { id: 'q7', type: 'radio', text: 'Sex', options: ['Male', 'Female'] },
                        { id: 'q8', type: 'date', text: 'Birthday' },
                        { id: 'q9', type: 'dropdown', text: 'Region of Origin', options: ['Region 1', 'Region 2', 'Region 3', 'Region 4A', 'Region 4B', 'Region 5', 'Region 6', 'Region 7', 'Region 8', 'Region 9', 'Region 10', 'Region 11', 'Region 12', 'NCR', 'CAR', 'ARMM', 'CARAGA'] },
                        { id: 'q10', type: 'text', text: 'Province' },
                        { id: 'q11', type: 'radio', text: 'Location of Residence', options: ['City', 'Municipality'] },
                        { id: 'q12', type: 'text', text: 'Educational Attainment (Degree & Specialization)' },
                        { id: 'q13', type: 'textarea', text: 'Professional examination(s) Passed (with Rating & Date)' },
                        { id: 'q14', type: 'checkbox', text: 'Reason(s) for taking the course(s) or pursuing degree(s)', options: ['High grades in course/subject area', 'Good grades in high school', 'Influence of parents or relatives', 'Peer Influence', 'Inspired by a role model', 'Strong passion for the profession', 'Prospect for immediate employment', 'Status or prestige of the profession', 'Availability of course offering', 'Prospect of career advancement', 'Affordable for the family', 'Prospect of attractive compensation', 'Opportunity for employment abroad', 'No particular choice', 'Other reason(s)'] },
                        { id: 'q15', type: 'textarea', text: 'Training(s) / Advance Studies Attended After College & Reasons' },
                        { id: 'q16', type: 'yesno', text: 'Are you presently employed?' },
                        { id: 'q17', type: 'checkbox', text: 'If not employed, please state reason(s) why.', options: ['Advance or further study', 'Family concern and decided not to find a job', 'Health-related reason(s)', 'Lack of work experience', 'No job opportunity', 'Did not look for a job', 'Other reason(s)'] },
                        { id: 'q18', type: 'dropdown', text: 'Present Employment Status', options: ['Regular', 'Temporary', 'Casual', 'Contractual', 'Self-employed'] },
                        { id: 'q19', type: 'text', text: 'Present occupation / Job Title' },
                        { id: 'q20', type: 'textarea', text: 'Name of Company/Organization and Major line of business' },
                        { id: 'q21', type: 'radio', text: 'Place of Work', options: ['Local', 'Abroad'] },
                        { id: 'q22', type: 'yesno', text: 'Is this your first job after college?' },
                        { id: 'q23', type: 'checkbox', text: 'What are your reason(s) for staying on the job?', options: ['Salaries and benefits', 'Career challenge', 'Related to special skills', 'Related to course or program of study', 'Proximity to residence', 'Peer influence', 'Family influence', 'Other reason(s)'] },
                        { id: 'q24', type: 'checkbox', text: 'What were your reasons for accepting the job?', options: ['Salaries & benefits', 'Career challenge', 'Related to special skills', 'Proximity to residence', 'Other reason(s)'] },
                        { id: 'q25', type: 'checkbox', text: 'What were your reason(s) for changing job?', options: ['Salaries & benefits', 'Career challenge', 'Related to special skills', 'Proximity to residence', 'Other reason(s)'] },
                        { id: 'q26', type: 'textarea', text: 'Additional reasons for changing job (if applicable)' },
                        { id: 'q27', type: 'dropdown', text: 'How long did you stay in your first job?', options: ['Less than a month', '1 to 6 months', '7 to 11 months', '1 year to less than 2 years', '2 years to less than 3 years', '3 years to less than 4 years', 'Others'] },
                        { id: 'q28', type: 'dropdown', text: 'How did you find your first job?', options: ['Response to an advertisement', 'As walk-in applicant', 'Recommended by someone', 'Information from friends', 'Arranged by placement officer', 'Family business', 'Job Fair / PESO', 'Others'] },
                        { id: 'q29', type: 'dropdown', text: 'How long did it take you to land your first job?', options: ['Less than a month', '1 to 6 months', '7 to 11 months', '1 year to less than 2 years', '2 years to less than 3 years', '3 years to less than 4 years', 'Others'] },
                        { id: 'q30', type: 'dropdown', text: 'Job Level Position', options: ['Rank or Clerical', 'Professional, Technical or Supervisory', 'Managerial or Executive', 'Self-employed'] },
                        { id: 'q31', type: 'dropdown', text: 'What is your initial gross monthly earning in your first job after college?', options: ['Below P5,000.00', 'P5,000.00 to less than P10,000.00', 'P10,000.00 to less than P15,000.00', 'P15,000.00 to less than P20,000.00', 'P20,000.00 to less than P25,000.00', 'P25,000.00 and above'] },
                        { id: 'q32', type: 'yesno', text: 'Was the curriculum you had in college relevant to your first job?' },
                        { id: 'q33', type: 'checkbox', text: 'If YES, what competencies learned in college did you find very useful in your first job?', options: ['Communication skills', 'Human Relations skills', 'Entrepreneurial skills', 'Information Technology skills', 'Problem-solving skills', 'Critical Thinking skills', 'Other skills'] },
                        { id: 'q34', type: 'textarea', text: 'List down suggestions to further improve your course curriculum' }
                    ]);
                    setQuestions(DEFAULT_GTS_QUESTIONS);
                }
            }
            setActiveQuestionId(null);
            setHoveredQuestionId(null);
        }
        
        if (activeMenu === 'analytics') {
            const existingGts = localStorage.getItem('obe_form_gts');
            if (existingGts) {
                setTracerSchema(JSON.parse(existingGts).questions || []);
            } else {
                setTracerSchema([
                    { id: 'q1', text: 'Name' },
                    { id: 'q16', text: 'Presently Employed?' },
                    { id: 'q19', text: 'Occupation / Job Title' },
                    { id: 'q29', text: 'Time to First Job' }
                ]);
            }
        }
    }, [activeMenu, selectedSurveyView, surveySubTab, formBatchYear]);

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

    const addQuestion = () => {
        const newId = `q_${Date.now()}`;
        setQuestions([...questions, { id: newId, type: 'likert', text: 'Untitled Question' }]);
        setActiveQuestionId(newId);
    };

    const addPOQuestion = (poId) => {
        const newId = `q_${Date.now()}`;
        setQuestions([...questions, { id: newId, poId: poId, type: 'likert', text: 'Untitled Question', options: ['New Sub-item'], weight: 0 }]);
        setActiveQuestionId(newId);
    };

    const updateQuestion = (id, key, value) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                let updatedQ = { ...q, [key]: value };
                if (key === 'type' && ['radio', 'checkbox', 'dropdown'].includes(value) && (!updatedQ.options || updatedQ.options.length === 0)) {
                    updatedQ.options = ['Option 1'];
                }
                return updatedQ;
            }
            return q;
        }));
    };

    const handleOptionTextChange = (qId, optIndex, newText) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...(q.options || [])];
                newOptions[optIndex] = newText;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleAddOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] };
            }
            return q;
        }));
    };

    const handleRemoveOption = (qId, optIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...(q.options || [])];
                newOptions.splice(optIndex, 1);
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const deleteQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (activeQuestionId === id) setActiveQuestionId(null);
    };

    const saveFormToDatabase = () => {
        const sType = selectedSurveyView === '1stYear' ? 'po' :
                      selectedSurveyView === '3to5Year' ? 'peo' : 'gts';
        const baseKey = sType === 'po' ? 'obe_form_po' :
                        sType === 'peo' ? 'obe_form_peo' : 'obe_form_gts';
        const dbKey = `${baseKey}_${formBatchYear}`;
        const payload = { title: formTitle, desc: formDesc, questions: questions };
        localStorage.setItem(dbKey, JSON.stringify(payload));
        localStorage.setItem(baseKey, JSON.stringify(payload));
        showToast(`Success! The survey template (Version ${formBatchYear}) has been published.`, 'success');
    };

    const togglePOMapping = (courseName, poId) => {
        setCourseMappings(prev => {
            const courseData = prev[courseName] || {};
            const newCourseData = { ...courseData, [poId]: !courseData[poId] };
            const newState = { ...prev, [courseName]: newCourseData };
            localStorage.setItem('obe_course_mappings', JSON.stringify(newState));
            return newState;
        });
    };

    const saveOverallMapping = () => {
        localStorage.setItem('obe_course_mappings', JSON.stringify(courseMappings));
        showToast('Curriculum mapping saved successfully! Changes are now applied system-wide.', 'success');
    };

    const handleWeightChange = (poId, courseName, value) => {
        setCourseWeights(prev => {
            const poData = prev[poId] || {};
            return {
                ...prev,
                [poId]: { ...poData, [courseName]: value }
            };
        });
    };

    const saveAllWeights = () => {
        localStorage.setItem('obe_course_weights', JSON.stringify(courseWeights));
        showToast('Direct Assessment weights have been saved successfully!', 'success');
    };

    const calculateTotalWeight = (poId) => {
        const weights = courseWeights[poId] || {};
        const mappedCourses = Object.keys(courseMappings).filter(c => courseMappings[c][poId]);
        return mappedCourses.reduce((sum, course) => sum + (Number(weights[course]) || 0), 0);
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

    return (
        <div className="portal-layout">
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: '#ef4444', fontWeight: 'bold', letterSpacing: '1px' }}>CHAIR</span>
                    </div>
                </div>

                <nav className="nav-menu">
                <button className={`nav-btn ${activeMenu === 'overview' ? 'active' : ''}`} onClick={() => setActiveMenu('overview')}>
                        📊 Program Overview
                    </button>
                <button className={`nav-btn ${activeMenu === 'masterlist' ? 'active' : ''}`} onClick={() => setActiveMenu('masterlist')}>
                        👥 Masterlist
                    </button>
                    <button className={`nav-btn ${activeMenu === 'direct' ? 'active' : ''}`} onClick={() => setActiveMenu('direct')}>
                        📝 Direct Assessment
                    </button>
                    <button className={`nav-btn ${activeMenu === 'indirect' ? 'active' : ''}`} onClick={() => setActiveMenu('indirect')}>
                        📋 Indirect Assessment
                    </button>
                    <button className={`nav-btn ${activeMenu === 'determinants' ? 'active' : ''}`} onClick={() => setActiveMenu('determinants')}>
                        ⚙️ Determinants
                    </button>
                    <button className={`nav-btn ${activeMenu === 'analytics' ? 'active' : ''}`} onClick={() => setActiveMenu('analytics')}>
                        📈 Reports & Analytics
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="nav-btn logout" onClick={() => router.push('/')}>Log Out</button>
                </div>
            </aside>

            <main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
                
                {activeMenu === 'overview' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="pc-header" style={{ marginBottom: '30px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Program Overview</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Welcome back, Program Chair! Here is the status of the B.S. Computer Engineering program.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                                    A.Y. 2025-2026
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div className="portal-card" style={{ borderTop: '4px solid #3b82f6', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Total Registered Alumni</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalActive}</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #10b981', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Tracer Study Completion</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{tracerRate}%</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #f59e0b', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Pending Direct Assessments</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{pendingDirectAssessments}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div className="portal-card">
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Action Center / To-Do</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {pendingDirectAssessments > 0 ? (
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ color: '#f59e0b', margin: '0 0 5px 0' }}>Encode Direct Assessments</h4>
                                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have {pendingDirectAssessments} students waiting for their Det 1-3 grades.</p>
                                            </div>
                                            <button className="outline-btn" onClick={() => setActiveMenu('masterlist')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Go to Masterlist</button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
                                            <h4 style={{ color: '#10b981', margin: '0 0 5px 0' }}>All Caught Up!</h4>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>All direct assessments have been graded.</p>
                                        </div>
                                    )}
                                    <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#3b82f6', margin: '0 0 5px 0' }}>Data Correction Requests</h4>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have 0 pending correction requests from Alumni.</p>
                                        </div>
                                        <button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }}>Review</button>
                                    </div>
                                </div>
                            </div>
                            <div className="portal-card">
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Quick Links</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button className="outline-btn" onClick={() => {setActiveMenu('indirect'); setSelectedSurveyView('gts'); setSurveySubTab('builder');}} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px' }}>
                                        📝 Edit Tracer Survey
                                    </button>
                                    <button className="outline-btn" onClick={() => setActiveMenu('analytics')} style={{ textAlign: 'left', padding: '12px 15px', borderRadius: '8px' }}>
                                        📊 View Reports & Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeMenu === 'masterlist' && (
                    <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0 }}>Batch Roster</h3>
                                        <select 
                                            className="correction-textbox" 
                                            style={{ width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }}
                                            value={selectedBatch}
                                            onChange={(e) => setSelectedBatch(e.target.value)}
                                        >
                                            <option value="All">All Batches</option>
                                            <option value="2024">Batch 2024</option>
                                            <option value="2025">Batch 2025</option>
                                            <option value="2026">Batch 2026</option>
                                            <option value="2027">Batch 2027</option>
                                            <option value="2028">Batch 2028</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Batch Year</th>
                                                <th>OBE Status (Direct)</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
                                                        No active records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                displayStudents.map((student, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                        <td>{student.batch}</td>
                                                        <td>
                                                            <span className={`status-badge ${student.obeStatus === 'Pending' ? 'badge-pending' : 'badge-passed'}`}>
                                                                {student.obeStatus}
                                                            </span>
                                                        </td>
                                                        <td style={{ display: 'flex', gap: '10px' }}>
                                                            <button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }} onClick={() => setSelectedStudent(student)}>
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                    </div>
                )}

                {activeMenu === 'direct' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="pc-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Direct Assessment Weights</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Assign percentage weights to courses mapped per Program Outcome. Total must equal 100%.</p>
                            </div>
                            <button className="primary-btn" onClick={saveAllWeights} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)' }}>
                                💾 Save All Weights
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', paddingBottom: '40px' }}>
                            {PO_DEFINITIONS.map((po) => {
                                const mappedCourses = Object.keys(courseMappings).filter(course => courseMappings[course][po.id]);
                                const totalWeight = calculateTotalWeight(po.id);
                                
                                let barColor = 'var(--gold)'; 
                                if (totalWeight === 100) barColor = '#10b981'; 
                                else if (totalWeight > 100) barColor = '#ef4444'; 

                                return (
                                    <div key={po.id} className="portal-card" style={{ padding: '25px', borderTop: `4px solid ${barColor}`, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                            <span style={{ backgroundColor: barColor, color: barColor === 'var(--gold)' ? '#111827' : '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>PO-{po.id}</span>
                                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{po.title}</h3>
                                        </div>
                                        
                                        <div style={{ flex: 1, marginBottom: '20px' }}>
                                            {mappedCourses.length === 0 ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                    No courses mapped to this PO yet. Map courses in the <b>Determinants</b> tab first.
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {mappedCourses.map((course, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.3', flex: 1, paddingRight: '15px' }}>{course}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="100" 
                                                                    className="correction-textbox"
                                                                    value={courseWeights[po.id]?.[course] || ''}
                                                                    onChange={(e) => handleWeightChange(po.id, course, e.target.value)}
                                                                    placeholder="0"
                                                                    style={{ width: '70px', height: '35px', textAlign: 'center', padding: '0', fontSize: '1rem', backgroundColor: 'var(--bg-main)' }}
                                                                />
                                                                <span style={{ color: 'var(--text-sub)', fontWeight: 'bold' }}>%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {mappedCourses.length > 0 && (
                                            <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Total Weight Computation</span>
                                                    <span style={{ color: barColor, fontWeight: 'bold', fontSize: '0.95rem' }}>{totalWeight}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${Math.min(totalWeight, 100)}%`, backgroundColor: barColor, transition: 'width 0.3s ease, background-color 0.3s ease' }}></div>
                                                </div>
                                                {totalWeight !== 100 && (
                                                    <p style={{ color: barColor, fontSize: '0.75rem', marginTop: '8px', textAlign: 'right', margin: '8px 0 0 0' }}>
                                                        {totalWeight < 100 ? '⚠️ Total must be exactly 100%' : '❌ Exceeds 100% limit'}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeMenu === 'indirect' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        
                        <div className="pc-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Indirect Assessment</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Manage survey deployments and build custom questionnaires.</p>
                            </div>
                        </div>

                        {!selectedSurveyView ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease' }}>
                                        <div>
                                            <h2 style={{ color: 'var(--gold)', fontSize: '1.2rem', marginBottom: '15px', paddingLeft: '5px', borderLeft: '4px solid var(--gold)' }}>Indirect Assessment Surveys</h2>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                                
                                                <div className="portal-card hover-card" onClick={() => {setSelectedSurveyView('1stYear'); setSurveySubTab('respondents');}} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>SO Survey (Yearly Update)</h3>
                                                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Active 🟢</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Assesses early career alignment and basic SO attainment. Click to view respondents.</p>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                                                            <span>Completion Rate</span>
                                                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{poRate}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                            <div style={{ width: `${poRate}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="portal-card hover-card" onClick={() => {setSelectedSurveyView('3to5Year'); setSurveySubTab('respondents');}} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', opacity: 0.8, transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>3-5 Year Graduate Survey</h3>
                                                            <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Draft 🟡</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Assesses career progression and advanced PEO attainment. Click to view list.</p>
                                                    </div>
                                                    <div>
                                                        <button className="outline-btn" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); setSelectedSurveyView('3to5Year'); setSurveySubTab('builder'); }}>
                                                            Configure Form
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="portal-card hover-card" onClick={() => {setSelectedSurveyView('gts'); setSurveySubTab('respondents');}} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Graduate Tracer Study</h3>
                                                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Deployed 🟢</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '20px' }}>Institutional tracer questionnaire. Click to view respondent tracker.</p>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                                                            <span>Overall Completion</span>
                                                            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{tracerRate}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                            <div style={{ width: `${tracerRate}%`, height: '100%', backgroundColor: 'var(--gold)', borderRadius: '3px' }}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <button 
                                        onClick={() => setSelectedSurveyView(null)} 
                                        style={{ background: 'none', border: 'none', color: 'var(--gold)', padding: '6px 0', fontSize: '0.9rem', marginBottom: '10px', cursor: 'pointer', fontWeight: '500', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textDecoration = 'underline'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.textDecoration = 'none'; }}
                                    >
                                        ← Back to Surveys
                                    </button>
                                    <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem', margin: 0 }}>
                                        {selectedSurveyView === '1stYear' && 'SO Survey (Yearly Update)'}
                                        {selectedSurveyView === '3to5Year' && '3-5 Year Graduate Survey'}
                                        {selectedSurveyView === 'gts' && 'Graduate Tracer Study'}
                                    </h2>
                                </div>

                                <div className="tab-container" style={{ marginBottom: '20px' }}>
                                    <button className={`tab-btn ${surveySubTab === 'respondents' ? 'active' : ''}`} onClick={() => setSurveySubTab('respondents')}>
                                        👥 Respondents Tracker
                                    </button>
                                    <button className={`tab-btn ${surveySubTab === 'builder' ? 'active' : ''}`} onClick={() => setSurveySubTab('builder')}>
                                        📝 Survey Questions
                                    </button>
                                </div>

                                {surveySubTab === 'respondents' && (
                                    <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', margin: 0 }}>Respondents Data</h3>
                                                <select 
                                                    className="correction-textbox" 
                                                    style={{ width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }}
                                                    value={surveyDetailBatch} 
                                                    onChange={(e) => setSurveyDetailBatch(e.target.value)}
                                                >
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
                                                            <th>Survey Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {surveyDetailStudents.map((student, idx) => {
                                                            let s_status = 'Pending';
                                                            if (selectedSurveyView === '1stYear') s_status = student.surveyProgress === '100%' ? 'Completed' : 'Pending';
                                                            else if (selectedSurveyView === 'gts') s_status = student.tracerProgress === '100%' ? 'Completed' : 'Pending';
                                                            else if (selectedSurveyView === '3to5Year') s_status = student.peoProgress === '100%' ? 'Completed' : 'Pending'; 

                                                            return (
                                                                <tr key={idx} 
                                                                    onClick={() => openSurveyModal(student, selectedSurveyView)}
                                                                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    title="Click to view/edit responses"
                                                                >
                                                                    <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                                    <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                                    <td>{student.batch}</td>
                                                                    <td>
                                                                        <span className={`status-badge ${s_status === 'Completed' ? 'badge-passed' : 'badge-pending'}`}>
                                                                            {s_status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {surveyDetailStudents.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                                    No records found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                )}

                                {surveySubTab === 'builder' && (
                                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                <div style={{ width: '35%', position: 'sticky', top: '0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="portal-card" style={{ borderTop: '8px solid var(--gold)', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                                        <h2 style={{ color: 'var(--gold)', marginBottom: '20px', fontSize: '1.4rem' }}>Form Settings</h2>
                                        
                                        <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Survey Version Year:</label>
                                        <select 
                                            className="correction-textbox" 
                                            style={{ width: 'max-content', minWidth: '150px', marginBottom: '25px', fontWeight: 'bold' }}
                                            value={formBatchYear}
                                            onChange={(e) => setFormBatchYear(e.target.value)}
                                        >
                                            <option value="2024">2024 Version</option>
                                            <option value="2025">2025 Version</option>
                                            <option value="2026">2026 Version</option>
                                            <option value="2027">2027 Version</option>
                                            <option value="2028">2028 Version</option>
                                        </select>

                                        <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Form Title:</label>
                                        <input 
                                            type="text" 
                                            value={formTitle} 
                                            onChange={(e) => setFormTitle(e.target.value)} 
                                            placeholder="Enter title here..." 
                                            style={{ width: '100%', fontSize: '1.4rem', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-main)', marginBottom: '20px', paddingBottom: '10px', outline: 'none', transition: 'border-color 0.3s' }} 
                                            onFocus={(e) => e.target.style.borderBottom = '1px solid var(--gold)'} 
                                            onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.1)'} 
                                        />
                                        
                                        <label style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Form Description:</label>
                                        <textarea 
                                            value={formDesc} 
                                            onChange={(e) => setFormDesc(e.target.value)} 
                                            placeholder="Provide instructions for the alumni..." 
                                            style={{ width: '100%', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', resize: 'none', outline: 'none', minHeight: '100px', padding: '15px', lineHeight: '1.5', marginBottom: '25px' }} 
                                            onFocus={(e) => e.target.style.borderColor = 'var(--gold)'} 
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} 
                                        />

                                        <button className="primary-btn" onClick={saveFormToDatabase} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                            💾 Publish Updates
                                        </button>
                                    </div>
                                </div>

                                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '100px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>Survey Questions</h2>
                                        <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>{questions.length} Items</span>
                                    </div>

                                    {selectedSurveyView === '1stYear' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                            {PO_DEFINITIONS.map((po) => {
                                                const poQuestions = questions.filter(q => q.poId === po.id);
                                                const currentPoWeight = poQuestions.reduce((sum, q) => sum + (Number(q.weight) || 0), 0);
                                                return (
                                                    <div key={po.id} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                                            <div style={{ flex: 1, paddingRight: '20px' }}>
                                                                <h3 style={{ color: 'var(--gold)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>PO-{po.id}: {po.title}</h3>
                                                                <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{po.desc}</p>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                                <span style={{ fontSize: '0.9rem', color: currentPoWeight === 100 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                                                    Total Weight: {currentPoWeight}%
                                                                </span>
                                                                {currentPoWeight !== 100 && poQuestions.length > 0 && (
                                                                    <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>⚠️ Must equal exactly 100%</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {poQuestions.length === 0 ? (
                                                            <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
                                                                <p style={{ color: 'var(--text-sub)', marginBottom: '15px' }}>No questions added for PO-{po.id} yet.</p>
                                                                <button 
                                                                    onClick={() => addPOQuestion(po.id)} 
                                                                    style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: 'var(--gold)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(234, 179, 8, 0.2)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)'}
                                                                >
                                                                    + Add First Question
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {poQuestions.map((q, index) => {
                                                                    const isActive = activeQuestionId === q.id;
                                                                    const isHovered = hoveredQuestionId === q.id;
                                                                    return (
                                                                        <div key={q.id} 
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
                                                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                                                <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '8px' }}>{index + 1}.</div>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        value={q.text} 
                                                                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} 
                                                                                        placeholder="Type question title here..." 
                                                                                        style={{ width: '100%', fontSize: '1.1rem', background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', padding: '10px 0', borderBottom: isActive || isHovered ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'border-color 0.3s' }} 
                                                                                    />
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', opacity: isActive || isHovered ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                                                                                    <input
                                                                                        type="number"
                                                                                        className="correction-textbox"
                                                                                        value={q.weight || ''}
                                                                                        onChange={(e) => updateQuestion(q.id, 'weight', e.target.value)}
                                                                                        placeholder="0"
                                                                                        style={{ width: '40px', height: '30px', textAlign: 'center', padding: 0, backgroundColor: 'var(--bg-main)' }}
                                                                                    />
                                                                                    <span style={{ color: 'var(--text-sub)', fontWeight: 'bold', fontSize: '0.85rem' }}>%</span>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} 
                                                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s', opacity: isActive || isHovered ? 1 : 0 }}
                                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div>

                                                                            <div style={{ marginLeft: '30px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
                                                                                    <div style={{ flex: 1 }}></div>
                                                                                    <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 'bold', paddingRight: '40px' }}>
                                                                                        <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {q.options?.map((opt, optIndex) => (
                                                                                    <div key={optIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                                                        <div style={{ flex: 1, paddingRight: '15px' }}>
                                                                                            <input 
                                                                                                type="text" 
                                                                                                value={opt} 
                                                                                                onChange={(e) => handleOptionTextChange(q.id, optIndex, e.target.value)} 
                                                                                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '5px', fontSize: '0.9rem', outline: 'none' }} 
                                                                                                placeholder={`Sub-item ${optIndex + 1}`} 
                                                                                            />
                                                                                        </div>
                                                                                        <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                            <input type="radio" disabled style={{ opacity: 0.5 }}/>
                                                                                            <input type="radio" disabled style={{ opacity: 0.5 }}/>
                                                                                            <input type="radio" disabled style={{ opacity: 0.5 }}/>
                                                                                            <input type="radio" disabled style={{ opacity: 0.5 }}/>
                                                                                            <input type="radio" disabled style={{ opacity: 0.5 }}/>
                                                                                            <button onClick={(e) => { e.stopPropagation(); handleRemoveOption(q.id, optIndex); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0 0 15px', opacity: isActive ? 1 : 0 }}>×</button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}

                                                                                {isActive && (
                                                                                    <button 
                                                                                        onClick={(e) => { e.stopPropagation(); handleAddOption(q.id); }} 
                                                                                        style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px', marginTop: '10px' }}
                                                                                    >
                                                                                        + Add Sub-item
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                <button 
                                                                    onClick={() => addPOQuestion(po.id)} 
                                                                    style={{ 
                                                                        border: '2px dashed rgba(234, 179, 8, 0.3)', background: 'transparent', color: 'var(--gold)', padding: '15px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' 
                                                                    }} 
                                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)'; e.currentTarget.style.borderColor = 'var(--gold)'; }} 
                                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)'; }}
                                                                >
                                                                    <span style={{ fontSize: '1.2rem' }}>➕</span> Add New Question to PO-{po.id}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
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

                )}

                {activeMenu === 'determinants' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="pc-header" style={{ marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Dynamic Curriculum Mapping</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Map your entire CpE curriculum to specific Program Outcomes (PO-A to PO-L).</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                            
                            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 10, paddingBottom: '15px', paddingTop: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Search for a course..." 
                                        className="correction-textbox"
                                        value={mappingSearchQuery}
                                        onChange={(e) => setMappingSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '10px 15px', height: '45px', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                                
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                                    {CPE_CURRICULUM.map((yearLevel, yIdx) => {
                                        const filteredCourses = yearLevel.courses.filter(c => c.toLowerCase().includes(mappingSearchQuery.toLowerCase()));
                                        if (filteredCourses.length === 0) return null;
                                        
                                        return (
                                            <div key={yIdx} style={{ marginBottom: '20px' }}>
                                                <h3 style={{ color: 'var(--gold)', fontSize: '1rem', borderBottom: '1px solid rgba(234, 179, 8, 0.3)', paddingBottom: '5px', marginBottom: '10px' }}>
                                                    {yearLevel.year}
                                                </h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {filteredCourses.map((course, cIdx) => {
                                                        const isSelected = selectedMappingCourse === course;
                                                        const mappedCount = Object.keys(courseMappings[course] || {}).filter(k => courseMappings[course][k]).length;
                                                        return (
                                                            <div 
                                                                className="mapping-card"
                                                                key={cIdx} 
                                                                onClick={() => setSelectedMappingCourse(course)}
                                                                style={{ 
                                                                    padding: '15px', 
                                                                    borderRadius: '8px', 
                                                                    backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--bg-card)', 
                                                                    border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? 'var(--gold)' : 'var(--text-main)', lineHeight: '1.4' }}>
                                                                    {course}
                                                                </span>
                                                                {mappedCount > 0 && (
                                                                    <span style={{ backgroundColor: 'var(--gold)', color: '#000', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                                                                        {mappedCount} POs
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {CPE_CURRICULUM.every(yl => yl.courses.filter(c => c.toLowerCase().includes(mappingSearchQuery.toLowerCase())).length === 0) && (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>No courses found.</div>
                                    )}
                                </div>
                            </div>

                            <div style={{ width: '60%' }}>
                                {!selectedMappingCourse ? (
                                    <div className="portal-card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-sub)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👈</div>
                                        <h3 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>Select a Course</h3>
                                        <p>Click on a subject from the list to map its Program Outcomes.</p>
                                    </div>
                                ) : (
                                    <div className="portal-card" style={{ borderTop: '6px solid var(--gold)', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                            <div>
                                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: '0 0 5px 0' }}>Currently Mapping:</p>
                                                <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: 0, lineHeight: '1.4' }}>{selectedMappingCourse}</h2>
                                            </div>
                                            <button className="primary-btn" onClick={saveOverallMapping} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                                                💾 Save Mapping
                                            </button>
                                        </div>
                                        
                                        <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {PO_DEFINITIONS.map((po) => {
                                                const isChecked = courseMappings[selectedMappingCourse]?.[po.id] || false;
                                                return (
                                                    <div 
                                                        className="po-mapping-card"
                                                        key={po.id} 
                                                        onClick={() => togglePOMapping(selectedMappingCourse, po.id)}
                                                        style={{ 
                                                            display: 'flex', 
                                                            gap: '15px', 
                                                            padding: '15px', 
                                                            backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)', 
                                                            border: isChecked ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.05)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            alignItems: 'flex-start'
                                                        }}
                                                    >
                                                        <div style={{ marginTop: '2px' }}>
                                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: isChecked ? 'none' : '2px solid var(--text-sub)', backgroundColor: isChecked ? '#10b981' : 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                {isChecked && <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>✓</span>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                                <span style={{ backgroundColor: isChecked ? '#10b981' : 'var(--bg-main)', color: isChecked ? '#fff' : 'var(--text-sub)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>PO-{po.id}</span>
                                                                <h4 style={{ margin: 0, color: isChecked ? '#10b981' : 'var(--text-main)', fontSize: '0.95rem' }}>{po.title}</h4>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: '1.4' }}>{po.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeMenu === 'analytics' && (
                    <div id="printable-report" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div className="pc-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Reports & Analytics</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Select a report module to view collected data and export to PDF.</p>
                            </div>
                            <button className="primary-btn" onClick={handleExportPDF} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                🖨️ Export as PDF
                            </button>
                        </div>

                        <div className="tab-container" style={{ marginBottom: '20px' }}>
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
                                                {filteredChecklist.map((student, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                        <td>{student.batch}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{student.det1Grade || 'N/A'}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{student.det2Grade || 'N/A'}</td>
                                                        <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{student.det3Grade || 'N/A'}</td>
                                                        <td>
                                                            <span className={`status-badge ${student.obeStatus === 'Pending' ? 'badge-pending' : 'badge-passed'}`}>
                                                                {student.obeStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredChecklist.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                            No records found for this batch.
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
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalChecklist}</div>
                                                </div>
                                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <h4 style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '10px' }}>SO Survey Completion Rate</h4>
                                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{c_poRate}%</div>
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
                                                        {filteredChecklist.map((student, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                                <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                                <td>{student.batch}</td>
                                                                <td>
                                                                    <span className={`status-badge ${student.surveyProgress === '100%' ? 'badge-passed' : 'badge-pending'}`}>
                                                                        {student.surveyProgress === '100%' ? 'Completed' : 'Pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {filteredChecklist.length === 0 && (
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
                                                        {filteredChecklist.map((student, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                                                <td style={{ fontWeight: '600' }}>{student.name}</td>
                                                                <td>{student.batch}</td>
                                                                <td>
                                                                    <span className="status-badge badge-pending">Pending</span>
                                                                </td>
                                                            </tr>
                                                        ))}
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
                                        </div>
                                    </div>

                                    {gtsReportTab === 'custom' && (
                                        <div style={{ marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.3s ease' }}>
                                            <h4 style={{ margin: '0 0 15px 0', color: 'var(--gold)', fontSize: '1.1rem' }}>Select Columns to Display</h4>
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {tracerSchema.map(q => (
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

                                    <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: '150px', position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 2 }}>Alumni Name</th>
                                                    <th style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 2 }}>Batch</th>
                                                    {(gtsReportTab === 'custom' ? tracerSchema.filter(q => selectedGtsCols.includes(q.id)) : tracerSchema).map(q => (
                                                        <th key={q.id} style={{ minWidth: '200px', position: 'sticky', top: 0, backgroundColor: 'var(--bg-main)', zIndex: 2 }}>{q.text}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredChecklist.map((student, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 'bold' }}>{student.name}</td>
                                                        <td>{student.batch}</td>
                                                        {(gtsReportTab === 'custom' ? tracerSchema.filter(q => selectedGtsCols.includes(q.id)) : tracerSchema).map(q => {
                                                            const ans = student.surveyAnswers?.gts?.[q.id];
                                                            const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || '-');
                                                            return (
                                                                <td key={q.id} style={{ color: 'var(--text-sub)' }}>
                                                                    {displayAns}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                                {filteredChecklist.length === 0 && (
                                                    <tr>
                                                        <td colSpan={(gtsReportTab === 'custom' ? selectedGtsCols.length : tracerSchema.length) + 2} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                                                            No data available. Upload masterlist first.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
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
                                    {selectedStudent.employmentStatus}
                                </p>
                                {selectedStudent.employmentStatus === 'employed' && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '5px' }}>
                                        {selectedStudent.jobTitle || 'No title'} @ {selectedStudent.companyName || 'No company'}
                                    </p>
                                )}
                            </div>
                            <div style={{ flex: '1 1 200px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '10px' }}>Indirect Assessment</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Alumni Survey:</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>{selectedStudent.surveyProgress}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Tracer Study:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>{selectedStudent.tracerProgress}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Employer Form:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'capitalize' }}>{selectedStudent.employerStatus}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,215,0,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '25px' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '10px' }}>Direct Assessment (OBE Grading)</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '15px', lineHeight: '1.4' }}>
                                Encode the student's evaluated outcome grade for all 3 determinant sets.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Det. 1 (a-d) Grade:</label>
                                    <input 
                                        type="text" className="correction-textbox" placeholder="e.g., 1.25"
                                        style={{ width: '150px', height: '35px', padding: '0 10px', backgroundColor: 'var(--bg-main)' }}
                                        value={selectedStudent.det1Grade || ''}
                                        onChange={e => setSelectedStudent({...selectedStudent, det1Grade: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Det. 2 (e-h) Grade:</label>
                                    <input 
                                        type="text" className="correction-textbox" placeholder="e.g., 1.50"
                                        style={{ width: '150px', height: '35px', padding: '0 10px', backgroundColor: 'var(--bg-main)' }}
                                        value={selectedStudent.det2Grade || ''}
                                        onChange={e => setSelectedStudent({...selectedStudent, det2Grade: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Det. 3 (i-l) Grade:</label>
                                    <input 
                                        type="text" className="correction-textbox" placeholder="e.g., 1.00"
                                        style={{ width: '150px', height: '35px', padding: '0 10px', backgroundColor: 'var(--bg-main)' }}
                                        value={selectedStudent.det3Grade || ''}
                                        onChange={e => setSelectedStudent({...selectedStudent, det3Grade: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                className="cancel-btn outline-btn" 
                                onClick={() => setSelectedStudent(null)} 
                                style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="primary-btn" 
                                onClick={saveEvaluation} 
                                style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1, border: 'none' }}
                            >
                                Save Evaluated Grades
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
            `}} />
        </div>
    );
}

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
import Masterlist from '../registrar/pages/Masterlist';
import Direct from './components/direct/Direct';
import Indirect from './components/indirect/Indirect';


//==================================================
// CONSTANTS
//==================================================
import { 
    PO_DEFINITIONS,
    CPE_CURRICULUM,
} from '@/shared/constants/constants';



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
    { id: 'qL1', poId: 'L', type: 'likert', text: 'As a member', weight: 40, options: ['Knowledge and understanding of engineering management principles', 'Apply engineering and management principles', 'Participative/Contributor'] },
    { id: 'qL2', poId: 'L', type: 'likert', text: 'As a Leader', weight: 60, options: ['Knowledge and understanding of engineering management principles', 'Apply engineering and management principles', 'Achieve project objective'] }
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

const firstNames = ["Mark", "John", "Maria", "Ana", "Jose", "Paul", "Michelle", "Sarah", "Christian", "Kevin", "Dennis", "Grace", "Mary", "Peter", "Richard", "Erica", "Jason", "Jessica", "Michael", "Rachelle", "Jerome", "Alyssa", "Brian", "Nicole", "Kevin"];
const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Tomas", "Aquino", "Ramos", "Castro", "Villanueva", "Diaz", "Navarro", "Fernandez", "Mercado", "Perez", "Tolentino", "Gomez", "Gammaru"];
const cities = ["Muntinlupa City", "Las Pinas City", "Quezon City", "Manila", "Makati City", "Taguig City", "Paranaque City", "Pasig City", "Caloocan City", "Marikina City"];
const streets = ["Rizal St.", "Mabini St.", "Quezon Ave.", "Bonifacio St.", "Aguinaldo St.", "Marcos Highway", "Taft Ave.", "Ayala Ave.", "Ortigas Ave.", "Shaw Blvd."];
const companies = ["Accenture", "IBM", "Globe Telecom", "Smart Communications", "BDO", "Maya", "Samsung", "HP", "Oracle", "Microsoft", "Intel", "Cisco", "GCash", "Tencent", "Deloitte"];
const jobTitles = ["Software Engineer", "Network Engineer", "Systems Analyst", "Web Developer", "IT Consultant", "Data Analyst", "Cybersecurity Analyst", "Quality Assurance Tester", "Backend Developer", "Frontend Developer", "DevOps Engineer", "Cloud Architect"];
const regions = ["NCR", "Region 4A", "Region 3", "Region 1", "Region 7"];

const MOCK_GTS_RESPONSES = Array(70).fill(null).map(() => {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = ["Maria", "Ana", "Michelle", "Sarah", "Grace", "Mary", "Erica", "Jessica", "Rachelle", "Alyssa", "Nicole"].includes(fName) ? "Female" : "Male";
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const isEmployed = Math.random() > 0.15 ? "Yes" : "No";
    const empStatus = isEmployed === "Yes" ? (Math.random() > 0.4 ? "Regular" : "Contractual") : "N/A";
    const isFirstJob = Math.random() > 0.5 ? "Yes" : "No";

    return {
        q1: `${fName} ${lName}`,
        q2: `${Math.floor(Math.random() * 900) + 100} ${street}, ${city}`,
        q3: `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 99)}@gmail.com`,
        q4: `02-${Math.floor(Math.random() * 800) + 100}-${Math.floor(Math.random() * 8000) + 1000}`,
        q5: `09${Math.floor(Math.random() * 900000000) + 100000000}`,
        q6: Math.random() > 0.7 ? "Married" : "Single",
        q7: gender,
        q8: `200${Math.floor(Math.random() * 4)}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 9)}`,
        q9: region,
        q10: region === "NCR" ? "Metro Manila" : (region === "Region 4A" ? "Laguna" : "Bulacan"),
        q11: "City",
        q12: "B.S. Computer Engineering",
        q13: "None",
        q14: ["Prospect for immediate employment", "Strong passion for the profession"],
        q15: Math.random() > 0.8 ? "Cisco Certified Network Associate (CCNA)" : "None",
        q16: isEmployed,
        q17: isEmployed === "No" ? ["Advance or further study"] : [],
        q18: empStatus,
        q19: isEmployed === "Yes" ? jobTitle : "N/A",
        q20: isEmployed === "Yes" ? company : "N/A",
        q21: isEmployed === "Yes" ? (Math.random() > 0.9 ? "Abroad" : "Local") : "N/A",
        q22: isFirstJob,
        q23: isEmployed === "Yes" ? ["Salaries and benefits", "Career challenge"] : [],
        q24: ["Related to special skills"],
        q25: isFirstJob === "No" ? ["Career challenge"] : [],
        q26: "N/A",
        q27: Math.random() > 0.5 ? "1 to 6 months" : "1 year to less than 2 years",
        q28: Math.random() > 0.5 ? "Response to an advertisement" : "Information from friends",
        q29: Math.random() > 0.4 ? "1 to 6 months" : "Less than a month",
        q30: Math.random() > 0.2 ? "Professional, Technical or Supervisory" : "Managerial or Executive",
        q31: Math.random() > 0.3 ? "P25,000.00 and above" : "P20,000.00 to less than P25,000.00",
        q32: "Yes",
        q33: ["Information Technology skills", "Problem-solving skills"],
        q34: "Incorporate more industry-standard frameworks into the capstone project."
    };
});
const GTS_ANALYTICS_VARIABLES = DEFAULT_GTS_QUESTIONS
    .filter(q => ['radio', 'dropdown', 'yesno'].includes(q.type))
    .map(q => ({ label: q.text, value: q.id }));

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
        
        if (activeMenu === 'analytics') {
            const existingGts = localStorage.getItem('obe_form_gts');
            if (existingGts) {
                setTracerSchema(JSON.parse(existingGts).questions || []);
            } else {
                setTracerSchema(DEFAULT_GTS_QUESTIONS);
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

    const gtsAnalyticsCounts = {};
    MOCK_GTS_RESPONSES.forEach(res => {
        const val = res[gtsAnalyticsField] || "No Response";
        gtsAnalyticsCounts[val] = (gtsAnalyticsCounts[val] || 0) + 1;
    });
    const gtsAnalyticsResults = Object.keys(gtsAnalyticsCounts).map(key => ({
        _id: key,
        frequency: gtsAnalyticsCounts[key],
        percent: (gtsAnalyticsCounts[key] / 70) * 100
    })).sort((a, b) => b.frequency - a.frequency);

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

                    />

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
                                            <button className={`outline-btn ${gtsReportTab === 'analytics' ? 'active' : ''}`} onClick={() => setGtsReportTab('analytics')} style={{ padding: '8px 16px', backgroundColor: gtsReportTab === 'analytics' ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: gtsReportTab === 'analytics' ? 'var(--gold)' : '' }}>Analytics</button>
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

                                    {gtsReportTab === 'analytics' && (
                                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                                <select
                                                    className="control-select custom-select-arrow"
                                                    style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', width: '250px' }}
                                                    value={gtsAnalyticsField}
                                                    onChange={(e) => setGtsAnalyticsField(e.target.value)}
                                                >
                                                    {GTS_ANALYTICS_VARIABLES.map(v => (
                                                        <option key={v.value} value={v.value}>{v.label}</option>
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
                                                    </tbody>
                                                    <tfoot>
                                                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                                            <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Total Respondents (N)</td>
                                                            <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: 'bold' }}>70</td>
                                                            <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: 'bold' }}>100.00%</td>
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
                                                        {(gtsReportTab === 'custom' ? tracerSchema.filter(q => selectedGtsCols.includes(q.id)) : tracerSchema).map(q => (
                                                            <th key={q.id} style={{ padding: '15px 20px', minWidth: '220px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{q.text}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {MOCK_GTS_RESPONSES.map((response, idx) => (
                                                        <tr 
                                                            key={idx} 
                                                            style={{ backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background-color 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                                                        >
                                                            <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: 'var(--text-main)' }}>{response.q1}</td>
                                                            <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>Batch 2026</td>
                                                            {(gtsReportTab === 'custom' ? tracerSchema.filter(q => selectedGtsCols.includes(q.id)) : tracerSchema).map(q => {
                                                                const ans = response[q.id];
                                                                const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || '-');
                                                                return (
                                                                    <td key={q.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-sub)' }}>
                                                                        {displayAns}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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
                    .sidebar, .primary-btn, .outline-btn, .tab-btn {
                        display: none !important;
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
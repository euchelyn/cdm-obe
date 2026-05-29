import { 
    CPE_CURRICULUM,
    PO_DEFINITIONS
} from "@/shared/constants/constants";
import { useState, useEffect } from "react";
import { 
    createDeterminant, 
    updateDeterminant, 
    getDeterminantsByVersion 
} from "@/services/determinantService";

const CURRENT_VERSION = new Date().getFullYear().toString();

// ─── Map year label to year_level key ─────────────────────────────────────────
const YEAR_LABEL_TO_KEY: Record<string, string> = {
    '1st Year': '1st Year',
    '2nd Year': '2nd Year',
    '3rd Year': '3rd Year',
    '4th Year': '4th Year',
};

// ─── Get year level for a given course ───────────────────────────────────────
function getYearLevelByCourse(courseName: string): string | null {
    for (const entry of CPE_CURRICULUM) {
        if (entry.courses.includes(courseName)) {
            return entry.year;
        }
    }
    return null;
}

// ─── Group flat mapping data by year ─────────────────────────────────────────
function groupByYear(
    data: Record<string, Record<string, boolean>>
): Record<string, Record<string, Record<string, boolean>>> {
    const grouped: Record<string, Record<string, Record<string, boolean>>> = {
        '1st Year': {},
        '2nd Year': {},
        '3rd Year': {},
        '4th Year': {},
    };

    for (const [course, soMap] of Object.entries(data)) {
        const year = getYearLevelByCourse(course);
        if (!year) continue;
        grouped[year][course] = soMap;
    }

    return grouped;
}

export default function Determinants({
    courseMappings, setCourseMappings,
    showToast
}) {

    const [selectedMappingCourse, setSelectedMappingCourse] = useState(null);
    const [mappingSearchQuery, setMappingSearchQuery] = useState('');

    // ─── Store DB ids per year level so we know POST vs PUT ──────────────────
    const [determinantIds, setDeterminantIds] = useState<Record<string, string | null>>({
        '1st Year': null,
        '2nd Year': null,
        '3rd Year': null,
        '4th Year': null,
    });

    // ─── On mount: load from DB, fallback to localStorage ────────────────────
    useEffect(() => {
        const loadDeterminants = async () => {
            try {
                const results = await getDeterminantsByVersion(CURRENT_VERSION);

                if (!results || results.length === 0) {
                    // fallback to localStorage
                    const local = localStorage.getItem('obe_course_mappings');
                    if (local) setCourseMappings(JSON.parse(local));
                    return;
                }

                // flatten all year slices back into one courseMappings object
                const flattened: Record<string, Record<string, boolean>> = {};
                const ids: Record<string, string | null> = {
                    '1st Year': null,
                    '2nd Year': null,
                    '3rd Year': null,
                    '4th Year': null,
                };

                results.forEach((doc: any) => {
                    if (doc.data) {
                        Object.assign(flattened, doc.data);
                    }
                    if (doc.year_level && ids.hasOwnProperty(doc.year_level)) {
                        ids[doc.year_level] = doc._id;
                    }
                });

                setCourseMappings(flattened);
                setDeterminantIds(ids);
                localStorage.setItem('obe_course_mappings', JSON.stringify(flattened));
            } catch (e: any) {
                // fallback to localStorage on error
                console.error('Failed to load determinants:', e.message);
                const local = localStorage.getItem('obe_course_mappings');
                if (local) setCourseMappings(JSON.parse(local));
            }
        };

        loadDeterminants();
    }, []);

    const togglePOMapping = (courseName: string, poId: string) => {
        setCourseMappings(prev => {
            const courseData = prev[courseName] || {};
            const newCourseData = { ...courseData, [poId]: !courseData[poId] };
            const newState = { ...prev, [courseName]: newCourseData };
            localStorage.setItem('obe_course_mappings', JSON.stringify(newState));
            return newState;
        });
    };

    // ─── Save: group by year, then POST or PUT each year slice ───────────────
    const saveOverallMapping = async () => {
        try {
            localStorage.setItem('obe_course_mappings', JSON.stringify(courseMappings));

            const grouped = groupByYear(courseMappings);
            const updatedIds = { ...determinantIds };

            for (const [year_level, data] of Object.entries(grouped)) {
                if (Object.keys(data).length === 0) continue;

                const existingId = determinantIds[year_level];

                if (existingId) {
                    await updateDeterminant(existingId, {
                        version: CURRENT_VERSION,
                        program: 'BSCPE',
                        year_level,
                        data,
                    });
                } else {
                    const result = await createDeterminant({
                        version: CURRENT_VERSION,
                        program: 'BSCPE',
                        year_level,
                        data,
                    });
                    updatedIds[year_level] = result.id;
                }
            }

            setDeterminantIds(updatedIds);
            showToast('Curriculum mapping saved successfully! Changes are now applied system-wide.', 'success');
        } catch (e: any) {
            showToast(`Failed to save mapping: ${e.message}`, 'error');
        }
    };

    return(
        <>
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
        </>
    );
}
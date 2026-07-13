import { PO_DEFINITIONS } from "@/shared/constants/constants";
import { useState, useEffect } from "react";
import { createWeights, updateWeights, getWeightsByVersion } from "@/services/weightService";

const CURRENT_VERSION = new Date().getFullYear().toString();

export default function Direct({
    showToast,
    courseWeights, setCourseWeights,
    courseMappings,
}) {

    const [weightsId, setWeightsId] = useState<string | null>(null);

    // ─── Load weights from DB on mount ───────────────────────────────────────
    useEffect(() => {
        const loadWeights = async () => {
            try {
                const results = await getWeightsByVersion(CURRENT_VERSION);

                if (!results || results.length === 0) {
                    const local = localStorage.getItem('obe_course_weights');
                    if (local) setCourseWeights(JSON.parse(local));
                    return;
                }

                const doc = results[0];
                setCourseWeights(doc.data ?? {});
                setWeightsId(doc._id);
                localStorage.setItem('obe_course_weights', JSON.stringify(doc.data ?? {}));
            } catch (e: any) {
                console.error('Failed to load weights:', e.message);
                const local = localStorage.getItem('obe_course_weights');
                if (local) setCourseWeights(JSON.parse(local));
            }
        };

        loadWeights();
    }, []);

    // ─── Save weights to DB ──────────────────────────────────────────────────
    const saveAllWeights = async () => {
        try {
            localStorage.setItem('obe_course_weights', JSON.stringify(courseWeights));

            if (weightsId) {
                await updateWeights(weightsId, {
                    version: CURRENT_VERSION,
                    program: 'BSCPE',
                    data: courseWeights,
                });
            } else {
                const result = await createWeights({
                    version: CURRENT_VERSION,
                    program: 'BSCPE',
                    data: courseWeights,
                });
                setWeightsId(result.id);
            }

            showToast('Direct Assessment weights have been saved successfully!', 'success');
        } catch (e: any) {
            showToast(`Failed to save weights: ${e.message}`, 'error');
        }
    };

    const calculateTotalWeight = (poId) => {
        const weights = courseWeights[poId] || {};
        const mappedCourses = Object.keys(courseMappings).filter(c => courseMappings[c][poId]);
        return mappedCourses.reduce((sum, course) => sum + (Number(weights[course]) || 0), 0);
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

    return(
        <>
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
        </>
    );
}
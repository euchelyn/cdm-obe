import { useState, useEffect } from "react";
import { getProgramOverview } from "@/services/pcOverviewService";
import { getCorrections, updateCorrection } from "@/services/correctionService";


export default function ProgramOverview({
    activeMenu, setActiveMenu,
    setSelectedSurveyView,
    setSurveySubTab
}) {

    const [overviewCount, setOverviewCount] = useState({
        totalActive: 0,
        tracerRate: 0,
        pendingAssessments: 0,
    });

    const [corrections, setCorrections] = useState([]);
    const [showCorrectionsModal, setShowCorrectionsModal] = useState(false);
    const [savingId, setSavingId] = useState(null);

    const pendingCorrections = corrections.filter(c => c.status === 'pending').length;

    useEffect(() => {
        async function loadOverview() {
            try {
                const data = await getProgramOverview();
                setOverviewCount({
                    totalActive: data.totalAlumni ?? 0,
                    tracerRate: data.tracerCompletionRate ?? 0,
                    pendingAssessments: data.pendingDirectAssessments ?? 0,
                });
            } catch (err) {
                console.error("Failed to load program overview:", err);
            }
        }

        loadOverview();
        loadCorrections();
    }, []);

    const loadCorrections = async () => {
        try {
            const data = await getCorrections();
            setCorrections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load correction requests:", err);
        }
    };

    const markCorrectionComplete = async (corr) => {
        setSavingId(corr._id);
        try {
            await updateCorrection(corr._id, {
                student_id: corr.student_id,
                batch: corr.batch,
                program: corr.program,
                name: corr.name,
                data: corr.data,
                status: 'completed',
            });
            await loadCorrections();
        } catch (err) {
            console.error("Failed to mark correction complete:", err);
        } finally {
            setSavingId(null);
        }
    };

    const formatDate = (d) => {
        if (!d) return '';
        try {
            return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return(
        <>
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
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.totalActive}</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #10b981', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Tracer Study Completion</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.tracerRate}%</div>
                            </div>
                            <div className="portal-card" style={{ borderTop: '4px solid #f59e0b', padding: '25px' }}>
                                <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '10px' }}>Pending Direct Assessments</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{overviewCount?.pendingAssessments}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div className="portal-card">
                                <h2 style={{ 
                                        fontSize: '1.2rem', 
                                        color: 'var(--gold)', 
                                        marginBottom: '20px', 
                                        borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                        paddingBottom: '10px' }}>
                                    Action Center / To-Do
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {overviewCount?.pendingAssessments > 0 ? (
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ color: '#f59e0b', margin: '0 0 5px 0' }}>Encode Direct Assessments</h4>
                                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have {overviewCount?.pendingAssessments} students waiting for their Det 1-3 grades.</p>
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
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>You have {pendingCorrections} pending correction request{pendingCorrections === 1 ? '' : 's'} from Alumni.</p>
                                        </div>
                                        <button className="outline-btn" onClick={() => setShowCorrectionsModal(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Review</button>
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

                    {showCorrectionsModal && (
                        <div className="modal-overlay">
                            <div className="modal-box portal-card" style={{ maxWidth: '720px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <h2 style={{ color: 'var(--gold)', margin: 0 }}>Data Correction Requests</h2>
                                    <button onClick={() => setShowCorrectionsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
                                </div>
                                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                    {pendingCorrections} pending · {corrections.length} total. Review each request and mark it complete once the record has been corrected.
                                </p>

                                <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    {corrections.length === 0 ? (
                                        <p style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '30px' }}>No correction requests found.</p>
                                    ) : (
                                        corrections.map((corr) => {
                                            const isPending = corr.status === 'pending';
                                            return (
                                                <div key={corr._id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `4px solid ${isPending ? '#f59e0b' : '#10b981'}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>{corr.name}</h3>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '12px', backgroundColor: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isPending ? '#f59e0b' : '#10b981' }}>
                                                                    {corr.status}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                                                Batch {corr.batch} · {corr.program} · {formatDate(corr.createdAt)}
                                                            </p>
                                                            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '10px 12px' }}>
                                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '4px' }}>Requested correction:</p>
                                                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{corr.data}</p>
                                                            </div>
                                                        </div>
                                                        {isPending && (
                                                            <button
                                                                className="primary-btn"
                                                                disabled={savingId === corr._id}
                                                                onClick={() => markCorrectionComplete(corr)}
                                                                style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', opacity: savingId === corr._id ? 0.6 : 1, cursor: savingId === corr._id ? 'wait' : 'pointer' }}
                                                            >
                                                                {savingId === corr._id ? 'Saving...' : '✓ Mark Complete'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="cancel-btn outline-btn" onClick={() => setShowCorrectionsModal(false)} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
        </>
    )
}
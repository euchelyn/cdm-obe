import { useState, useEffect } from 'react';
import { getStudents } from '@/services/masterlistService';
import { getObeGradesByVersion } from '@/services/obeGradeService';

const CURRENT_VERSION = new Date().getFullYear().toString();

export default function Masterlist({
    selectedBatch, setSelectedBatch,
    setSelectedStudent
}) {
    const [students, setStudents]         = useState([]);
    const [obeGrades, setObeGrades]       = useState<Record<string, any>>({});
    const [loading, setLoading]           = useState(true);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const LIMIT = 20;

    // ─── Fetch students whenever batch or page changes ────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getStudents(currentPage, LIMIT, selectedBatch);
                setStudents(res.data ?? []);
                setTotalPages(res.totalPages ?? 1);
                setTotalCount(res.total ?? 0);
            } catch (e: any) {
                console.error('Failed to load students:', e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedBatch, currentPage]);

    // ─── Fetch OBE grades once, keyed by student_id ───────────────────────────
    useEffect(() => {
        const loadGrades = async () => {
            try {
                const grades = await getObeGradesByVersion(CURRENT_VERSION);
                // key by student_id for O(1) lookup
                const gradeMap: Record<string, any> = {};
                grades.forEach((g: any) => {
                    gradeMap[g.student_id] = g;
                });
                setObeGrades(gradeMap);
            } catch (e: any) {
                console.error('Failed to load OBE grades:', e.message);
            }
        };
        loadGrades();
    }, []);

    // reset to page 1 when batch changes
    const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBatch(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Batch Roster</h3>
                        <select
                            className="correction-textbox"
                            style={{ width: 'max-content', minWidth: '150px', backgroundColor: 'var(--bg-card)' }}
                            value={selectedBatch}
                            onChange={handleBatchChange}
                        >
                            <option value="All">All Batches</option>
                            <option value="2024">Batch 2024</option>
                            <option value="2025">Batch 2025</option>
                            <option value="2026">Batch 2026</option>
                            <option value="2027">Batch 2027</option>
                            <option value="2028">Batch 2028</option>
                        </select>
                    </div>
                    <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                        {totalCount} total students
                    </span>
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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
                                        Loading students...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
                                        No active records found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student: any, idx: number) => {
                                    const grade  = obeGrades[student.id] ?? obeGrades[student._id];
                                    const status = grade?.status ?? 'Pending';

                                    return (
                                        <tr key={idx}>
                                            <td style={{ color: 'var(--text-sub)' }}>{student.id}</td>
                                            <td style={{ fontWeight: '600' }}>{student.name}</td>
                                            <td>{student.batch}</td>
                                            <td>
                                                <span className={`status-badge ${status === 'Pending' ? 'badge-pending' : 'badge-passed'}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    className="outline-btn"
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                                                    onClick={() => setSelectedStudent({ ...student, obeGrade: grade ?? null })}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Pagination ─────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            className="outline-btn"
                            style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem' }}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Prev
                        </button>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="outline-btn"
                            style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem' }}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
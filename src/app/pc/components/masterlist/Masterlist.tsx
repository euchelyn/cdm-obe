

export default function Masterlist({
    selectedBatch, setSelectedBatch,
    displayStudents,
    setSelectedStudent
}) {

    return(
        <>
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
        </>
    )
}
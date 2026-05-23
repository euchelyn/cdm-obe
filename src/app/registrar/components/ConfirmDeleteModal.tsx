import { deleteStudent, getStudents, } from "@/services/masterlistService";

export default function ConfirmDeleteModal({
    confirmDeleteId,
    currentPage,
    itemsPerPage,
    selectedBatch,
    setMasterlist,
    setTotalPages,
    showToast,
    setConfirmDeleteId
}) {
        const confirmDelete = async () => {
            if (!confirmDeleteId) return;
    
            try {
                await deleteStudent(confirmDeleteId);
    
                const res = await getStudents(
                    currentPage,
                    itemsPerPage,
                    selectedBatch
                );
    
                setMasterlist(res.data);
                setTotalPages(res.totalPages);
    
                showToast("Student removed");
            } catch (err) {
                showToast(err.message || "Delete failed");
            } finally {
                setConfirmDeleteId(null);
            }
        };

    return (
        <>
            {confirmDeleteId && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to remove this student?</p>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button 
                                className="outline-btn" 
                                onClick={() => {
                                    setConfirmDeleteId(null);
                                }}>
                                Cancel
                            </button>
                            <button className="control-btn danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
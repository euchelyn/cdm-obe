import { useState } from "react";

//============================================
// SERVICES
//============================================
import { 
    deleteFacultyCourse,
    deleteBlock,
    getAllBlockStudents,
    deleteBlockStudent,
 } from "@/services/facultyService";

//============================================
// COMPONENTS
//============================================
import BlockSection from "../BlockSection"

export default function ManageCourses({
    activeTab,
    setOpenModal,
    fetchFacultyData,
    setBlockStudents,
    facultyCourses, setFacultyCourses,
    showToast,
    masterlist,
    renameBlockModal, setRenameBlockModal
}){

  const [courses, setCourses] = useState([]);


    const handleDeleteCourse = async (courseId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this course? This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
        await deleteFacultyCourse(courseId);

        // Remove from local facultyCourses state
        setFacultyCourses(prev => prev.filter(fc => fc._id !== courseId));

        showToast('Course deleted');

        } catch (e) {
        showToast(e.message);
        }
    };

    const handleRemoveBlock = async (courseId, blockId) => {
        try {

        // Find faculty course
        const facultyCourse = facultyCourses.find(
            fc => fc._id?.toString() === courseId?.toString()
        );

        if (!facultyCourse) {
            showToast('Faculty course not found');
            return;
        }

        // Find block
        const block = facultyCourse.blocks?.find(
            b => b._id?.toString() === blockId?.toString()
        );

        if (!block) {
            showToast('Block not found');
            return;
        }

        // Confirm deletion
        const confirmed = window.confirm(
            `Delete block "${block.name}"?`
        );

        if (!confirmed) return;

        // Delete from database
        await deleteBlock(block._id);

        // Update local state
        const updatedFacultyCourses = facultyCourses.map(fc => {

            if (fc._id?.toString() === courseId?.toString()) {

            return {
                ...fc,
                blocks: fc.blocks.filter(
                b => b._id?.toString() !== blockId?.toString()
                ),
            };
            }

            return fc;
        });

        setFacultyCourses(updatedFacultyCourses);

        showToast('Block deleted successfully');

        } catch (e) {

        showToast(e.message);

        }
    };

    const handleRemoveStudent = async (courseId, blockId, studentId) => {
        try {

        // Query the database directly
        const blockStudentsData = await getAllBlockStudents({ block_id: blockId });

        // Find the specific record
        const blockStudentRecord = blockStudentsData.find(bs =>
            bs.student?._id?.toString() === studentId?.toString()
        );


        if (!blockStudentRecord) {
            showToast('Block student record not found');
            return;
        }

        // Delete using the block_student _id
        await deleteBlockStudent(blockStudentRecord._id);

        showToast('Student removed from block');

        // Refresh data
        await fetchFacultyData();

        // Refresh block students
        const bsData = await getAllBlockStudents();
        setBlockStudents(bsData);

        } catch (e) {
        console.error('Error removing student:', e);
        showToast(e.message);
        }
    };

    return(
        <>
            {activeTab === 'manage' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="pc-header" style={{ marginBottom: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Manage Courses</h1>
                            <p style={{ color: 'var(--text-sub)' }}>Add, edit, or remove your courses and blocks</p>
                        </div>
                    </div>

                    <div className="manage-buttons">
                        <button onClick={() => setOpenModal('addcourse')} className="primary-btn">
                            ➕ Add Course
                        </button>

                        <button onClick={() => setOpenModal('addblock')} className="outline-btn">
                            📦 Add Blocks
                        </button>

                        <button onClick={() => setOpenModal('addstudents')} className="outline-btn">
                            👥 Add Students
                        </button>
                    </div>

                    {facultyCourses.length > 0 ? (
                        <div className="manage-courses-organized">
                            {facultyCourses.map(fc => (
                            <div key={fc._id} className="organized-course-card">
                                <div className="organized-course-header">
                                <span className="course-title">{fc.course?.code} {fc.course?.course}</span>
                                <span className="course-meta">{fc.school_year} — {fc.semester} Semester</span>
                                <button
                                    onClick={() => handleDeleteCourse(fc._id)}
                                    className="card-delete-btn"
                                    title="Delete Course"
                                >
                                    🗑️
                                </button>
                                </div>
                                <div className="organized-blocks-list">
                                {fc.blocks?.length > 0 ? fc.blocks.map(block => (
                                    <BlockSection
                                    key={block.name}
                                    block={block}
                                    course={fc}
                                    masterlist={masterlist}
                                    handleRemoveBlock={handleRemoveBlock}
                                    handleRemoveStudent={handleRemoveStudent}
                                    setRenameBlockModal={setRenameBlockModal}
                                    renameBlockModal={renameBlockModal}
                                    setCourses={setCourses}
                                    courses={facultyCourses}
                                    showToast={showToast}
                                    />
                                )) : (
                                    <div className="empty-blocks">No blocks</div>
                                )}
                                </div>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="empty-state">
                            <p>No courses yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
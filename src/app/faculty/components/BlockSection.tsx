import { useState } from "react";

export default function BlockSection({
  block,
  course,
  masterlist,
  handleRemoveBlock,
  handleRemoveStudent,
  setRenameBlockModal,
  renameBlockModal,
  setCourses,
  courses,
  showToast,
  searchResults = []
}) {
  const [collapsed, setCollapsed] = useState(true);

  const students = block.students || [];

  const findStudent = (sid) => {
    let student = masterlist.find(stu =>
      stu._id === sid ||
      stu._id?.toString() === sid ||
      stu.id === sid ||
      stu.id?.toString() === sid
    );

    if (!student && searchResults?.length > 0) {
      student = searchResults.find(stu =>
        stu._id === sid ||
        stu._id?.toString() === sid ||
        stu.id === sid
      );
    }

    return student;
  };

  return (
    <div className="organized-block-section">
      <div
        className="block-label-row"
        style={{ cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="block-label">{block.name}</div>

        <div className="block-student-count">
          {students.length} student{students.length !== 1 ? 's' : ''}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="block-collapse-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(c => !c);
            }}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffe066',
              fontSize: '12px'
            }}
          >
            {collapsed ? '▶' : '▼'}
          </button>

          <button
            className="block-edit-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();

              setRenameBlockModal({
                open: true,
                courseId: course._id || course.id,
                oldName: block.name,
                newName: block.name
              });
            }}
            title="Rename Block"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✏️
          </button>

          <button
            className="block-delete-btn"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();

              if (window.confirm(`Delete block "${block.name}"?`)) {
                handleRemoveBlock(
                  course._id || course.id,
                  block._id || block.name
                );
              }
            }}
            title="Remove Block"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          className="organized-students-list-vertical"
          style={{
            background: '#23272b',
            borderRadius: 10,
            marginTop: 8,
            padding: 0
          }}
        >
          {students.length > 0 ? (
            <div className="student-vertical-list">
              <div
                className="student-vertical-header"
                style={{
                  background: '#2d3136',
                  color: '#ffe066',
                  fontWeight: 700,
                  padding: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr 80px',
                  gap: '10px',
                  fontSize: '12px'
                }}
              >
                <span>ID Number</span>
                <span>Name</span>
                <span>Batch</span>
                <span style={{ textAlign: 'center' }}>Action</span>
              </div>

              {students.map((sid, index) => {
                const student = findStudent(sid);

                if (student) {
                  return (
                    <div
                      key={sid || index}
                      className="student-vertical-row"
                      style={{
                        background: '#23272b',
                        color: '#fff',
                        borderBottom: '1px solid #3a3f47',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 80px',
                        gap: '10px',
                        fontSize: '13px',
                        alignItems: 'center'
                      }}
                    >
                      <span className="student-id-col">
                        {student.id || student.student_id || 'N/A'}
                      </span>

                      <span
                        className="student-name-col"
                        style={{
                          color: '#fff',
                          fontWeight: 500
                        }}
                      >
                        {student.name || 'Unknown'}
                      </span>

                      <span className="student-batch-col">
                        {student.batch || '-'}
                      </span>

                      <span className="student-action-col" style={{ textAlign: 'center' }}>
                        <button
                          className="student-remove-btn"
                          title="Remove Student"
                          onClick={() => {
                            if (window.confirm('Remove this student from the block?')) {
                              handleRemoveStudent(
                                course._id || course.id,
                                block._id,
                                student._id
                              );
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🗑️
                        </button>
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={sid || index}
                      className="student-vertical-row"
                      style={{
                        background: '#23272b',
                        color: '#888',
                        borderBottom: '1px solid #3a3f47',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 80px',
                        gap: '10px',
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}
                    >
                      <span className="student-id-col">
                        Unknown ({String(sid).slice(-6)})
                      </span>
                      <span className="student-name-col">-</span>
                      <span className="student-batch-col">-</span>
                      <span className="student-action-col"></span>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div
              className="empty-block"
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#888'
              }}
            >
              No students in this block
            </div>
          )}
        </div>
      )}
    </div>
  );
}
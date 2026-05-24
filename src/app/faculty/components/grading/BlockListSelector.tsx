

export default function BlockListSelector({
    selectedCourseForGrading,
    selectedBlockForGrading,setSelectedBlockForGrading,
    setSelectedStudentForGrading,
    facultyCourses
}) {

    return(
        <>
            {selectedCourseForGrading && (
                <div className="selector-group">
                    <label>Select Block</label>

                    <select
                        value={selectedBlockForGrading}
                        onChange={(e) => {
                            setSelectedBlockForGrading(e.target.value);
                            setSelectedStudentForGrading('');
                        }}
                        className="form-input"
                    >
                        <option value="">Choose a block...</option>

                        {facultyCourses
                            ?.find(fc => fc._id?.toString() === selectedCourseForGrading)
                            ?.blocks?.map((b) => (
                            <option key={b._id} value={b.name}>
                                {b.name}
                            </option>
                            ))}
                    </select>
                </div>
            )}
        </>
    )
}
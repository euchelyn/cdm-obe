export default function GradeStatusCard({
    currentGradePercent,
    studentId,
    loading
}) {
    // ✅ Always log to debug
    console.log('GradeStatusCard - props:', { currentGradePercent, loading });
    
    const isLoading = loading === true;
    const hasGrade = currentGradePercent != null; // use != to catch both null and undefined
    
    return (
        <>
            <div className="grade-preview">
                {isLoading ? (
                    <div className="preview-grade">
                        <span className="preview-value">Loading...</span>
                    </div>
                ) : hasGrade ? (
                    <div className="preview-grade">
                        <span className="preview-label">Current Grade:</span>
                        <span className="preview-value">{currentGradePercent}/100</span>
                    </div>
                ) : (
                    <div className="preview-grade">
                        <span className="preview-label">Status:</span>
                        <span className="preview-value">Not Graded</span>
                    </div>
                )}
            </div>
        </>
    )
}
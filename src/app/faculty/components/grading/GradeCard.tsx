

export default function GradeCard({
    gradeColor,
    gradeNumber,
}) {

    return(
        <>
            <div
                className="student-grade-display"
                style={{ borderColor: gradeColor }}
            >
                {gradeNumber !== null ? (
                    <>
                        <div
                            className="grade-circle"
                            style={{ background: gradeColor }}
                        >
                            {gradeNumber}
                        </div>

                        <span className="grade-label">Grade</span>
                    </>
                ) : (
                    <>
                        <div
                            className="grade-circle"
                            style={{ background: gradeColor }}
                        >
                            ?
                        </div>
                        <span className="grade-label">Not Graded</span>
                    </>
                )}
            </div>
        </>
    )
}
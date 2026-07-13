
export default function DashboardButton({
    setDashboardDetail,
    icon,
    label,
    detail,
    dashboardCount
}) {

    const getCount = () => {
        switch (detail) {
            case "courses":
                return dashboardCount?.course_count ?? 0;
            case "assessments":
                return dashboardCount?.assessment_count ?? 0;
            case "graded":
                return dashboardCount?.graded_count ?? 0;
            case "students":
                return dashboardCount?.student_count ?? 0;
            default:
                return 0;
        }
    };

    return (
        <button 
            className="stat-widget" 
            onClick={() => {
                setDashboardDetail(detail)
                }}>
                <div className="stat-icon">{icon}</div>
                    <div className="stat-content">
                    <div className="stat-number">{getCount()}</div>
                <div className="stat-label">{label}</div>
            </div>
        </button>
    )
}
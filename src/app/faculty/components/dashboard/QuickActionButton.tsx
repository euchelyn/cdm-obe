

export default function QuickActionButton({
    setOpenModal,
    setActiveTab,
    modal,
    icon,
    label,
    sublabel
}) {

    return(
        <>
            <button
                onClick={() => {
                    if (modal == "addcourse") {
                        setOpenModal(modal)
                    } else {
                        setActiveTab(modal)
                    }
                }}
                className="quick-action-btn course-btn"
            >
                <div className="btn-icon">{icon}</div>
                <div className="btn-text">
                    <h4>{label}</h4>
                    <p>{sublabel}</p>
                </div>
            </button>
        </>
    )
}
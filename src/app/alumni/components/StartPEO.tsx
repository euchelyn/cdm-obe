

export default function StartPEO({
    isPEOAnswered,
    batch,
    openReviewModal,
    router
}) {

    const gradYear = Number(batch) + 4;
    const eligibleYear = gradYear + 3;
    var isPEOEligible = false;
    const currentYear = new Date().getFullYear();
    if (currentYear > eligibleYear){
        isPEOEligible = true;
    } else {
        isPEOEligible = false;
    }

    return(
        <>
            {!isPEOEligible ? (
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    marginBottom: '5px'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔒</div>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                        Not Yet Available
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                        This survey unlocks in <strong>{eligibleYear}</strong>.
                    </p>
                </div>
            ) : isPEOAnswered ? (
                <div style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: '5px'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#10b981', fontSize: '1.1rem' }}>
                        Already Completed
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                        You’ve already submitted this survey. You can only review your responses.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '5px'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '0.95rem' }}>
                            📋 Details
                        </h4>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            lineHeight: '1.6'
                        }}>
                            <li>Focuses on leadership and professional ethics.</li>
                            <li>Coordinates directly with Employer feedback.</li>
                        </ul>
                    </div>

                    <button
                        className={isPEOAnswered ? 'outline-btn' : 'primary-btn'}
                        onClick={() =>
                            isPEOAnswered
                                ? openReviewModal('peo')
                                : router.push('/alumni/peo_survey')
                        }
                        style={{
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            border: isPEOAnswered ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        {isPEOAnswered ? 'Review Responses' : 'Start PEO Survey'}
                    </button>
                </>
            )}
        </>
    )
}


export default function POCardHeader({
    currentPoWeight,
    poQuestions,
    po
}) {

    return(
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <h3 style={{ color: 'var(--gold)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>PO-{po.id}: {po.title}</h3>
                    <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>{po.desc}</p>
                </div>
                                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <span style={{ fontSize: '0.9rem', color: currentPoWeight === 100 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        Total Weight: {currentPoWeight}%
                    </span>
                                    
                    {currentPoWeight !== 100 && poQuestions.length > 0 && (
                        <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>⚠️ Must equal exactly 100%</span>
                    )}
                </div>
            </div>
        </>
    )
}
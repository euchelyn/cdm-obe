
export default function MasterlistControl({
    itemsPerPage,
    setItemsPerPage,
    setCurrentPage,
    selectedBatch,
    setSelectedBatch,
    batchOptions
}) {

    return (
        <>
            <div className="control-group">
                <span className="control-label">Showing</span>
                    <select 
                        className="control-select custom-select-arrow" 
                        value={itemsPerPage} 
                        onChange={(e) => { 
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); 
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
            </div>

            <div className="control-group">
                <select 
                    className="control-btn outline custom-select-arrow" 
                    value={selectedBatch} 
                    onChange={e => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
                >
                    <option value="All">All Batches</option>
                    {batchOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
            </div>
        </>
    )
}
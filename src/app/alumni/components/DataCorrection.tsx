import { useState } from "react";
import { createCorrection } from "@/services/correctionService";

export default function DataCorrection({
    activeModal, setActiveModal,
    showToast,
    student_id,
    batch,
    program,
    name
}) {

    const [correctionText, setCorrectionText] = useState("");

    async function handleSubmit() {
        try {
            await createCorrection({
                student_id,
                batch,
                program,
                name,
                data: correctionText,
                status: "pending"
            });

            showToast("Request Sent to Program Chair!");
            setCorrectionText("");
            setActiveModal(null);
        } catch (error) {
            console.error("Failed to submit correction:", error);
            showToast("Failed to send correction request.");
        }
    }

    return (
        <>
            {activeModal === "correction" && (
                <div className="modal-overlay">
                    <div 
                        className="modal-box portal-card" 
                        style={{ maxWidth: "450px" }}
                    >
                        <h2 
                            style={{ 
                                margin: "0 0 10px 0", 
                                color: "var(--gold)" 
                            }}
                        >
                            Data Correction Request
                        </h2>

                        <p 
                            style={{ 
                                margin: "0 0 20px 0", 
                                fontSize: "0.85rem", 
                                color: "var(--text-sub)" 
                            }}
                        >
                            Is there an error in your name, batch year, or contact info? 
                            Send a correction request to your Program Chair.
                        </p>

                        <textarea
                            className="correction-textbox"
                            placeholder="Halimbawa: Ang batch year ko po dapat ay 2026, hindi 2025..."
                            value={correctionText}
                            onChange={(e) => setCorrectionText(e.target.value)}
                            style={{
                                height: "100px",
                                padding: "15px",
                                resize: "none",
                                marginBottom: "20px"
                            }}
                        />

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                className="outline-btn cancel-btn"
                                onClick={() => {
                                    setCorrectionText("");
                                    setActiveModal(null);
                                }}
                                style={{
                                    padding: "10px",
                                    borderRadius: "8px",
                                    flex: 1
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-btn"
                                onClick={handleSubmit}
                                style={{
                                    padding: "10px",
                                    borderRadius: "8px",
                                    flex: 1,
                                    border: "none"
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
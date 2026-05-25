"use client";

import { useState } from "react";

//=======================================
// COMPONENTS
//=======================================
import POCardHeader from "./POCardHeader";

//=======================================
// CONSTANTS
//=======================================
import { PO_DEFINITIONS } from "@/shared/constants/constants";

export default function POQuestionCard({
    surveyPayload,
    setSurveyPayload,
}) {

    //=======================================
    // STATES
    //=======================================
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);

    //=======================================
    // DERIVED DATA
    //=======================================
    const allQuestions = surveyPayload?.questions
        ? Object.values(surveyPayload.questions)
        : [];

    //=======================================
    // FUNCTIONS
    //=======================================

    const addPOQuestion = (poId: string) => {

        // Get all questions under this PO
        const poQuestions = allQuestions.filter(
            (q: any) => q.poId === poId
        );

        // Extract existing numbers from ids like qA1, qA2
        const existingNumbers = poQuestions.map((q: any) => {
            const match = q.id.match(/^q[A-Z](\d+)$/);

            return match ? parseInt(match[1]) : 0;
        });

        // Find next available number
        const nextNumber =
            existingNumbers.length > 0
                ? Math.max(...existingNumbers) + 1
                : 1;

        // Generate conventional ID
        const newId = `q${poId}${nextNumber}`;

        const newQuestion = {
            id: newId,
            poId,
            type: "likert",
            text: "Untitled Question",
            options: ["New Sub-item"],
            weight: 0,
        };

        setSurveyPayload((prev: any) => ({
            ...prev,
            questions: {
                ...prev.questions,
                [newId]: newQuestion,
            },
        }));

        setActiveQuestionId(newId);
    };

    const updateQuestion = (
        id: string,
        key: string,
        value: any
    ) => {
        setSurveyPayload((prev: any) => {
            const currentQuestion = prev.questions[id];

            if (!currentQuestion) return prev;

            let updatedQuestion = {
                ...currentQuestion,
                [key]: value,
            };

            if (
                key === "type" &&
                ["radio", "checkbox", "dropdown"].includes(value) &&
                (!updatedQuestion.options ||
                    updatedQuestion.options.length === 0)
            ) {
                updatedQuestion.options = ["Option 1"];
            }

            return {
                ...prev,
                questions: {
                    ...prev.questions,
                    [id]: updatedQuestion,
                },
            };
        });
    };

    const deleteQuestion = (id: string) => {
        setSurveyPayload((prev: any) => {
            const updatedQuestions = { ...prev.questions };

            delete updatedQuestions[id];

            return {
                ...prev,
                questions: updatedQuestions,
            };
        });

        if (activeQuestionId === id) {
            setActiveQuestionId(null);
        }
    };

    const handleOptionTextChange = (
        questionId: string,
        optionIndex: number,
        value: string
    ) => {
        setSurveyPayload((prev: any) => {
            const question = prev.questions[questionId];

            if (!question) return prev;

            const updatedOptions = [...(question.options || [])];

            updatedOptions[optionIndex] = value;

            return {
                ...prev,
                questions: {
                    ...prev.questions,
                    [questionId]: {
                        ...question,
                        options: updatedOptions,
                    },
                },
            };
        });
    };

    const handleRemoveOption = (
        questionId: string,
        optionIndex: number
    ) => {
        setSurveyPayload((prev: any) => {
            const question = prev.questions[questionId];

            if (!question) return prev;

            const updatedOptions = question.options.filter(
                (_: any, index: number) => index !== optionIndex
            );

            return {
                ...prev,
                questions: {
                    ...prev.questions,
                    [questionId]: {
                        ...question,
                        options: updatedOptions,
                    },
                },
            };
        });
    };

    const handleAddOption = (questionId: string) => {
        setSurveyPayload((prev: any) => {
            const question = prev.questions[questionId];

            if (!question) return prev;

            return {
                ...prev,
                questions: {
                    ...prev.questions,
                    [questionId]: {
                        ...question,
                        options: [
                            ...(question.options || []),
                            "New Sub-item",
                        ],
                    },
                },
            };
        });
    };

    //=======================================
    // RENDER
    //=======================================
    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                }}
            >
                {PO_DEFINITIONS.map((po) => {

                    const poQuestions = allQuestions.filter(
                        (q: any) => q.poId === po.id
                    );

                    const currentPoWeight = poQuestions.reduce(
                        (sum: number, q: any) =>
                            sum + (Number(q.weight) || 0),
                        0
                    );

                    return (
                        <div
                            key={po.id}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px",
                            }}
                        >

                            {/* HEADER */}
                            <POCardHeader
                                currentPoWeight={currentPoWeight}
                                poQuestions={poQuestions}
                                po={po}
                            />

                            {/* EMPTY STATE */}
                            {poQuestions.length === 0 ? (
                                <div
                                    style={{
                                        border:
                                            "1px dashed rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        padding: "30px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "var(--text-sub)",
                                            marginBottom: "15px",
                                        }}
                                    >
                                        No questions added for PO-{po.id} yet.
                                    </p>

                                    <button
                                        onClick={() =>
                                            addPOQuestion(po.id)
                                        }
                                        style={{
                                            background:
                                                "rgba(234, 179, 8, 0.1)",
                                            border:
                                                "1px solid rgba(234, 179, 8, 0.3)",
                                            color: "var(--gold)",
                                            padding: "10px 20px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        + Add First Question
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* QUESTIONS */}
                                    {poQuestions.map((q: any, index: number) => {

                                        const isActive =
                                            activeQuestionId === q.id;

                                        const isHovered =
                                            hoveredQuestionId === q.id;

                                        return (
                                            <div
                                                key={q.id}
                                                className="portal-card"
                                                onMouseEnter={() =>
                                                    setHoveredQuestionId(q.id)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredQuestionId(null)
                                                }
                                                onClick={() =>
                                                    setActiveQuestionId(q.id)
                                                }
                                                style={{
                                                    padding: "25px",
                                                    borderRadius: "12px",
                                                    cursor: "pointer",
                                                    borderLeft: isActive
                                                        ? "4px solid #3b82f6"
                                                        : isHovered
                                                        ? "4px solid #eab308"
                                                        : "4px solid transparent",
                                                    backgroundColor: isActive
                                                        ? "var(--bg-card)"
                                                        : "rgba(0,0,0,0.2)",
                                                }}
                                            >

                                                {/* QUESTION HEADER */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "15px",
                                                        alignItems:
                                                            "flex-start",
                                                        marginBottom: "15px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color:
                                                                "var(--gold)",
                                                            fontWeight:
                                                                "bold",
                                                            fontSize: "1.2rem",
                                                            marginTop: "8px",
                                                        }}
                                                    >
                                                        {index + 1}.
                                                    </div>

                                                    <div
                                                        style={{ flex: 1 }}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={q.text || ""}
                                                            onChange={(e) =>
                                                                updateQuestion(
                                                                    q.id,
                                                                    "text",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Type question title here..."
                                                            style={{
                                                                width: "100%",
                                                                fontSize:
                                                                    "1.1rem",
                                                                background:
                                                                    "transparent",
                                                                color:
                                                                    "var(--text-main)",
                                                                border: "none",
                                                                outline: "none",
                                                            }}
                                                        />
                                                    </div>

                                                    {/* WEIGHT */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "5px",
                                                        }}
                                                    >
                                                        <input
                                                            type="number"
                                                            value={
                                                                q.weight || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateQuestion(
                                                                    q.id,
                                                                    "weight",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            style={{
                                                                width: "60px",
                                                            }}
                                                        />

                                                        <span>%</span>
                                                    </div>

                                                    {/* DELETE */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteQuestion(
                                                                q.id
                                                            );
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>

                                                {/* OPTIONS */}
                                                <div
                                                    style={{
                                                        marginLeft: "30px",
                                                        display: "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap: "10px",
                                                    }}
                                                >
                                                    {(q.options || []).map(
                                                        (
                                                            opt: string,
                                                            optIndex: number
                                                        ) => (
                                                            <div
                                                                key={optIndex}
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: "10px",
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleOptionTextChange(
                                                                            q.id,
                                                                            optIndex,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    style={{
                                                                        flex: 1,
                                                                    }}
                                                                />

                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        handleRemoveOption(
                                                                            q.id,
                                                                            optIndex
                                                                        );
                                                                    }}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        )
                                                    )}

                                                    {/* ADD OPTION */}
                                                    {isActive && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();

                                                                handleAddOption(
                                                                    q.id
                                                                );
                                                            }}
                                                        >
                                                            + Add Sub-item
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* ADD QUESTION */}
                                    <button
                                        onClick={() =>
                                            addPOQuestion(po.id)
                                        }
                                    >
                                        ➕ Add New Question to PO-{po.id}
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
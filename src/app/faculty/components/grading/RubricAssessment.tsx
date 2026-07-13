"use client";

import React, { useState, useEffect } from 'react';

export default function RubricAssessment({
    rubrics,
    currentGrade,
    studentGrades,
    setStudentGrades,
    gradeKey,
    pos,
    rubricScores,
    setRubricScores
}) {
    
    console.log('RubricAssessment - rubrics:', rubrics);
    console.log('RubricAssessment - rubricScores:', rubricScores);
    console.log('RubricAssessment - currentGrade?.scores:', currentGrade?.scores);

    const levelValues = {
        Excellent: 100,
        Good: 85,
        Fair: 70,
        Poor: 50,
    };

    return (
        <>
            <div className="grading-content">
                <h3>Rubrics Assessment</h3>

                <div className="rubrics-grading">
                    {rubrics?.map((r, idx) => {
                        // ✅ Use rubricScores if available, otherwise fallback to currentGrade
                        const selectedLevel = rubricScores?.[`r${idx}`] 
                            || currentGrade?.scores?.[`r${idx}`];

                        const currentScore = selectedLevel ? levelValues[selectedLevel] : 0;

                        return (
                            <div key={idx} className="rubric-card">
                                <div className="rubric-card-header">
                                    <h4>{r.criteria}</h4>

                                    {selectedLevel && (
                                        <div className="level-score-badge">
                                            <span className="score-value">
                                                {currentScore}
                                            </span>
                                            <span className="score-label">pts</span>
                                        </div>
                                    )}
                                </div>

                                <div className="level-buttons">
                                    {['Excellent', 'Good', 'Fair', 'Poor'].map(level => (
                                        <button
                                            key={level}
                                            className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
                                            onClick={() => {
                                                // ✅ Update rubricScores state (used by handleSaveGrades)
                                                const updatedScores = { ...rubricScores };
                                                updatedScores[`r${idx}`] = level;
                                                setRubricScores(updatedScores);

                                                // Update studentGrades for local display
                                                const updatedGrades = { ...studentGrades };
                                                if (!updatedGrades[gradeKey]) {
                                                    updatedGrades[gradeKey] = { scores: {} };
                                                }
                                                updatedGrades[gradeKey].scores[`r${idx}`] = level;
                                                setStudentGrades(updatedGrades);
                                                
                                                console.log('RubricAssessment - Selected:', level, 'for rubric', idx);
                                            }}
                                        >
                                            <div className="level-name">{level}</div>
                                            <div className="level-score">
                                                {levelValues[level]}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="rubric-pos-mapping">
                                    <span className="pos-label">Weighted to:</span>

                                    {r.program_outcomes && Object.entries(r.program_outcomes).map(([po, weight]) => {
                                        return (
                                            <div key={po} className="po-mapping-badge">
                                                <span className="po-tag-small">
                                                    PO-{po}
                                                </span>
                                                <span className="po-weight-small">
                                                    {weight}%
                                               </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}
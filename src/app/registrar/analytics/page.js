"use client";

import React, { useState, useEffect } from 'react';
import "../registrar.css";

export default function GTSAnalytics() {
    const [field, setField] = useState('employment_status');
    const [analytics, setAnalytics] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const variables = [
        { label: "Present Employment Status", value: "employment_status" },
        { label: "Employment Type", value: "employment_type" },
        { label: "Present Occupation", value: "occupation" }
    ];

    useEffect(() => {
        setLoading(true);
        fetch(`/api/gts/analytics?field=${field}`)
            .then(res => res.json())
            .then(data => {
                setAnalytics(data.data || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [field]);

    return (
        <div className="main-content">
            <div className="portal-card" style={{ maxWidth: '1600px', margin: '0 auto' }}>
                <div className="table-header-controls">
                    <h1 className="table-title">Graduate Tracer Study Results</h1>
                    <select 
                        className="control-select custom-select-arrow" 
                        value={field} 
                        onChange={(e) => setField(e.target.value)}
                    >
                        {variables.map(v => (
                            <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="clean-table">
                        <thead>
                            <tr>
                                <th>Category Variables</th>
                                <th className="text-center">Frequency (f)</th>
                                <th className="text-center">Percentage (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center">Calculating data...</td></tr>
                            ) : analytics.length > 0 ? (
                                analytics.map((item, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold">{item._id || "No Response"}</td>
                                        <td className="text-center">{item.frequency}</td>
                                        <td className="text-center">{item.percent.toFixed(2)}%</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="text-center">No data available.</td></tr>
                            )}
                        </tbody>
                        {!loading && analytics.length > 0 && (
                            <tfoot>
                                <tr style={{ backgroundColor: 'rgba(0,0,0,0.05)', fontWeight: 'bold' }}>
                                    <td>Total Respondents (N)</td>
                                    <td className="text-center">{total}</td>
                                    <td className="text-center">100.00%</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
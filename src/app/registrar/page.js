"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "../alumni/alumni-globals.css";
import "./registrar.css";

import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/masterlistService";
import { Student } from "@/types/Student"

import * as XLSX from "xlsx";

export default function RegistrarPage() {
    const router = useRouter();
    const [masterlist, setMasterlist] = useState([]);
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [batch, setBatch] = useState("");
    const [program, setProgram] = useState("");
    const [birthday, setBirthday] = useState("");
    const [toast, setToast] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [search, setSearch] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTab, setActiveTab] = useState("masterlist");
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const fileInputRef = useRef(null);
    const [totalPages, setTotalPages] = useState();
    const [batchOptions, setBatchOptions] = useState([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    /*
    useEffect(() => {
        const saved = localStorage.getItem("obe_masterlist") || "[]";
        try {
            const parsed = JSON.parse(saved);
            const withStatus = parsed.map(s => ({
                ...s,
                status: s.status || ["Active", "Pending", "Inactive"][Math.floor(Math.random() * 3)]
            }));
            setMasterlist(withStatus);
        } catch (e) {
            setMasterlist([]);
        }
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.removeAttribute('data-theme');
        } else {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("obe_masterlist", JSON.stringify(masterlist));
    }, [masterlist]);

    */

    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        let ignore = false;

        async function loadStudents() {
            setLoading(true);

            try {
                const res = await getStudents(
                    currentPage,
                    itemsPerPage,
                    selectedBatch
                );

                if (!ignore) {
                    setMasterlist(res.data);
                    setTotalPages(res.totalPages);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadStudents();

        return () => {
            ignore = true;
        };
    }, [currentPage, itemsPerPage, selectedBatch]);

    useEffect(() => {
    async function loadBatches() {
        try {
            const res = await getStudents(1, 9999, "All"); 
            const batches = Array.from(
                new Set(res.data.map((s) => s.batch).filter(Boolean))
            );

            setBatchOptions(batches);
        } catch (err) {
            console.error(err);
        }
    }

    loadBatches();
}, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            localStorage.removeItem("current_user");

            setShowLogoutConfirm(false);
            router.push("/");
        } catch (err) {
            console.error(err);
        }
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const formatBirthday = (val) => {
        if (!val) return '';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split('-');
            return `${d}/${m}/${y}`;
        }
        const parts = val.split(/[\/-]/);
        if (parts.length === 3) {
            let [a, b, c] = parts;
            if (a.length === 4) return `${c.padStart(2, '0')}/${b.padStart(2, '0')}/${a}`;
            return `${a.padStart(2, '0')}/${b.padStart(2, '0')}/${c}`;
        }
        return val;
    };

    const handleAddStudent = async () => {
        if (!name.trim() || !studentId.trim() || !birthday.trim() || !batch.trim() || !program.trim()) {
            showToast("Please provide all fields.");
            return;
        }
        if (masterlist.some((s) => s.id === studentId.trim())) {
            showToast("Student ID already exists");
            return;
        }
        const bday = formatBirthday(birthday.trim());
        const newStudent = {
            name: name.trim(),
            id: studentId.trim(),
            batch: batch.trim(),
            program: program.trim(),
            birthday: bday,
            status: "Active"
        };
        
        try {
            await createStudent(newStudent);

            setMasterlist((m) => [...m, newStudent]);
            setName("");
            setStudentId("");
            setBatch("");
            setBirthday("");
            setProgram("");
            setShowAddForm(false);
            
            showToast("Student added successfully.");
        } catch (err) {
            showToast(err.message || "Failed to add student");
        }


    };

    const handleRemove = async (id) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await deleteStudent(confirmDeleteId);

            const res = await getStudents(
                currentPage,
                itemsPerPage,
                selectedBatch
            );

            setMasterlist(res.data);
            setTotalPages(res.totalPages);

            showToast("Student removed");
        } catch (err) {
            showToast(err.message || "Delete failed");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteId(null);
    };


    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
    };

    const openEditModal = (student) => {
        setEditingStudent({ ...student });
        setActiveDropdown(null);
    };

    const handleSaveEdit = async () => {
        if (!editingStudent.name || !editingStudent.id) {
            showToast("Name and ID are required.");
            return;
        }

        try {
            await updateStudent(editingStudent.id, {
                name: editingStudent.name,
                batch: editingStudent.batch,
                program: editingStudent.program,
                birthday: editingStudent.birthday,
                status: editingStudent.status,
            });

            // refresh data from backend (IMPORTANT for pagination consistency)
            const res = await getStudents(currentPage, itemsPerPage, selectedBatch);
            setMasterlist(res.data);
            setTotalPages(res.totalPages);

            setEditingStudent(null);
            showToast("Student updated successfully.");
        } catch (err) {
            showToast(err.message || "Update failed");
        }
    };

    const parseExcel = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: "binary" });

                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];

                    const jsonData = XLSX.utils.sheet_to_json(sheet, {
                        defval: "",
                    });

                    const rows = jsonData
                        .map((row) => {
                            const name = row["STUDENT NAME"] || row["Name"];
                            const id = row["ID NUMBER"] || row["ID"];
                            const batch = row["BATCH"];
                            const program = row["PROGRAM"];
                            const birthday = row["BIRTHDAY"];

                            if (!name || !id) return null;

                            return {
                                name: String(name).trim(),
                                id: String(id).trim(),
                                batch: String(batch).trim(),
                                program: String(program).trim(),
                                birthday: String(birthday).trim(),
                            };
                        })
                        .filter(Boolean);

                    const alumniAccounts = JSON.parse(
                        localStorage.getItem("alumni_accounts") || "{}"
                    );

                    rows.forEach((r) => {
                        alumniAccounts[r.id] = {
                            usn: r.id,
                            password: r.birthday,
                        };
                    });

                    localStorage.setItem(
                        "alumni_accounts",
                        JSON.stringify(alumniAccounts)
                    );

                    resolve(
                        rows.map((r) => ({
                            name: r.name,
                            id: r.id,
                            batch: r.batch,
                            program: r.program,
                            birthday: r.birthday,
                            status: "Active",
                        }))
                    );
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const rows = await parseExcel(file);

            let added = 0;

            for (const r of rows) {
                if (!r.id || !r.name) continue;

                try {
                    await createStudent({
                        name: r.name,
                        id: r.id,
                        batch: r.batch || "",
                        program: r.program || "",
                        birthday: r.birthday || "",
                        status: "Active",
                    });

                    added++;
                } catch (err) {
                    console.error(`Failed inserting ${r.id}`, err);
                }
            }

            const res = await getStudents(currentPage, itemsPerPage, selectedBatch);

            setMasterlist(res.data);
            setTotalPages(res.totalPages);

            showToast(`${added} student(s) uploaded`);
        } catch (err) {
            console.error(err);
            showToast("Failed to upload Excel file");
        }

        e.target.value = null;
    };

    const getStatusStyle = (status) => {
        const s = status ? status.toLowerCase() : "";
        if (s === "active") return "status-active";
        if (s === "pending") return "status-pending";
        if (s === "inactive") return "status-inactive";
        return "status-default";
    };

    const getInitials = (fullName) => {
        const parts = fullName.split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return fullName.substring(0, 2).toUpperCase();
    };
    
    let filteredList = selectedBatch === "All" ? masterlist : masterlist.filter(s => s.batch === selectedBatch);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = masterlist;


    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div id="registrar-portal-layout" className="portal-layout">
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>REGISTRAR</span>
                    </div>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-btn ${activeTab === 'masterlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('masterlist')}
                    >
                        👥 Masterlist
                    </button>
                </nav>
                <div className="sidebar-bottom">
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="nav-btn logout" onClick={handleLogout}>Log Out</button>
                </div>
            </aside>

            <main className="main-content">
                {activeTab === 'masterlist' && (
                    <div className="content-wrapper">
                        <div className="portal-card">
                            <div className="table-header-controls">
                                <div className="controls-left">
                                    <h1 className="table-title">Masterlist</h1>
                                </div>
                                
                                <div className="controls-right">
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
                                    
                                    <button className="control-btn outline" onClick={() => fileInputRef.current.click()}>
                                        <span className="icon">↑</span> Export / Upload
                                    </button>
                                    <input type="file" accept=".xlsx" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />

                                    <button className="control-btn primary" onClick={() => setShowAddForm(!showAddForm)}>
                                        + Add New Student
                                    </button>
                                </div>
                            </div>

                            {showAddForm && (
                                <div className="add-form-container">
                                    <div className="form-grid">
                                        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="form-input" />
                                        <input placeholder="ID Number" value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input" />
                                        <input placeholder="Batch Year" value={batch} onChange={e => setBatch(e.target.value)} className="form-input" />
                                        <input placeholder="Program" value={program} onChange={e => setProgram(e.target.value)} className="form-input" />
                                        <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="form-input" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} />
                                        <button className="control-btn primary" onClick={handleAddStudent}>Save Student</button>
                                    </div>
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="clean-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>ID Number</th>
                                            <th>Batch</th>
                                            <th>Program</th>
                                            <th>Birthday</th>
                                            <th>Status</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.length > 0 ? currentData.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="student-name-cell">
                                                        <div className="avatar">{getInitials(s.name)}</div>
                                                        <span className="fw-bold">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{s.id}</td>
                                                <td>{s.batch || '-'}</td>
                                                <td>{s.program || '-'}</td>
                                                <td>{formatBirthday(s.birthday)}</td>
                                                <td>
                                                    <span className={`status-pill ${getStatusStyle(s.status)}`}>
                                                        {s.status || "Active"}
                                                    </span>
                                                </td>
                                                <td style={{ position: 'relative', textAlign: 'center' }}>
                                                    <button className="action-dots-btn" onClick={() => toggleDropdown(s.id)}>
                                                        •••
                                                    </button>
                                                    
                                                    {activeDropdown === s.id && (
                                                        <div className="action-dropdown-menu">
                                                            <button onClick={() => openEditModal(s)}>
                                                                ✏️ Edit
                                                            </button>
                                                            <button className="delete-option" onClick={() => handleRemove(s.id)}>
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="empty-state">No records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination-container">
                                <button 
                                    className="page-nav" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    &lt; Previous
                                </button>
                                <div className="page-numbers">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                        <button 
                                            key={num} 
                                            className={`page-num ${currentPage === num ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(num)}
                                        >
                                            {num.toString().padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    className="page-nav" 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && (
                    <div className="toast-notification">✅ {toast}</div>
                )}

                {showLogoutConfirm && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal-content">
                            <h3>Log Out</h3>
                            <p>Are you sure you want to log out?</p>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button className="outline-btn" onClick={cancelLogout}>
                                    Cancel
                                </button>
                                <button className="control-btn danger" onClick={confirmLogout}>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmDeleteId && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal-content">
                            <h3>Confirm Deletion</h3>
                            <p>Are you sure you want to remove this student?</p>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button className="outline-btn" onClick={cancelDelete}>
                                    Cancel
                                </button>
                                <button className="control-btn danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {editingStudent && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal-content">
                            <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '20px' }}>Edit Student Details</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Full Name</label>
                                    <input className="form-input" style={{ width: '100%', marginTop: '5px' }} value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Batch</label>
                                    <input className="form-input" style={{ width: '100%', marginTop: '5px' }} value={editingStudent.batch} onChange={e => setEditingStudent({...editingStudent, batch: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Program</label>
                                    <input className="form-input" style={{ width: '100%', marginTop: '5px' }} value={editingStudent.program} onChange={e => setEditingStudent({...editingStudent, program: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Birthday</label>
                                    <input type="date" className="form-input" style={{ width: '100%', marginTop: '5px', colorScheme: isDarkMode ? 'dark' : 'light' }} value={editingStudent.birthday} onChange={e => setEditingStudent({...editingStudent, birthday: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
                                <button className="outline-btn" style={{ padding: '8px 16px' }} onClick={() => setEditingStudent(null)}>Cancel</button>
                                <button className="control-btn primary" style={{ padding: '8px 16px' }} onClick={handleSaveEdit}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
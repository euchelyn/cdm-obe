'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "../alumni/alumni-globals.css";
import "./registrar.css";

export default function RegistrarPage() {
    const router = useRouter();
    const [masterlist, setMasterlist] = useState([]);
    const [programs, setPrograms] = useState([]); // Fetched from MIS
    
    // Form States
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [batch, setBatch] = useState("");
    const [selectedProgramInput, setSelectedProgramInput] = useState(""); // For manual add
    const [birthday, setBirthday] = useState("");
    
    // UI States
    const [toast, setToast] = useState(null);
    const [selectedBatchFilter, setSelectedBatchFilter] = useState("All");
    const [selectedProgramFilter, setSelectedProgramFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTab, setActiveTab] = useState("masterlist");
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Load Global Programs set by MIS
        const savedPrograms = localStorage.getItem('obe_programs');
        if (savedPrograms) {
            setPrograms(JSON.parse(savedPrograms));
        }

        // Load Masterlist
        const savedMasterlist = localStorage.getItem("obe_masterlist") || "[]";
        try {
            const parsed = JSON.parse(savedMasterlist);
            const withStatus = parsed.map(s => ({
                ...s,
                status: s.status || ["Active", "Pending", "Inactive"][Math.floor(Math.random() * 3)]
            }));
            setMasterlist(withStatus);
        } catch (e) {
            setMasterlist([]);
        }
        
        // Theme
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
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("current_user");
            router.push("/");
        }
    };

    const formatBirthday = (val) => {
        if (!val) return '';
        
        // Kung galing sa Date Picker (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split('-');
            return `${m}${d}${y.slice(-2)}`; // Converts to MMDDYY
        }
        
        // Kung galing sa CSV na may slashes o dashes
        const parts = val.split(/[\/-]/);
        if (parts.length === 3) {
            let [a, b, c] = parts;
            if (a.length === 4) return `${b.padStart(2, '0')}${c.padStart(2, '0')}${a.slice(-2)}`; // YYYY/MM/DD
            return `${a.padStart(2, '0')}${b.padStart(2, '0')}${c.slice(-2)}`; // MM/DD/YYYY
        }
        
        // Tanggalin ang kahit anong natitirang slashes/dashes
        return val.replace(/[\/\-]/g, ''); 
    };

    const handleAddStudent = () => {
        if (!name.trim() || !studentId.trim() || !birthday.trim() || !batch.trim() || !selectedProgramInput.trim()) {
            showToast("Please provide all fields, including Program.");
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
            birthday: bday,
            batch: batch.trim(),
            program: selectedProgramInput.trim(), // Linked to MIS global programs
            status: "Active"
        };
        setMasterlist((m) => [...m, newStudent]);
        
        // Auto-provision Student Portal Account
        const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
        alumniAccounts[studentId.trim()] = { usn: studentId.trim(), password: bday, role: 'student' };
        localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));
        
        setName(""); setStudentId(""); setBatch(""); setBirthday(""); setSelectedProgramInput("");
        setShowAddForm(false);
        showToast("Student added successfully.");
    };

    const handleRemove = (id) => {
        if (!window.confirm("Remove student from masterlist?")) return;
        setMasterlist((m) => m.filter((s) => s.id !== id));
        setActiveDropdown(null);
        
        // Optional: Remove account if student is removed
        const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
        delete alumniAccounts[id];
        localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));

        showToast("Student removed");
    };

    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
    };

    const openEditModal = (student) => {
        setEditingStudent({ ...student });
        setActiveDropdown(null);
    };

    const handleSaveEdit = () => {
        if (!editingStudent.name || !editingStudent.id) {
            showToast("Name and ID are required.");
            return;
        }
        
        setMasterlist(current => 
            current.map(s => s.id === editingStudent.id ? editingStudent : s)
        );
        
        // Update account password if birthday changed
        const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
        if (alumniAccounts[editingStudent.id]) {
            alumniAccounts[editingStudent.id].password = formatBirthday(editingStudent.birthday);
            localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));
        }

        setEditingStudent(null);
        showToast("Student updated successfully.");
    };

    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return [];
        const rows = lines.map((line) => {
            const cols = line.split(",").map((c) => c.trim());
            // Format: Name, ID, Birthday, Batch (Program is assigned via dropdown before upload)
            if (cols.length >= 4) {
                return {
                    name: cols[0],
                    id: cols[1],
                    birthday: formatBirthday(cols[2]),
                    batch: cols[3]
                };
            }
            return null;
        }).filter(Boolean);
        
        if (rows.length > 0) {
            const first = rows[0];
            const keys = Object.values(first).join(" ").toLowerCase();
            if (keys.includes("name") || keys.includes("id") || keys.includes("batch")) {
                rows.shift();
            }
        }
        return rows;
    };

    const handleUpload = (e) => {
        if (selectedProgramFilter === 'All') {
            showToast("Please select a specific Program before uploading a file.");
            e.target.value = null;
            return;
        }

        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const rows = parseCSV(text);
            let added = 0;

            const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');

            setMasterlist((current) => {
                const byId = new Set(current.map(s => s.id));
                const merged = [...current];
                for (const r of rows) {
                    if (!r.id || !r.name) continue;
                    if (byId.has(r.id)) continue; // Skip duplicates
                    
                    merged.push({ 
                        name: r.name, 
                        id: r.id, 
                        batch: r.batch || "", 
                        program: selectedProgramFilter, // Assign to current global filter
                        birthday: r.birthday, 
                        status: "Active" 
                    });
                    
                    // Auto-provision account
                    alumniAccounts[r.id] = { usn: r.id, password: r.birthday, role: 'student' };
                    
                    byId.add(r.id);
                    added++;
                }
                return merged;
            });
            
            localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));
            showToast(`${added} student(s) uploaded to ${selectedProgramFilter}`);
            e.target.value = null;
        };
        reader.readAsText(file);
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

    // Advanced Filtering Logic
    let filteredList = masterlist;
    if (selectedProgramFilter !== "All") {
        filteredList = filteredList.filter(s => s.program === selectedProgramFilter);
    }
    if (selectedBatchFilter !== "All") {
        filteredList = filteredList.filter(s => s.batch === selectedBatchFilter);
    }
    if (search) {
        filteredList = filteredList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
    }

    const batchOptions = Array.from(new Set(masterlist.map(s => s.batch).filter(Boolean))).sort().reverse();
    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div id="registrar-portal-layout" className="portal-layout registrar-page">
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: '#10b981', fontWeight: 'bold', letterSpacing: '1px' }}>REGISTRAR</span>
                    </div>
                </div>
                <nav className="nav-menu">
                    <button className={`nav-btn ${activeTab === 'masterlist' ? 'active' : ''}`} onClick={() => setActiveTab('masterlist')}>
                        👥 Global Masterlist
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
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="pc-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Student Masterlist</h1>
                                <p style={{ color: 'var(--text-sub)' }}>Manage enrollment records and automatically provision student portal accounts.</p>
                            </div>
                        </div>

                        <div className="portal-card" style={{ padding: '25px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>SEARCH</label>
                                    <input 
                                        type="text" 
                                        placeholder="Name or ID..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)} 
                                        className="correction-textbox" 
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>FILTER PROGRAM</label>
                                    <select className="correction-textbox" value={selectedProgramFilter} onChange={e => { setSelectedProgramFilter(e.target.value); setCurrentPage(1); }}>
                                        <option value="All">All Programs</option>
                                        {programs.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>FILTER BATCH</label>
                                    <select className="correction-textbox" value={selectedBatchFilter} onChange={e => { setSelectedBatchFilter(e.target.value); setCurrentPage(1); }}>
                                        <option value="All">All Batches</option>
                                        {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="primary-btn" onClick={() => setShowAddForm(!showAddForm)} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>
                                        {showAddForm ? 'Cancel Add' : '➕ Add Student'}
                                    </button>
                                    <button className="outline-btn" onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>
                                        ↑ Upload CSV
                                    </button>
                                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />
                                </div>
                            </div>
                        </div>

                        {showAddForm && (
                            <div className="portal-card" style={{ padding: '25px', marginBottom: '20px', borderTop: '4px solid var(--gold)' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Add Single Student</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                                    <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="correction-textbox" />
                                    <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} className="correction-textbox" />
                                    <select value={selectedProgramInput} onChange={e => setSelectedProgramInput(e.target.value)} className="correction-textbox">
                                        <option value="">Select Program...</option>
                                        {programs.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
                                    </select>
                                    <input placeholder="Batch (e.g. 2024)" value={batch} onChange={e => setBatch(e.target.value)} className="correction-textbox" />
                                    <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="correction-textbox" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} />
                                    <button className="primary-btn" onClick={handleAddStudent} style={{ height: '40px', borderRadius: '8px' }}>Save Record</button>
                                </div>
                            </div>
                        )}

                        <div className="portal-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '15px 20px' }}>Student Profile</th>
                                            <th>Program</th>
                                            <th>Batch</th>
                                            <th>Default Password (DOB)</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.length > 0 ? currentData.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '35px', height: '35px', borderRadius: '8px', backgroundColor: 'rgba(255,215,0,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                            {getInitials(s.name)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.95rem' }}>{s.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontFamily: 'monospace' }}>{s.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{s.program || 'N/A'}</td>
                                                <td>{s.batch}</td>
                                                <td style={{ fontFamily: 'monospace', color: 'var(--text-sub)' }}>{s.birthday}</td>
                                                <td>
                                                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: s.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button onClick={() => openEditModal(s)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '15px', fontWeight: 'bold' }}>Edit</button>
                                                    <button onClick={() => handleRemove(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Drop</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>No student records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length} entries
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px' }}>Prev</button>
                                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.85rem', fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px' }}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {toast && (
                    <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        ✅ {toast}
                    </div>
                )}

                {editingStudent && (
                    <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
                        <div className="modal-box portal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--gold)' }}>Edit Record</h2>
                                <button className="outline-btn" style={{ border: 'none', padding: '5px' }} onClick={() => setEditingStudent(null)}>✕</button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>Full Name</label>
                                    <input className="correction-textbox" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>Program</label>
                                    <select className="correction-textbox" value={editingStudent.program} onChange={e => setEditingStudent({...editingStudent, program: e.target.value})}>
                                        {programs.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>Batch</label>
                                        <input className="correction-textbox" value={editingStudent.batch} onChange={e => setEditingStudent({...editingStudent, batch: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>Birthday</label>
                                        <input type="text" className="correction-textbox" value={editingStudent.birthday} onChange={e => setEditingStudent({...editingStudent, birthday: e.target.value})} placeholder="MMDDYY" maxLength={6} />                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
                                <button className="outline-btn" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => setEditingStudent(null)}>Cancel</button>
                                <button className="primary-btn" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={handleSaveEdit}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
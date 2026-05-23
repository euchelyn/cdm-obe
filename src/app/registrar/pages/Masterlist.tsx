import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/masterlistService";

import { ExcelRow } from "@/shared/types/ExcelRow";
import { StudentStatus } from "@/shared/types/Student";
import MasterlistControl from "../components/MasterlistControl";

export default function Masterlist({
    activeTab,
    showToast,
    isDarkMode,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    selectedBatch, setSelectedBatch,
    masterlist, setMasterlist,
    totalPages, setTotalPages,
    batchOptions, 
    setConfirmDeleteId,
    setEditingStudent

}) {

    const [program, setProgram] = useState("");
    const [birthday, setBirthday] = useState("");
    const fileInputRef = useRef(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [batch, setBatch] = useState("");
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);


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

    const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
        try {
            const data = e.target?.result;

            const workbook = XLSX.read(data, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
            });

            const rows: ExcelRow[] = jsonData
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
            .filter(Boolean) as ExcelRow[];

            // alumni accounts
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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const rows = await parseExcel(file) as ExcelRow[];

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
            status: "Active" as StudentStatus,
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

   const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
    };

    const openEditModal = (student) => {
        setEditingStudent({ ...student });
        setActiveDropdown(null);
    };


    const handleRemove = async (id) => {
        setConfirmDeleteId(id);
    };


    return (
        <>
            {activeTab === 'masterlist' && (
                <div className="content-wrapper">
                    <div className="portal-card">
                        <div className="table-header-controls">
                            <div className="controls-left">
                                <h1 className="table-title">Masterlist</h1>
                            </div>
                                
                            <div className="controls-right">
                                <MasterlistControl 
                                    itemsPerPage={itemsPerPage}
                                    setItemsPerPage={setItemsPerPage}
                                    setCurrentPage={setCurrentPage}
                                    selectedBatch={selectedBatch}
                                    setSelectedBatch={setSelectedBatch}
                                    batchOptions={batchOptions}
                                />
                                    
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
        </>
    );
}
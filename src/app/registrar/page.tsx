"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "../alumni/alumni-globals.css";
import "./registrar.css";

import { getStudents, createStudent, updateStudent, deleteStudent } from "@/services/masterlistService";
import { Student } from "@/shared/types/Student"

import * as XLSX from "xlsx";

//==========================================
// COMPONENTS
//==========================================
import Sidebar from "./components/Sidebar";
import LogoutModal from "./components/LogoutModal";
import Masterlist from "./pages/Masterlist";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";

export default function RegistrarPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("masterlist");
    const [masterlist, setMasterlist] = useState([]);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [batchOptions, setBatchOptions] = useState([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);

    
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

    const cancelDelete = () => {
        setConfirmDeleteId(null);
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








 










    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div id="registrar-portal-layout" className="portal-layout">
            <Sidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showLogoutConfirm={showLogoutConfirm}
                setShowLogoutConfirm={setShowLogoutConfirm}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />
            <main className="main-content">
                <Masterlist 
                    activeTab={activeTab}
                    showToast={showToast}
                    isDarkMode={isDarkMode}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    selectedBatch={selectedBatch}
                    setSelectedBatch={setSelectedBatch}
                    masterlist={masterlist}
                    setMasterlist={setMasterlist}
                    totalPages={totalPages}
                    setTotalPages={setTotalPages}
                    batchOptions={batchOptions}
                    setConfirmDeleteId={setConfirmDeleteId}
                    setEditingStudent={setEditingStudent}
                />

                {toast && (
                    <div className="toast-notification">✅ {toast}</div>
                )}

                <LogoutModal 
                    showLogoutConfirm={showLogoutConfirm}
                    setShowLogoutConfirm={setShowLogoutConfirm}
                />

                <ConfirmDeleteModal 
                    confirmDeleteId={confirmDeleteId}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    selectedBatch={selectedBatch}
                    setMasterlist={setMasterlist}
                    setTotalPages={setTotalPages}
                    showToast={showToast}
                    setConfirmDeleteId={setConfirmDeleteId}
                />

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
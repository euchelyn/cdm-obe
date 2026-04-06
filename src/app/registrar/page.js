"use client";



import React, { useEffect, useState, useRef } from "react";
import "../alumni/alumni-globals.css";
import "./registrar.css";

export default function RegistrarPage() {
  const [masterlist, setMasterlist] = useState([]);
  const [sortMode, setSortMode] = useState("date-desc"); // default: newest first
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [batch, setBatch] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [search, setSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [popupStudent, setPopupStudent] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("obe_masterlist") || "[]";
    try {
      setMasterlist(JSON.parse(saved));
    } catch (e) {
      setMasterlist([]);
    }
    // Theme sync
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

  const handleAddStudent = () => {
    if (!name.trim() || !studentId.trim()) {
      showToast("Please provide Name and ID");
      return;
    }
    if (masterlist.some((s) => s.id === studentId.trim())) {
      showToast("Student ID already exists");
      return;
    }
    const newStudent = { name: name.trim(), id: studentId.trim(), batch: batch.trim() };
    setMasterlist((m) => [...m, newStudent]);
    setName("");
    setStudentId("");
    setBatch("");
    showToast("Student added");
  };

  const handleRemove = (id) => {
    if (!window.confirm("Remove student from masterlist?")) return;
    setMasterlist((m) => m.filter((s) => s.id !== id));
    showToast("Student removed");
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const rows = lines.map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      if (cols.length >= 3) {
        return { name: cols[0], id: cols[1], batch: cols[2] };
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
    return rows.map(r => ({ name: r.name, id: r.id, batch: r.batch }));
  };

  const handleUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const rows = parseCSV(text);
      let added = 0;
      setMasterlist((current) => {
        const byId = new Set(current.map(s => s.id));
        const merged = [...current];
        for (const r of rows) {
          if (!r.id || !r.name) continue;
          if (byId.has(r.id)) continue;
          merged.push({ name: r.name, id: r.id, batch: r.batch || "" });
          byId.add(r.id);
          added++;
        }
        return merged;
      });
      showToast(`${added} student(s) uploaded`);
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  // Get unique batches for filter dropdown
  const batchOptions = Array.from(new Set(masterlist.map(s => s.batch).filter(Boolean)));

  let filteredList = selectedBatch === "All" ? masterlist : masterlist.filter(s => s.batch === selectedBatch);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredList = filteredList.filter(s =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }

  // Sorting logic
  if (sortMode === "alpha-asc") {
    filteredList = [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "alpha-desc") {
    filteredList = [...filteredList].sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortMode === "id-asc") {
    filteredList = [...filteredList].sort((a, b) => a.id.localeCompare(b.id));
  } else if (sortMode === "id-desc") {
    filteredList = [...filteredList].sort((a, b) => b.id.localeCompare(a.id));
  } else if (sortMode === "date-asc") {
    filteredList = [...filteredList]; // original order (oldest first)
  } else if (sortMode === "date-desc") {
    filteredList = [...filteredList].reverse(); // newest first
  }

  return (
    <>
      <div className="registrar-bg-overlay" />
      <div className={`portal-card registrar-modern${isDarkMode ? ' dark' : ' light'}`} style={{ maxWidth: 900, margin: '40px auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.6rem', margin: 0, color: isDarkMode ? '#3b82f6' : '#1e293b', letterSpacing: 1 }}>Registrar — Masterlist</h2>
            <div style={{ color: isDarkMode ? '#64748b' : '#334155', fontSize: '1rem', marginTop: 2 }}>Add or remove students (upload CSV or manual)</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="primary-btn" style={{ padding: '10px 18px', borderRadius: 8, background: isDarkMode ? '#3b82f6' : '#2563eb', color: '#fff' }} onClick={() => fileInputRef.current.click()}>
              📥 Upload CSV
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />
            <button className="nav-btn theme-switch" style={{ marginLeft: 8 }} onClick={toggleTheme}>
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="form-input" style={{ minWidth: 180, flex: 2, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} />
          <input placeholder="ID number" value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input" style={{ minWidth: 120, flex: 1, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} />
          <input placeholder="Batch" value={batch} onChange={e => setBatch(e.target.value)} className="form-input" style={{ minWidth: 100, flex: 1, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} />
          <button className="primary-btn" style={{ padding: '10px 18px', borderRadius: 8, fontWeight: 700, background: isDarkMode ? '#10b981' : '#22d3ee', color: '#fff' }} onClick={handleAddStudent}>Add Student</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 600, color: isDarkMode ? '#64748b' : '#334155' }}>Batch:</label>
          <select className="form-input" style={{ minWidth: 120, maxWidth: 180, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="All">All Batches</option>
            {batchOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <label style={{ fontWeight: 600, color: isDarkMode ? '#64748b' : '#334155', marginLeft: 12 }}>Sort by:</label>
          <select className="form-input" style={{ minWidth: 140, maxWidth: 180, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} value={sortMode} onChange={e => setSortMode(e.target.value)}>
            <option value="alpha-asc">Name (A-Z)</option>
            <option value="alpha-desc">Name (Z-A)</option>
            <option value="id-asc">ID (Ascending)</option>
            <option value="id-desc">ID (Descending)</option>
            <option value="date-desc">Date Added (Newest)</option>
            <option value="date-asc">Date Added (Oldest)</option>
          </select>
          <div style={{ flex: 1 }} />
          <input
            className="form-input"
            style={{ minWidth: 200, maxWidth: 320, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a', marginLeft: 'auto' }}
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: isDarkMode ? '0 2px 16px rgba(59,130,246,0.13)' : '0 2px 16px rgba(59,130,246,0.07)', background: 'var(--table-bg)', border: isDarkMode ? '1.5px solid #2a3950' : '1.5px solid #e0e7ef' }}>
          <table className="data-table" style={{ background: 'transparent' }}>
            <thead>
              <tr style={{ background: 'var(--table-header)' }}>
                <th style={{ color: 'var(--text-main)' }}>ID Number</th>
                <th style={{ color: 'var(--text-main)' }}>Name</th>
                <th style={{ color: 'var(--text-main)' }}>Batch</th>
                <th style={{ color: 'var(--text-main)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? filteredList.map(s => (
                <tr
                  key={s.id}
                  className="student-row"
                  onClick={() => setPopupStudent(s)}
                  style={{ background: 'var(--table-bg)', borderBottom: isDarkMode ? '1.5px solid #2a3950' : '1.5px solid #e0e7ef', cursor: 'pointer', transition: 'background 0.18s' }}
                >
                  <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{s.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
                  <td style={{ color: 'var(--text-main)' }}>{s.batch || '-'}</td>
                  <td>
                    <button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.95rem', borderRadius: '6px', color: '#ef4444', borderColor: '#ef4444', background: 'var(--table-bg)', fontWeight: 600 }} onClick={e => { e.stopPropagation(); handleRemove(s.id); }} title="Remove">🗑️ Remove</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-sub)', background: 'var(--table-bg)' }}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Student detail popup modal */}
        {popupStudent && (
          <div className="student-popup-modal" onClick={() => setPopupStudent(null)}>
            <div className="student-popup-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>Student Details</h3>
              <div style={{ margin: '18px 0 8px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}><b>Name:</b> {popupStudent.name}</div>
              <div style={{ margin: '8px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}><b>ID:</b> {popupStudent.id}</div>
              <div style={{ margin: '8px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}><b>Batch:</b> {popupStudent.batch || '-'}</div>
              <button className="primary-btn" style={{ marginTop: 18 }} onClick={() => setPopupStudent(null)}>Close</button>
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#23272b', color: '#ffd700', padding: '10px 14px', borderRadius: 10, border: '1px solid #2a3950', zIndex: 1000 }}>{toast}</div>
        )}
      </div>
    </>
  );
}

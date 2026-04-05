// Registrar main page for managing masterlist (add/remove students)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import './registrar.css';

  const [masterlist, setMasterlist] = useState([]);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [batch, setBatch] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [activeMenu, setActiveMenu] = useState('masterlist');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef(null);
  // Handle CSV upload (Program Chair logic)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const newStudents = [...masterlist];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols.length >= 3) {
          newStudents.push({
            name: cols[0].trim(),
            id: cols[1].trim(),
            batch: cols[2].trim(),
          });
        }
      }
      setMasterlist(newStudents);
      localStorage.setItem('obe_masterlist', JSON.stringify(newStudents));
      showToast('Masterlist uploaded successfully.');
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const saved = localStorage.getItem('obe_masterlist') || '[]';
    setMasterlist(JSON.parse(saved));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !id.trim() || !batch.trim()) {
      showToast('All fields required');
      return;
    }
    if (masterlist.some(s => s.id === id)) {
      showToast('Student ID already exists');
      return;
    }
    const updated = [...masterlist, { name, id, batch }];
    setMasterlist(updated);
    localStorage.setItem('obe_masterlist', JSON.stringify(updated));
    setName(''); setId(''); setBatch('');
    showToast('Student added');
  };

  const handleRemove = (sid) => {
    const updated = masterlist.filter(s => s.id !== sid);
    setMasterlist(updated);
    localStorage.setItem('obe_masterlist', JSON.stringify(updated));
    showToast('Student removed');
  };

  const filtered = masterlist.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search) ||
    s.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
          <div className="brand-text">
            <h3>CDM-OBE System</h3>
            <span style={{ color: '#ef4444', fontWeight: 'bold', letterSpacing: '1px' }}>REGISTRAR</span>
          </div>
        </div>
        <nav className="nav-menu">
          <button className={`nav-btn ${activeMenu === 'masterlist' ? 'active' : ''}`} onClick={() => setActiveMenu('masterlist')}>
            <span role="img" aria-label="Masterlist">👥</span> Masterlist
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-btn" style={{ opacity: 0.7, cursor: 'not-allowed' }}>Log Out</button>
        </div>
      </aside>
      <main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
        <div className="pc-header" style={{ marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Registrar Dashboard</h1>
            <p style={{ color: 'var(--text-sub)' }}>Manage the student masterlist. Add, remove, or upload students in bulk.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
              {new Date().getFullYear()} Masterlist
            </span>
          </div>
        </div>
        {toast && <div className="toast-notification">{toast}</div>}

        <div className="portal-card" style={{ animation: 'fadeIn 0.3s ease', marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-btn" style={{ fontSize: '0.95rem' }} onClick={() => setShowAddModal(true)}>
                ➕ Add Student
              </button>
              <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
              <button className="outline-btn" style={{ fontSize: '0.95rem' }} onClick={() => fileInputRef.current.click()}>
                📥 Upload Masterlist (CSV)
              </button>
            </div>
            <div style={{ maxWidth: 350, flex: 1 }}>
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, or batch..." style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Batch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.id}</td>
                    <td>{s.batch}</td>
                    <td>
                      <button className="outline-btn" style={{ color: '#ef4444', borderColor: 'transparent', padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px' }} onClick={() => handleRemove(s.id)} title="Remove">🗑️</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{textAlign:'center',color:'#888'}}>No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="portal-card" style={{ maxWidth: 400, width: '100%', padding: 32, position: 'relative', animation: 'fadeIn 0.2s' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} title="Close">✖</button>
              <form className="add-student-form" onSubmit={e => { handleAdd(e); setShowAddModal(false); }}>
                <div className="form-title">Add Student</div>
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
                </div>
                <div className="form-group">
                  <label>Student ID</label>
                  <input className="form-input" value={id} onChange={e => setId(e.target.value)} placeholder="e.g. 2024-0001" />
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <input className="form-input" value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. 2024" />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="primary-btn">Add Student</button>
                  <button type="button" className="outline-btn" onClick={() => setShowAddModal(false)} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );


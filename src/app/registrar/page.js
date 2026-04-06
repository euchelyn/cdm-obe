"use client";

import React, { useEffect, useState } from "react";
import "../alumni/alumni-globals.css";
import "./registrar.css";

export default function RegistrarPage() {
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
	const fileInputRef = React.useRef(null);

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

	const formatBirthday = (val) => {
		if (!val) return '';
		// If already DD/MM/YYYY
		if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
		// If YYYY-MM-DD
		if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
			const [y, m, d] = val.split('-');
			return `${d}/${m}/${y}`;
		}
		// If D/M/YYYY or similar
		const parts = val.split(/[\/-]/);
		if (parts.length === 3) {
			let [a, b, c] = parts;
			if (a.length === 4) return `${c.padStart(2, '0')}/${b.padStart(2, '0')}/${a}`;
			return `${a.padStart(2, '0')}/${b.padStart(2, '0')}/${c}`;
		}
		return val;
	};

	const handleAddStudent = () => {
		if (!name.trim() || !studentId.trim() || !birthday.trim() || !batch.trim() || !program.trim()) {
			showToast("Please provide all fields: Name, ID, Birthday, Batch, Program");
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
			program: program.trim()
		};
		setMasterlist((m) => [...m, newStudent]);
		// Create alumni account (simulate, store in localStorage for demo)
		const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
		alumniAccounts[studentId.trim()] = { usn: studentId.trim(), password: bday };
		localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));
		setName("");
		setStudentId("");
		setBatch("");
		setBirthday("");
		setProgram("");
		showToast("Student added and alumni account created");
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
			// Format: name, id, birthday(day/month/year), batch, program
			if (cols.length >= 5) {
				return {
					name: cols[0],
					id: cols[1],
					birthday: formatBirthday(cols[2]),
					batch: cols[3],
					program: cols[4]
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
		// Also create alumni accounts for each student
		const alumniAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
		rows.forEach(r => {
			if (r && r.id && r.birthday) {
				alumniAccounts[r.id] = { usn: r.id, password: r.birthday };
			}
		});
		localStorage.setItem('alumni_accounts', JSON.stringify(alumniAccounts));
		return rows.map(r => ({
			name: r.name,
			id: r.id,
			birthday: r.birthday || "",
			batch: r.batch,
			program: r.program || ""
		}));
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
				<input placeholder="Program" value={program} onChange={e => setProgram(e.target.value)} className="form-input" style={{ minWidth: 100, flex: 1, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} />
				<input placeholder="Birthday" value={birthday} onChange={e => setBirthday(e.target.value)} className="form-input" style={{ minWidth: 100, flex: 1, background: isDarkMode ? '#23272b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a' }} />
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
							<th style={{ color: 'var(--primary)' }}>ID Number</th>
							<th style={{ color: 'var(--primary)' }}>Name</th>
							<th style={{ color: 'var(--primary)' }}>Batch</th>
							<th style={{ color: 'var(--primary)' }}>Program</th>
							<th style={{ color: 'var(--primary)' }}>Birthday</th>
							<th style={{ color: 'var(--primary)' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredList.length > 0 ? filteredList.map(s => (
							<tr key={s.id} style={{ background: 'var(--table-bg)', borderBottom: isDarkMode ? '1.5px solid #2a3950' : '1.5px solid #e0e7ef' }}>
								<td style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{s.id}</td>
								<td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
								<td style={{ color: 'var(--text-sub)' }}>{s.batch || '-'}</td>
								<td style={{ color: 'var(--text-sub)' }}>{s.program || '-'}</td>
								<td style={{ color: 'var(--text-sub)' }}>{formatBirthday(s.birthday)}</td>
								<td>
									<button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.95rem', borderRadius: '6px', color: '#ef4444', borderColor: '#ef4444', background: 'var(--table-bg)', fontWeight: 600 }} onClick={() => handleRemove(s.id)} title="Remove">🗑️ Remove</button>
								</td>
							</tr>
						)) : (
							<tr>
								<td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-sub)', background: 'var(--table-bg)' }}>No students found.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{toast && (
				<div style={{ position: 'fixed', right: 20, bottom: 20, background: '#23272b', color: '#ffd700', padding: '10px 14px', borderRadius: 10, border: '1px solid #2a3950', zIndex: 1000 }}>{toast}</div>
			)}
			</div>
		</>
	);
}

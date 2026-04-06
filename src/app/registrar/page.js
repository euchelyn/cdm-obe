"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../alumni/alumni-globals.css";
import "./registrar.css";

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

	const handleLogout = () => {
		if (confirm("Are you sure you want to log out?")) {
			localStorage.removeItem("current_user");
			router.push("/");
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
		<div className="portal-layout">
			<aside className="sidebar">
				<div className="brand">
					<img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
					<div className="brand-text">
						<h3>CDM-OBE System</h3>
						<span style={{ color: '#3b82f6', fontWeight: 'bold', letterSpacing: '1px' }}>REGISTRAR</span>
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

			<main className="main-content" style={{ overflowY: 'auto', padding: '40px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
				{activeTab === 'masterlist' && (
					<div style={{ animation: 'fadeIn 0.3s ease' }}>
						<div className="pc-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<div>
								<h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>Registrar Dashboard</h1>
								<p style={{ color: 'var(--text-sub)' }}>Manage student masterlist and program enrollment.</p>
							</div>
							<div style={{ display: 'flex', gap: '10px' }}>
								<button className="primary-btn" onClick={() => fileInputRef.current.click()} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
									📥 Upload CSV
								</button>
								<input type="file" accept=".csv" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />
							</div>
						</div>

						<div className="portal-card" style={{ padding: '25px', marginBottom: '25px' }}>
							<h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>Add New Student</h3>
							<div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
								<div style={{ flex: 2, minWidth: '200px' }}>
									<label style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '5px', display: 'block' }}>Full Name</label>
									<input placeholder="e.g. Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} className="form-input" style={{ width: '100%' }} />
								</div>
								<div style={{ flex: 1, minWidth: '150px' }}>
									<label style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '5px', display: 'block' }}>ID Number</label>
									<input placeholder="e.g. 2021-0001" value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input" style={{ width: '100%' }} />
								</div>
								<div style={{ flex: 1, minWidth: '120px' }}>
									<label style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '5px', display: 'block' }}>Batch Year</label>
									<input placeholder="e.g. 2026" value={batch} onChange={e => setBatch(e.target.value)} className="form-input" style={{ width: '100%' }} />
								</div>
								<div style={{ flex: 1, minWidth: '150px' }}>
									<label style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '5px', display: 'block' }}>Program</label>
									<input placeholder="e.g. B.S. CpE" value={program} onChange={e => setProgram(e.target.value)} className="form-input" style={{ width: '100%' }} />
								</div>
								<div style={{ flex: 1, minWidth: '150px' }}>
									<label style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '5px', display: 'block' }}>Birthday</label>
									<input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="form-input" style={{ width: '100%', colorScheme: isDarkMode ? 'dark' : 'light' }} />
								</div>
								<div style={{ display: 'flex', alignItems: 'flex-end' }}>
									<button className="primary-btn" onClick={handleAddStudent} style={{ height: '42px', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold' }}>
										Add Student
									</button>
								</div>
							</div>
						</div>

						<div className="portal-card" style={{ padding: '25px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
								<h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>Masterlist Directory</h3>
								<div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<label style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>Filter Batch:</label>
										<select className="form-input" style={{ width: 'auto', minWidth: '120px' }} value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
											<option value="All">All Batches</option>
											{batchOptions.map(b => (
												<option key={b} value={b}>{b}</option>
											))}
										</select>
									</div>
									<input
										className="form-input"
										style={{ minWidth: '250px' }}
										placeholder="🔍 Search by name or ID..."
										value={search}
										onChange={e => setSearch(e.target.value)}
									/>
								</div>
							</div>

							<div style={{ overflowX: 'auto' }}>
								<table className="data-table">
									<thead>
										<tr>
											<th>ID Number</th>
											<th>Name</th>
											<th>Batch</th>
											<th>Program</th>
											<th>Birthday</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredList.length > 0 ? filteredList.map(s => (
											<tr key={s.id}>
												<td style={{ color: 'var(--text-sub)' }}>{s.id}</td>
												<td style={{ fontWeight: '600' }}>{s.name}</td>
												<td>{s.batch || '-'}</td>
												<td>{s.program || '-'}</td>
												<td>{formatBirthday(s.birthday)}</td>
												<td>
													<button className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px', color: '#ef4444', borderColor: 'transparent' }} onClick={() => handleRemove(s.id)} title="Remove Student">
														🗑️ Remove
													</button>
												</td>
											</tr>
										)) : (
											<tr>
												<td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
													No students found matching your criteria.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{toast && (
					<div style={{
						position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px',
						borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px',
						zIndex: 1000, fontWeight: 'bold', animation: 'fadeIn 0.3s ease'
					}}>
						✅ {toast}
					</div>
				)}
			</main>
		</div>
	);
}

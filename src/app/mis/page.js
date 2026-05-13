'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../alumni/alumni-globals.css';
import './mis.css';

import { createPrivUser, createStudentAccountFlow } from '@/services/privUserService';
import { api_register } from '@/services/authService';
import { createAccountLink, deleteAccountLink } from '@/services/accountLinkService';
import { getAccountLinkStats } from '@/services/accountLinkService';
import { createProgram, deleteProgram, getPrograms } from '@/services/programService';
import { getAllPrivUsersResolved } from '@/services/privUserService';
import { api_deleteUser } from '@/services/authService';

export default function MISPage() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [programs, setPrograms] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [openModal, setOpenModal] = useState(null);

    const [programInput, setProgramInput] = useState({ code: '', name: '' });
    const [accountInput, setAccountInput] = useState({ name: '', id: '', role: 'faculty', programId: '', codename: '', password: '' });

    const [listAccount, setListAccount] = useState([])

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsRes, programsRes, privUsersRes] = await Promise.all([
                    getAccountLinkStats(),
                    getPrograms(),
                    getAllPrivUsersResolved(),
                ]);

                /* =========================
                STATS
                ========================= */
                const academic = statsRes.academic ?? {};

                const accountsData = [
                    { role: 'student', count: academic.students ?? 0 },
                    { role: 'faculty', count: academic.faculty ?? 0 },
                    { role: 'pc', count: academic.pc ?? academic.program_chair ?? 0 },
                    { role: 'registrar', count: statsRes.registrar ?? 0 },
                    { role: 'total_academic', count: statsRes.totalAcademic ?? 0 },
                    {
                        role: 'overall_total',
                        count: (statsRes.totalAcademic ?? 0) + (statsRes.registrar ?? 0),
                    },
                ];

                setAccounts(accountsData);

                /* =========================
                PROGRAMS
                ========================= */
                setPrograms(programsRes.data ?? []);

                /* =========================
                PRIV USERS → FLATTEN + ADD USERNAME
                ========================= */

                const listAccount = (privUsersRes.data ?? [])
                    .map((item) => {
                        const roleData = item.roleData;
                        const userAuth = item.userAuthData;
                        const link = item.link;

                        if (!roleData) return null;

                        const base = Array.isArray(roleData)
                            ? roleData[0]
                            : roleData;

                        return {
                            ...base,

                            user_account_id: link?.user_account_id,
                            role_account_id: link?.role_account_id,
                            link_id: link?._id,

                            username: userAuth?.username ?? null,
                        };
                    })
                    .filter(Boolean);

                setListAccount(listAccount);
                console.log(listAccount);

            } catch (err) {
                console.error(err?.message || err);
            }
        };

        loadDashboardData();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
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
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('current_user');
            router.push('/');
        }
    };

    const handleAddAccount = async () => {
        try {
            if (!accountInput.name || !accountInput.role) {
                showToast('Please fill in all required fields.');
                return;
            }

            if (
                (accountInput.role === 'pc' ||
                accountInput.role === 'faculty') &&
                !accountInput.programId
            ) {
                showToast('Please assign a program to this academic account.');
                return;
            }

            const selectedProgram = programs.find(
                p => p.id === accountInput.programId
            );

            let roleAccountId = null;
            let userAccountId = null;

            switch (accountInput.role) {

                /* =========================
                FACULTY
                ========================= */
                case 'faculty': {
                    const roleRes = await createPrivUser('faculty', {
                        faculty_id: accountInput.id || null,
                        name: accountInput.name,
                        email: accountInput.codename || null,
                        contact_number: null,
                        department: selectedProgram?.department || null,
                        program: selectedProgram?.code || null,
                    });

                    console.log("roleResid: " + roleRes.id);

                    roleAccountId = roleRes?.id;

                    const authRes = await api_register(
                        accountInput.codename,
                        accountInput.password,
                        accountInput.role
                    );
                    
                    console.log("authid: " + authRes.id);
                    userAccountId = authRes?.id;

                    break;
                }

                /* =========================
                PROGRAM CHAIR
                ========================= */
                case 'pc': {
                    const roleRes = await createPrivUser('program_chair', {
                        program_chair_id: accountInput.id || null,
                        name: accountInput.name,
                        email: accountInput.codename || null,
                        contact_number: null,
                        department: selectedProgram?.department || null,
                        program: selectedProgram?.code || null,
                    });

                    roleAccountId = roleRes?.id;

                    const authRes = await api_register(
                        accountInput.codename,
                        accountInput.password,
                        accountInput.role
                    );

                    userAccountId = authRes?.id;

                    break;
                }

                /* =========================
                REGISTRAR
                ========================= */
                case 'registrar': {
                    const roleRes = await createPrivUser('registrar', {
                        registrar_id: accountInput.id || null,
                        name: accountInput.name,
                        email: accountInput.codename || null,
                        contact_number: null,
                    });

                    roleAccountId = roleRes?.id;

                    const authRes = await api_register(
                        accountInput.codename,
                        accountInput.password,
                        accountInput.role
                    );

                    userAccountId = authRes?.id;

                    break;
                }

                /* =========================
                MIS
                ========================= */
                case 'mis': {
                    const roleRes = await createPrivUser('mis', {
                        mis_id: accountInput.id || null,
                        name: accountInput.name,
                        email: accountInput.codename || null,
                        contact_number: null,
                    });

                    roleAccountId = roleRes?.id;

                    const authRes = await api_register(
                        accountInput.codename,
                        accountInput.password,
                        accountInput.role
                    );

                    userAccountId = authRes?.id;

                    break;
                }

                /* =========================
                STUDENT (UNCHANGED FLOW)
                ========================= */
                case 'student': {
                    await createStudentAccountFlow(
                        accountInput.id,
                        accountInput.codename,
                        accountInput.password,
                        accountInput.role
                    );
                    break;
                }

                default:
                    showToast('Invalid role selected.');
                    return;
            }

            /* =========================
            LINK ACCOUNTS (ALL NON-STUDENTS)
            ========================= */
            if (accountInput.role !== 'student') {
                if (!roleAccountId || !userAccountId) {
                    throw new Error('Failed to capture account IDs for linking.');
                }

                await createAccountLink({
                    user_account_id: userAccountId,
                    role: accountInput.role,
                    role_account_id: roleAccountId,
                });
            }

            setAccountInput({
                name: '',
                id: '',
                role: 'faculty',
                programId: '',
                codename: '',
                password: '',
            });

            setOpenModal(null);
            showToast('Account created successfully!');
        } catch (error) {
            console.log(error.message);
            showToast(error.message || 'Failed to create account.');
        }
    };

    /*
    const handleAddProgram = () => {
        if (!programInput.code || !programInput.name) {
            showToast('Please fill in all program fields.');
            return;
        }
        const newProgram = {
            id: 'prog_' + Date.now(),
            code: programInput.code.toUpperCase(),
            name: programInput.name
        };
        const updatedPrograms = [...programs, newProgram];
        setPrograms(updatedPrograms);
        localStorage.setItem('obe_programs', JSON.stringify(updatedPrograms));
        setProgramInput({ code: '', name: '' });
        setOpenModal(null);
        showToast('Program added successfully!');
    };
    */

    const handleAddProgram = async () => {
        try {
            if (!programInput.code || !programInput.name) {
                showToast('Please fill in all program fields.');
                return;
            }

            const res = await createProgram({
                code: programInput.code.toUpperCase(),
                program: programInput.name,
            });

            // optional: refresh programs from DB (best practice)
            const updated = await getPrograms();
            setPrograms(updated.data);

            setProgramInput({ code: '', name: '' });
            setOpenModal(null);

            showToast('Program added successfully!');
        } catch (error) {
            showToast(error.message || 'Failed to create program.');
        }
    };

    /*
    const handleDeleteProgram = (id) => {
        if (!window.confirm('Delete this program? This may affect linked accounts.')) return;
        const updated = programs.filter(p => p.id !== id);
        setPrograms(updated);
        localStorage.setItem('obe_programs', JSON.stringify(updated));
        showToast('Program deleted.');
    };
    */

    const handleDeleteProgram = async (id) => {
        try {
            if (!window.confirm('Delete this program? This may affect linked accounts.')) return;

            await deleteProgram(id);

            // refresh from database (keeps UI consistent with backend)
            const updated = await getPrograms();
            setPrograms(updated.data);

            showToast('Program deleted successfully.');
        } catch (error) {
            showToast(error.message || 'Failed to delete program.');
        }
    };

    const generateCodename = () => {
        if (!accountInput.name) {
            showToast('Please enter a name first.');
            return;
        }
        const cleanName = accountInput.name.split(' ').pop().toLowerCase();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const generated = `${accountInput.role === 'pc' ? 'pc_' : 'fac_'}${cleanName}${randomNum}`;
        setAccountInput(prev => ({ ...prev, codename: generated, password: 'password123' }));
    };

    /*
    const handleAddAccount = () => {
        if (!accountInput.name || !accountInput.role || !accountInput.codename || !accountInput.password) {
            showToast('Please fill in all required fields.');
            return;
        }
        if ((accountInput.role === 'pc' || accountInput.role === 'faculty') && !accountInput.programId) {
            showToast('Please assign a program to this academic account.');
            return;
        }

        const newAccount = {
            id: 'acc_' + Date.now(),
            ...accountInput
        };

        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        localStorage.setItem('obe_accounts', JSON.stringify(updatedAccounts));
        setAccountInput({ name: '', role: 'faculty', programId: '', codename: '', password: '' });
        setOpenModal(null);
        showToast('Account Created successfully!');
    };
    */



    const handleDeleteAccount = async (account) => {
        if (!window.confirm('Delete this account?')) return;

        try {
            // 1. delete auth user
            await api_deleteUser({
                user_account_id: account.user_account_id,
            });

            // 2. delete account link
            await deleteAccountLink(account.user_account_id);

            // 3. remove from UI
            setListAccount((prev) =>
                prev.filter((a) => a._id !== account._id)
            );

            showToast('Account revoked successfully.');

        } catch (err) {
            console.error(err);
            showToast(err.message || 'Failed to revoke account.');
        }
    };

    return (
        <div className="portal-layout mis-page">
            <aside className="sidebar">
                <div className="brand">
                    <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-side" />
                    <div className="brand-text">
                        <h3>CDM-OBE System</h3>
                        <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>SYSTEM ADMIN</span>
                    </div>
                </div>
                <nav className="nav-menu">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
                    <button className={`nav-btn ${activeTab === 'programs' ? 'active' : ''}`} onClick={() => setActiveTab('programs')}>🏢 Manage Programs</button>
                    <button className={`nav-btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>👥 Create Faculty Accounts</button>
                </nav>
                <div className="sidebar-bottom">
                    <button className="nav-btn theme-switch" onClick={toggleTheme}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</button>
                    <button className="nav-btn logout" onClick={handleLogout}>Log Out</button>
                </div>
            </aside>

            <main className="main-content">
                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="pc-header" style={{ marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>System Administrator Dashboard</h1>
                            <p style={{ color: 'var(--text-sub)' }}>Manage global programs and system access controls.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div className="portal-card stat-widget-new" style={{ borderTopColor: '#3b82f6' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>ACTIVE PROGRAMS</span>
                                <div className="stat-number">{programs.length}</div>
                            </div>
                            <div className="portal-card stat-widget-new" style={{ borderTopColor: '#10b981' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>SYSTEM ACCOUNTS</span>
                                <div className="stat-number">
                                    {accounts.find(a => a.role === 'overall_total')?.count ?? 0}
                                </div>
                            </div>
                            <div className="portal-card stat-widget-new" style={{ borderTopColor: '#f59e0b' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>REGISTRAR PORTALS</span>
                                <div className="stat-number">
                                    {accounts.find(a => a.role === 'registrar')?.count ?? 0}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div className="portal-card" style={{ padding: '25px' }}>
                                <h2 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Infrastructure Actions</h2>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button className="quick-action-minimal" onClick={() => setOpenModal('addprogram')}>
                                        <span style={{ fontSize: '1.2rem' }}>🏢</span>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>New Program</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Expand academic offerings</div>
                                        </div>
                                    </button>
                                    <button className="quick-action-minimal" onClick={() => setOpenModal('addaccount')}>
                                        <span style={{ fontSize: '1.2rem' }}>🔑</span>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Create Account</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Create user credentials</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'programs' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div
                            className="pc-header"
                            style={{
                                marginBottom: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end'
                            }}
                        >
                            <div>
                                <h1 style={{ fontSize: '2.2rem' }}>Manage Programs</h1>
                                <p style={{ color: 'var(--text-sub)' }}>
                                    Configure the global academic programs for the institution.
                                </p>
                            </div>

                            <button
                                onClick={() => setOpenModal('addprogram')}
                                className="primary-btn"
                                style={{ padding: '10px 20px', borderRadius: '8px' }}
                            >
                                ➕ Add Program
                            </button>
                        </div>

                        <div className="portal-card" style={{ padding: '20px' }}>
                            <table className="data-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Code</th>
                                        <th style={{ width: '65%' }}>Program Name</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {programs.length > 0 ? (
                                        programs.map((p) => (
                                            <tr key={p._id}>
                                                <td style={{ fontWeight: 'bold', color: 'var(--gold)' }}>
                                                    {p.code}
                                                </td>

                                                <td style={{ color: 'var(--text-main)' }}>
                                                    {p.program}
                                                </td>

                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDeleteProgram(p._id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '30px',
                                                    color: 'var(--text-sub)'
                                                }}
                                            >
                                                No programs configured.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'accounts' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div
                            className="pc-header"
                            style={{
                                marginBottom: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end'
                            }}
                        >
                            <div>
                                <h1 style={{ fontSize: '2.2rem' }}>
                                    Create Accounts
                                </h1>

                                <p style={{ color: 'var(--text-sub)' }}>
                                    Manage system access for Faculty, Chairs, and Registrars.
                                </p>
                            </div>

                            <button
                                onClick={() => setOpenModal('addaccount')}
                                className="primary-btn"
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px'
                                }}
                            >
                                ➕ Create Account
                            </button>
                        </div>

                        <div className="portal-card" style={{ padding: '20px' }}>
    <table className="data-table" style={{ width: '100%' }}>
        <thead>
            <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Codename / Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
        </thead>

        <tbody>
            {listAccount.length > 0 ? (
                listAccount.map((a) => {
                    return (
                        <tr key={a._id}>
                            {/* NAME */}
                            <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
                                {a.name}
                            </td>

                            {/* ROLE */}
                            <td>
                                <span
                                    style={{
                                        padding: '4px 10px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        color:
                                            a.role === 'pc'
                                                ? 'var(--gold)'
                                                : a.role === 'registrar'
                                                ? '#10b981'
                                                : 'var(--text-main)',
                                    }}
                                >
                                    {a.role === 'pc'
                                        ? 'Program Chair'
                                        : a.role}
                                </span>
                            </td>

                            {/* PROGRAM / DEPARTMENT */}
                            <td style={{ color: 'var(--text-sub)' }}>
                                {a.program || a.department || 'Global'}
                            </td>

                            {/* LOGIN (FROM AUTH) */}
                            <td style={{ fontFamily: 'monospace', color: '#3b82f6' }}>
                                {a.username ?? 'N/A'}
                            </td>

                            {/* ACTIONS */}
                            <td style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() =>
                                        handleDeleteAccount(a)
                                    }
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td
                        colSpan="5"
                        style={{
                            textAlign: 'center',
                            padding: '30px',
                            color: 'var(--text-sub)',
                        }}
                    >
                        No accounts created.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>
                    </div>
                )}

                {openModal === 'addprogram' && (
                    <div className="modal-overlay" onClick={() => setOpenModal(null)}>
                        <div className="modal-box portal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--gold)' }}>Add Academic Program</h2>
                                <button className="outline-btn" style={{ border: 'none', padding: '5px' }} onClick={() => setOpenModal(null)}>✕</button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>PROGRAM CODE</label>
                                    <input type="text" placeholder="e.g., CPE" value={programInput.code} onChange={e => setProgramInput({...programInput, code: e.target.value})} className="correction-textbox" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>FULL PROGRAM NAME</label>
                                    <input type="text" placeholder="e.g., B.S. Computer Engineering" value={programInput.name} onChange={e => setProgramInput({...programInput, name: e.target.value})} className="correction-textbox" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setOpenModal(null)} className="outline-btn" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                                <button onClick={handleAddProgram} className="primary-btn" style={{ padding: '10px 20px', borderRadius: '8px' }}>Save Program</button>
                            </div>
                        </div>
                    </div>
                )}

                {openModal === 'addaccount' && (
                    <div className="modal-overlay" onClick={() => setOpenModal(null)}>
                        <div className="modal-box portal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--gold)' }}>Create New Account</h2>
                                <button className="outline-btn" style={{ border: 'none', padding: '5px' }} onClick={() => setOpenModal(null)}>✕</button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>FULL NAME</label>
                                    <input type="text" placeholder="e.g., Juan Dela Cruz" value={accountInput.name} onChange={e => setAccountInput({...accountInput, name: e.target.value})} className="correction-textbox" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>ID</label>
                                    <input type="text" placeholder="e.g., 20220123456" value={accountInput.id} onChange={e => setAccountInput({...accountInput, id: e.target.value})} className="correction-textbox" />
                                </div>                        
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>SYSTEM ROLE</label>
                                        <select value={accountInput.role} onChange={e => setAccountInput({...accountInput, role: e.target.value})} className="correction-textbox">
                                            <option value="faculty">Faculty Member</option>
                                            <option value="pc">Program Chair</option>
                                            <option value="registrar">Registrar</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>DEPARTMENT / PROGRAM</label>
                                        <select value={accountInput.programId} onChange={e => setAccountInput({...accountInput, programId: e.target.value})} className="correction-textbox" disabled={accountInput.role === 'registrar'} style={{ opacity: accountInput.role === 'registrar' ? 0.5 : 1 }}>
                                            <option value="">Select Program...</option>
                                                <option value="CPE">CPE</option>
                                                <option value="EE">EE</option>
                                                <option value="ME">ME</option>
                                                <option value="CE">CE</option>
                                                <option value="ECE">ECE</option>
                                                <option value="ENSE">ENSE</option>
                                                <option value="ARCHI">ARCHI</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold' }}>CREDENTIALS</label>
                                        <button onClick={generateCodename} className="outline-btn" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}>Auto-Generate</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="text" placeholder="Codename / Username" value={accountInput.codename} onChange={e => setAccountInput({...accountInput, codename: e.target.value})} className="correction-textbox" style={{ flex: 1, fontFamily: 'monospace' }} />
                                        <input type="text" placeholder="Password" value={accountInput.password} onChange={e => setAccountInput({...accountInput, password: e.target.value})} className="correction-textbox" style={{ flex: 1, fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setOpenModal(null)} className="outline-btn" style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                                <button onClick={handleAddAccount} className="primary-btn" style={{ padding: '10px 20px', borderRadius: '8px' }}>Create Account</button>
                            </div>
                        </div>
                    </div>
                )}

                {toastMessage && <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold' }}> {toastMessage}</div>}
            </main>
        </div>
    );
}
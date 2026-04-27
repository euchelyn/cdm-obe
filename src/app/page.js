'use client'; 

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const existingDB = localStorage.getItem('obe_masterlist');
    if (!existingDB) {
      localStorage.setItem('obe_masterlist', JSON.stringify([]));
    }
  }, []);

  const handleLogin = () => {
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg("Please enter both ID/Codename and Password.");
      return;
    }

    // 1. MASTER ADMIN CHECK (Fail-safe)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('current_user', JSON.stringify({ role: 'mis', id: 'admin', name: 'System Admin' }));
      router.push('/mis');
      return;
    }

    // 2. STUDENT CHECK (Regex Pattern)
    // Matches 2018 to current year + program code + student code
    const studentRegex = /^(201[8-9]|20[2-9][0-9])\d{4}\d{1,4}$/;
    
    if (studentRegex.test(username.trim())) {
      const studentAccounts = JSON.parse(localStorage.getItem('alumni_accounts') || '{}');
      const studentRecord = studentAccounts[username.trim()];
      
      if (studentRecord && studentRecord.password === password) {
         // Add minimal user context for the alumni dashboard
         localStorage.setItem('current_user', JSON.stringify({ 
             role: 'student', 
             id: studentRecord.usn, 
             name: studentRecord.usn // Fallback if name isn't stored in accounts obj
         }));
         router.push('/alumni');
         return;
      } else {
         setErrorMsg("Invalid Student ID or password.");
         return;
      }
    }

    // 3. FACULTY / PC / REGISTRAR CHECK (Database Lookup)
    const staffAccounts = JSON.parse(localStorage.getItem('obe_accounts') || '[]');
    const staffUser = staffAccounts.find(acc => acc.codename === username.trim());

    if (staffUser && staffUser.password === password) {
      localStorage.setItem('current_user', JSON.stringify(staffUser));
      
      // Smart Routing based on provisioned role
      if (staffUser.role === 'faculty') {
        router.push('/faculty');
      } else if (staffUser.role === 'pc') {
        router.push('/pc');
      } else if (staffUser.role === 'registrar') {
        router.push('/registrar');
      } else if (staffUser.role === 'mis') {
        router.push('/mis');
      } else {
        setErrorMsg("Account role not recognized.");
      }
      return;
    }

    // 4. FALLBACK ERROR
    setErrorMsg("Invalid credentials or account not found.");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <div className="login-body">
      <button onClick={toggleTheme} className="floating-theme-btn">
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="login-wrapper">
        <div className="split-layout-container">
          
          <div className="info-section">
            <div className="brand-header">
              <img src="/cdm-logo.png" alt="CDM Logo" className="school-logo-large" />
            </div>
            <h1 className="welcome-title">Welcome to<br />CDM-OBE !</h1>
            <div className="accent-line"></div>
            <p className="system-description">
              The CDM-OBE is a Centralized Outcome-Based Education Management System designed to track student progress, map course outcomes, and gather vital evaluations from our Alumni and Industry Partners.
            </p>
            <button className="learn-more-btn">Learn More</button>
            <div className="powered-by-logo-container">
              <p className="pythons-credit">Powered by the CDM Pythons</p>
              <img src="/cpe-logo.png" alt="CpE Logo" className="cpe-logo-small" />
            </div>
          </div>

          <div className="login-section">
            <div className="login-card">
              <div className="card-header">
                <h2>Log In</h2>
                <p>Authorized personnel login only.</p>
                </div>

              {errorMsg && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center' }}>
                    {errorMsg}
                </div>
              )}

              <form className="login-form">
                <div className="form-group">
                  <label>Student ID / Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter your Student ID or Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button type="button" onClick={handleLogin} className="login-btn" style={{ marginTop: '20px' }}>Log In</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
'use client'; 

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); 
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

    if (!selectedRole) {
      setErrorMsg("Please choose what to log in as.");
      return;
    }

    if (selectedRole === 'Faculty') {
      if (username === 'mis' && password === '12345678') {
        localStorage.setItem('current_user', JSON.stringify({ role: 'mis', id: 'admin', name: 'IT (MIS)' }));
        router.push('/mis'); 
      } else if (username === 'registrar' && password === '12345678') {
        localStorage.setItem('current_user', JSON.stringify({ role: 'registrar', id: 'admin', name: 'Registrar' }));
        router.push('/registrar'); 
      } else if (username === 'faculty' && password === '12345678') {
        localStorage.setItem('current_user', JSON.stringify({ role: 'faculty', id: 'admin', name: 'Faculty' }));
        router.push('/faculty'); 
      } else if (username === 'programchair' && password === '12345678') {
        localStorage.setItem('current_user', JSON.stringify({ role: 'pc', id: 'admin', name: 'Program Chair' }));
        router.push('/pc'); 
      } else {
        setErrorMsg("Invalid credentials for Faculty.");
      }
    } else if (selectedRole === 'Student') {
      
      if (username === 'goodstudent' && password === '12345678') {
        const studentUser = { 
            id: '20241020067', 
            name: 'Euch', 
            role: 'student',
            batch: '2026',
            program: 'B.S. Computer Engineering',
            surveyProgress: '0%',
            tracerProgress: '0%',
            employerStatus: 'Pending'
        };

        const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');
        const exists = db.find(s => s.id === studentUser.id);
        
        if (!exists) {
            db.push(studentUser);
            localStorage.setItem('obe_masterlist', JSON.stringify(db));
        }

        localStorage.setItem('current_user', JSON.stringify(studentUser));
        router.push('/student');
        return;
      }

      const db = JSON.parse(localStorage.getItem('obe_masterlist') || '[]');
      const userExists = db.find(student => student.id.trim() === username.trim());

      if (userExists && password.trim() === userExists.birthday) {
        localStorage.setItem('current_user', JSON.stringify({ 
            role: 'student', 
            id: userExists.id, 
            name: userExists.name,
            batch: userExists.batch
        }));
        router.push('/student');
      } else {
        setErrorMsg("Invalid Student ID or password.");
      }
    }
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
                  <label>Email / Student ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter your ID or Email" 
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
                
                <div className="role-selection">
                    <p>Log in as:</p>
                    <div className="role-btns">
                      <button 
                          type="button" 
                          className={`role-btn ${selectedRole === 'Faculty' ? 'active' : ''}`}
                          onClick={() => setSelectedRole(selectedRole === 'Faculty' ? null : 'Faculty')}
                      >
                          Faculty
                      </button>
                      
                      <button 
                          type="button" 
                          className={`role-btn ${selectedRole === 'Student' ? 'active' : ''}`}
                          onClick={() => setSelectedRole(selectedRole === 'Student' ? null : 'Student')}
                      >
                          Student
                      </button>
                    </div>
                </div>

                <button type="button" onClick={handleLogin} className="login-btn">Log In</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
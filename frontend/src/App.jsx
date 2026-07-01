import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/auth';
const PROBLEMS_API = 'http://localhost:5000/api/problems';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [registerData, setRegisterData] = useState({
    handle: '', email: '', password: '', confirmPassword: ''
  });

  const [loginData, setLoginData] = useState({
    identifier: '', password: ''
  });

  const [message, setMessage] = useState('');

  // Add Problem Form State
  const [addProblemData, setAddProblemData] = useState({
    title: '', slug: '', description: '', difficulty: 'Easy',
    constraints: '', timeLimit: 2, memoryLimit: 256, tags: '',
    sampleInput: '', sampleOutput: '', hiddenInput1: '', hiddenOutput1: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
          setIsLoggedIn(true);
        } catch {
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setUser(null);
      setCurrentView('dashboard');
    } catch {
      console.error('Logout failed');
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await axios.get(PROBLEMS_API);
      setProblems(res.data.problems);
      setCurrentView('problems');
    } catch (err) {
      console.error(err);
    }
  };

  const openProblem = (problem) => {
    setSelectedProblem(problem);
    setCurrentView('problem-detail');
  };

  // ==================== REGISTER ====================
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('%c[Register Button Clicked]', 'color: blue', registerData);
    try {
      const res = await axios.post(`${API_URL}/register`, registerData);
      setMessage(res.data.message);
      console.log('%c[Register Success]', 'color: green', res.data);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      setMessage(errMsg);
      console.error('%c[Register Error]', 'color: red', errMsg);
    }
  };

  // ==================== LOGIN ====================
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('%c[Login Button Clicked]', 'color: green', loginData);
    try {
      const loginRes = await axios.post(`${API_URL}/login`, loginData, { withCredentials: true });
      const accessToken = loginRes.data.accessToken;
      localStorage.setItem('accessToken', accessToken);

      const meRes = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser(meRes.data.user);
      setIsLoggedIn(true);
      setMessage('Login successful');
      setCurrentView('dashboard');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      setMessage(errMsg);
      console.error('%c[Login or /me Error]', 'color: red', errMsg);
    }
  };

  // ==================== ADD PROBLEM ====================
  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const problemData = {
        title: addProblemData.title,
        slug: addProblemData.slug,
        description: addProblemData.description,
        difficulty: addProblemData.difficulty,
        constraints: addProblemData.constraints,
        timeLimit: Number(addProblemData.timeLimit),
        memoryLimit: Number(addProblemData.memoryLimit),
        tags: addProblemData.tags ? addProblemData.tags.split(',').map(t => t.trim()) : [],
        sampleInput: addProblemData.sampleInput,
        sampleOutput: addProblemData.sampleOutput,
        hiddenTestCases: [
          { input: addProblemData.hiddenInput1, expectedOutput: addProblemData.hiddenOutput1 }
        ]
      };

      const res = await axios.post(PROBLEMS_API, problemData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Problem created successfully!');
        setCurrentView('problems');
        fetchProblems();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create problem');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // ==================== DASHBOARD ====================
  if (isLoggedIn && user && currentView === 'dashboard') {
    return (
      <div className="auth-container">
        <h1>Welcome to Online Judge!</h1>
        <p>Welcome, <strong>{user.handle}</strong></p>

        {user.role === 'admin' && (
          <button onClick={() => setCurrentView('add-problem')} className="admin-btn">
            ➕ Add New Problem
          </button>
        )}

        <div className="cards-grid">
          <div className="card" onClick={() => alert('Codespace coming soon')}>
            <h2>🧪 Codespace</h2>
            <p>Write and run code with custom input</p>
          </div>

          <div className="card" onClick={fetchProblems}>
            <h2>📚 Problems</h2>
            <p>Browse and solve coding challenges</p>
          </div>

          <div className="card" onClick={() => alert('Profile coming soon')}>
            <h2>👤 Profile</h2>
            <p>View your progress and details</p>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    );
  }

  // ==================== ADD PROBLEM FORM ====================
  if (isLoggedIn && user && currentView === 'add-problem') {
    return (
      <div className="auth-container">
        <h1>Add New Problem</h1>
        <button onClick={() => setCurrentView('dashboard')}>← Back</button>

        <form onSubmit={handleAddProblem} className="add-problem-form">
          <input type="text" placeholder="Title" value={addProblemData.title} onChange={(e) => setAddProblemData({...addProblemData, title: e.target.value})} required />
          <input type="text" placeholder="Slug" value={addProblemData.slug} onChange={(e) => setAddProblemData({...addProblemData, slug: e.target.value})} required />
          <textarea placeholder="Description" value={addProblemData.description} onChange={(e) => setAddProblemData({...addProblemData, description: e.target.value})} required />
          <select value={addProblemData.difficulty} onChange={(e) => setAddProblemData({...addProblemData, difficulty: e.target.value})}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <textarea placeholder="Constraints" value={addProblemData.constraints} onChange={(e) => setAddProblemData({...addProblemData, constraints: e.target.value})} required />
          
          <h3>Sample Test Case</h3>
          <textarea placeholder="Sample Input" value={addProblemData.sampleInput} onChange={(e) => setAddProblemData({...addProblemData, sampleInput: e.target.value})} required />
          <textarea placeholder="Sample Output" value={addProblemData.sampleOutput} onChange={(e) => setAddProblemData({...addProblemData, sampleOutput: e.target.value})} required />

          <h3>Hidden Test Case</h3>
          <textarea placeholder="Hidden Input" value={addProblemData.hiddenInput1} onChange={(e) => setAddProblemData({...addProblemData, hiddenInput1: e.target.value})} />
          <textarea placeholder="Hidden Output" value={addProblemData.hiddenOutput1} onChange={(e) => setAddProblemData({...addProblemData, hiddenOutput1: e.target.value})} />

          <button type="submit">Create Problem</button>
        </form>
      </div>
    );
  }

  // ==================== PROBLEMS LIST ====================
  if (isLoggedIn && currentView === 'problems') {
    return (
      <div className="auth-container">
        <h1>Problems</h1>
        <button onClick={() => setCurrentView('dashboard')}>← Back</button>
        <table className="problems-table">
          <thead>
            <tr><th>ID</th><th>Title</th><th>Difficulty</th></tr>
          </thead>
          <tbody>
            {problems.map((p, index) => (
              <tr key={p._id} onClick={() => openProblem(p)} className="problem-row">
                <td>{index + 1}</td>
                <td>{p.title}</td>
                <td className={p.difficulty.toLowerCase()}>{p.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ==================== PROBLEM DETAIL (REDESIGNED) ====================
  if (isLoggedIn && currentView === 'problem-detail' && selectedProblem) {
    return (
      <div className="problem-detail-container">
        <div className="problem-header">
          <button onClick={() => setCurrentView('problems')}>← Back to Problems</button>
          <h1>{selectedProblem.title}</h1>
          <span className={`difficulty ${selectedProblem.difficulty.toLowerCase()}`}>
            {selectedProblem.difficulty}
          </span>
        </div>

        <div className="problem-split">
          {/* LEFT: Problem Info */}
          <div className="problem-info">
            <div className="section">
              <h3>Description</h3>
              <p>{selectedProblem.description}</p>
            </div>

            <div className="section">
              <h3>Examples</h3>
              <pre><strong>Input:</strong> {selectedProblem.sampleInput}</pre>
              <pre><strong>Output:</strong> {selectedProblem.sampleOutput}</pre>
            </div>

            <div className="section">
              <h3>Constraints</h3>
              <p>{selectedProblem.constraints}</p>
            </div>
          </div>

          {/* RIGHT: Code Editor Placeholder */}
          <div className="code-editor-section">
            <div className="editor-header">
              <select>
                <option>C++</option>
                <option>C</option>
                <option>Python</option>
                <option>Java</option>
              </select>
              <button onClick={() => alert('Run coming soon')}>Run</button>
              <button onClick={() => alert('Submit coming soon')}>Submit</button>
            </div>

            <div className="monaco-placeholder">
              <p>Monaco Editor will be added here</p>
              <textarea placeholder="Write your code here..." rows={18} />
            </div>

            <div className="test-result">
              <h4>Test Result</h4>
              <p>Output will appear here after Run/Submit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LOGIN / REGISTER ====================
  return (
    <div className="auth-container">
      <h1>Online Judge</h1>
      <p className="subtitle">Create your account to start solving problems</p>

      {message && <div className="message">{message}</div>}

      {/* REGISTER FORM */}
      <div className="form-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Handle" value={registerData.handle}
            onChange={(e) => setRegisterData({ ...registerData, handle: e.target.value })} required />
          <input type="email" placeholder="Email" value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
          <input type="password" placeholder="Password" value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
          <input type="password" placeholder="Confirm Password" value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
          <button type="submit">Create Account</button>
        </form>
      </div>

      {/* LOGIN SECTION */}
      <div className="login-section">
        <p>
          Already have an account?{' '}
          <span className="login-link" onClick={() => setShowLogin(!showLogin)}>
            Login here
          </span>
        </p>

        {showLogin && (
          <div className="form-box login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Handle or Email" value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required />
              <input type="password" placeholder="Password" value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
              <button type="submit">Login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
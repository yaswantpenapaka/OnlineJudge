import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [registerData, setRegisterData] = useState({
    handle: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  const [message, setMessage] = useState('');

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

  // ==================== LOGIN + CALL /me ====================
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('%c[Login Button Clicked]', 'color: green', loginData);

    try {
      // Step 1: Login
      const loginRes = await axios.post(`${API_URL}/login`, loginData, {
        withCredentials: true,
      });

      const accessToken = loginRes.data.accessToken;
      localStorage.setItem('accessToken', accessToken);

      // Step 2: Call /me to get user details (Protected Route)
      const meRes = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('%c[/me Success]', 'color: green', meRes.data);

      setUser(meRes.data.user);
      setIsLoggedIn(true);
      setMessage('Login successful');

    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      setMessage(errMsg);
      console.error('%c[Login or /me Error]', 'color: red', errMsg);
    }
  };

  // ==================== LOGOUT ====================
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setUser(null);
      setMessage('Logged out successfully');
      console.log('%c[Logout Success]', 'color: orange');
    } catch{
      console.error('Logout failed');
    }
  };

  // ==================== DASHBOARD ====================
  if (isLoggedIn && user) {
    return (
      <div className="auth-container">
        <h1>Welcome to Online Judge!</h1>
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p><strong>Handle:</strong> {user.handle}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    );
  }

  // ==================== AUTH FORMS ====================
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
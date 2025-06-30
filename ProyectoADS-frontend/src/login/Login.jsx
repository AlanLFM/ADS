import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import './Login.css';
import logo from '../assets/logos.png';
import { use } from 'react';
import { jwtDecode } from 'jwt-decode';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState('');

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Registro');
  };
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.tipo === 'admin') {
        navigate('/GestionUsuarios');
      } else if (decoded.tipo === 'usuario') {
        navigate('/Inicio');
      }
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaValue) {
      window.alert('Por favor, completa el reCAPTCHA');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, recaptchaToken: recaptchaValue })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) {
          sessionStorage.setItem('token', data.token);
        }
        if (data.tipo === 'admin') {
          navigate('/GestionUsuarios');
        } else if (data.tipo === 'usuario') {
          navigate('/Inicio');
        }
      } else {
        window.alert(data.message || 'Error en el login');
      }
    } catch (err) {
      window.alert('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="lotus-login-bg">
      <div className="lotus-login-wrapper">
        <div className="lotus-login-panel lotus-login-form">
          <div className="lotus-login-content">
            <div className="lotus-login-header">
              <img src={logo} alt="CrosStudy Logo" style={{ width: '150px', height: '150px' }} />
              <h3>Somos CrosStudy</h3>
              <p>Por favor, ingresa con tu cuenta</p>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <div className="lotus-password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              <ReCAPTCHA
                sitekey="6LcdUWgrAAAAAErGGbiFCjiM1Mk3y7MyYsSyVrKJ"
                onChange={value => setRecaptchaValue(value)}
              />
              <button type="submit" className="lotus-login-btn" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <div className="lotus-login-footer">
              <a href="#">Perdiste algo?</a>
              <div>
                <span>¿No tienes cuenta?</span>
                <button className="lotus-create-btn" onClick={handleClick} disabled={loading}>Crea una</button>
              </div>
            </div>
          </div>
        </div>
        <div className="lotus-login-panel lotus-login-info">
          <div className="lotus-info-background"></div>
          <div className="lotus-info-text">
            <h2>Unifica. Organiza. Domina.</h2>
            <p>Con CrossStudy, todas tus clases, una sola app. ¡Todo lo que necesitas, en un solo clic!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

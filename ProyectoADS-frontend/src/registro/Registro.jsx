import React, { useState } from 'react';
import './Registro.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logos.png';
const Registro = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        window.alert('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
        setUsername('');
        setEmail('');
        setPassword('');
        navigate('/');
      } else {
        window.alert(data.message || 'Error al registrar');
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
        <div className="lotus-login-form">
        <div className="lotus-info-background"></div>
          <div className="lotus-login-content">
            <h2>Crea una nueva cuenta</h2>
          </div>
        </div>
        <div className="lotus-login-panel">
          <div className="lotus-info-text">
            <div className="lotus-login-header">
              <img src={logo} alt="CrosStudy Logo" style={{ width: '150px', height: '150px' }} />
              <h3>Registro</h3>
              <p>Por favor, ingresa con tus datos</p>
                <div className="lotus-login-panel lotus-login-form">
                <div className="lotus-login-content">
                    
                <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <div className="lotus-password-input">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
                <button type="submit" className="lotus-login-btn" disabled={loading}>Registrar</button>
                </form>
                <div className="lotus-login-footer">
                <a href="#">Perdiste algo?</a>
                <div>
                    <span>¿Ya tienes una cuenta?</span>
                    <button className="lotus-create-btn" onClick={handleClick} disabled={loading}>Ingresa</button>
                </div>
                </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;

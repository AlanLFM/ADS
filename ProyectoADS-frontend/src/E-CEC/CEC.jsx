import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
Modal.setAppElement('#root'); // evita warnings de accesibilidad
import { jwtDecode } from 'jwt-decode';
const ECEC = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const [idUsuario, setIdUsuario] = useState('');

 useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
    const decoded = jwtDecode(token);
    setIdUsuario(decoded.id);
    }
    console.log(`ID de usuario: ${idUsuario}`);
    
  });

  const vincularMoodle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTareas([]);


    try {
      const res = await fetch('http://localhost:3001/api/moodle/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      
      if (!res.ok) throw new Error(data.message || 'Error al consultar Moodle');
      setTareas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    await fetch('http://localhost:3001/api/moodle/guardar-tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tareas: tareas,
            Id_Usuario: idUsuario
        })
        });

  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Vincular cuenta e-cec">
      <h2>Vincular cuenta e-cec</h2>
      <form onSubmit={vincularMoodle}>
        <label>Usuario Moodle:</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Vincular'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button onClick={onClose} style={{ marginTop: 20 }}>Cerrar</button>
    </Modal>
  );
};

export default ECEC;

import React, { useEffect, useState } from 'react';
import '../login/Login.css';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res, data;
      if (editId) {
        res = await fetch(`http://localhost:3001/usuarios/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch('http://localhost:3001/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      data = await res.json();
      if (res.ok) {
        setForm({ username: '', email: '', password: '' });
        setEditId(null);
        fetchUsuarios();
      } else {
        setError(data.message || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setForm({ username: usuario.Username, email: usuario.Email, password: usuario.Password });
    setEditId(usuario.Id_Usuario);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsuarios();
      } else {
        setError('No se pudo eliminar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lotus-login-bg">
      <div className="lotus-login-wrapper">
        <div className="lotus-login-panel lotus-login-form">
          <div className="lotus-login-content">
            <h3>Gestión de Usuarios</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="lotus-login-btn" disabled={loading}>
                {editId ? 'Actualizar' : 'Crear'} usuario
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ username: '', email: '', password: '' }); }} disabled={loading}>
                  Cancelar edición
                </button>
              )}
            </form>
          </div>
        </div>
        <div className="lotus-login-panel lotus-login-info">
          <div className="lotus-info-text">
            <h4>Usuarios registrados</h4>
            <ul>
              {usuarios.length === 0 && <li>No hay usuarios registrados.</li>}
              {usuarios.map((u) => (
                <li key={u.Id_Usuario}>
                  <b>{u.Username}</b> ({u.Email})
                  <button onClick={() => handleEdit(u)} disabled={loading}>Editar</button>
                  <button onClick={() => handleDelete(u.Id_Usuario)} disabled={loading}>Eliminar</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;

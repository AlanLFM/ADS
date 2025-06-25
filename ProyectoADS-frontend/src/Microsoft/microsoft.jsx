import React from 'react';
import { jwtDecode } from 'jwt-decode';

const VincularMicrosoft = () => {
  const handleVincular = () => {
    // Suponemos que el token JWT está en localStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Debe iniciar sesión primero');
      return;
    }

    // Extrae el ID del usuario desde el token
    const decoded = jwtDecode(token);
    const idUsuario = decoded.id;

    // Redirige al backend para iniciar el flujo OAuth
    window.location.href = `http://localhost:3001/api/vincularMicrosoft?idUsuario=${idUsuario}`;
  };

  return (
      <button onClick={handleVincular}>
        Vincular con Microsoft
      </button>
  );
};

export default VincularMicrosoft;

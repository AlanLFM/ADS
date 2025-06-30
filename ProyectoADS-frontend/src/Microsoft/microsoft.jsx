import React from 'react';
import { jwtDecode } from 'jwt-decode';
import {Button} from '@mui/material';
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
    <>
    <Button 
        variant="contained" 
        onClick={handleVincular}
        sx={{
            backgroundColor: '#764ba2',
            '&:hover': { backgroundColor: '#5a3978' }
        }}
        >Vincular </Button>
    </>
  );
};

export default VincularMicrosoft;

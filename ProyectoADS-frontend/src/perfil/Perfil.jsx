import React from 'react';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography, MDBIcon } from 'mdb-react-ui-kit';
import classroom from '../assets/Google_Classroom_Logo.png';
import teams from '../assets/Microsoft_office_Teams.png';
import './Perfil.css';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import Google from '../googleB/google.jsx';
import perfil from '../assets/perfil.png';
import VincularMicrosoft from '../Microsoft/microsoft.jsx';

export default function PersonalProfile() {

    const [usuario, setUsuario] = useState("")
    const [email, setEmail]= useState("")
    const [idUsuario, setIdUsuario] = useState("");
    const [googleVinculado, setGoogleVinculado] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [correoGoogle, setCorreoGoogle] = useState("");

    useEffect(() => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token);
    setUsuario(decoded.user);
    setEmail(decoded.email);
    setIdUsuario(decoded.id);

    fetch('http://localhost:3001/api/usuario/perfil', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ Id_Usuario: decoded.id })
    })
      .then(res => res.json())
      .then(data => {
        const fechaExpiracion = new Date(data.Google_Token_Expiracion);
        const ahora = new Date();

        if (data.Google_UID && fechaExpiracion > ahora) {
          setGoogleVinculado(true);
        } else {
          setGoogleVinculado(false); // token expirado
        }

        if (data.Google_email) setCorreoGoogle(data.Google_email);
        if (data.URL_Foto) setFotoPerfil(data.URL_Foto);
      })
      .catch(err => console.error("Error al obtener perfil:", err));
  }
}, []);

  console.log(fotoPerfil);
  
  return (
    <div className="contenedor-grandote">
        <div className="card">
            <img src={fotoPerfil} />
            <div>
                <h2>{usuario}</h2>
                <h3>Correo en CrosStudy: {email}</h3>
                <h3>Correo Google: {correoGoogle}</h3>
                
                <p>Bienvenido a tu perfil, aquí podrás gestionar tus datos y acceder a las plataformas de aprendizaje.</p>
                <h3>Usuario:</h3>
                <div className='botones-contenedor'>
                     {googleVinculado ? (
                                <button className="btn-vinculado" disabled>
                                Google vinculado
                                </button>
                            ) : (
                                <Google />
                            )}
                            <VincularMicrosoft />
                </div>
            </div>
        </div>
    </div>
  );
}
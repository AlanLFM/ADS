import React, { useState } from 'react';
import {
  MDBCard, MDBCardBody, MDBCardTitle, MDBCardText,
  MDBBadge, MDBIcon
} from 'mdb-react-ui-kit';
import ardillaIA from '../assets/IconoA.png';
import AsistenteIA from '../IA/ia.jsx';

const TareaCard = ({ tarea }) => {
  const [modalIAOpen, setModalIAOpen] = useState(false);

  const obtenerColorEstado = (estado) => estado === 'pendiente' ? 'warning' : 'success';
  const obtenerTextoEstado = (estado) => estado === 'pendiente' ? 'Pendiente' : 'Entregada';

  const abrirAsistenteIA = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Abriendo modal para tarea:', tarea.titulo);
    setModalIAOpen(true);
  };

  const cerrarAsistenteIA = () => {
    console.log('Cerrando modal para tarea:', tarea.titulo);
    setModalIAOpen(false);
  };

  // Verificar si la tarea existe
  if (!tarea) {
    console.error('TareaCard: No se recibió la prop "tarea"');
    return <p>Error: No hay datos de tarea</p>;
  }

  // ID único para este modal específico
  const modalId = `modal-ia-${tarea.idEntrega || tarea.id || Math.random()}`;

  return (
    <>
  <MDBCard className="tarea-card mb-3" style={{ position: 'relative' }}>
    <MDBCardBody>
      {/* Botón de la ardilla */}
      <button
        onClick={abrirAsistenteIA}
        aria-label="Consultar IA"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <img
          src={ardillaIA}
          alt="Icono IA"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            pointerEvents: 'auto'
          }}
          onError={(e) => {
            console.warn('No se pudo cargar la imagen de la ardilla');
            e.target.src = '';
            e.target.alt = 'IA';
            e.target.parentElement.innerHTML = 'IA';
            e.target.parentElement.style.color = '#fff';
            e.target.parentElement.style.background = '#6c757d';
            e.target.parentElement.style.borderRadius = '50%';
            e.target.parentElement.style.padding = '5px 10px';
            e.target.parentElement.style.fontSize = '14px';
          }}
        />
      </button>

      {/* Contenido de la tarjeta */}
      <div className="d-flex justify-content-between align-items-start mb-2" style={{ marginRight: '50px' }}>
        <MDBCardTitle className="tarea-titulo">
          <MDBIcon fas icon="book" className="me-2 text-primary" />
          {tarea.titulo}
        </MDBCardTitle>
        <MDBBadge
          color={obtenerColorEstado(tarea.estado)}
          pill
          className="estado-badge"
        >
          {obtenerTextoEstado(tarea.estado)}
        </MDBBadge>
      </div>

      <MDBCardText className="curso-info mb-2">
        <MDBIcon fas icon="graduation-cap" className="me-2 text-secondary" />
        <strong>Curso:</strong> {tarea.cursoNombre}
      </MDBCardText>

      <div className="fecha-info mb-3">
        <MDBIcon fas icon="calendar" className="me-2 text-secondary" />
        <strong>Fecha de entrega:</strong> {tarea.fechaEntrega}
      </div>

      {tarea.descripcion && tarea.descripcion !== 'Sin descripción' && (
        <MDBCardText className="descripcion-tarea mb-3">
          <MDBIcon fas icon="align-left" className="me-2 text-secondary" />
          <strong>Descripción:</strong>
          <div className="mt-1 ps-3">
            {tarea.descripcion.length > 150
              ? `${tarea.descripcion.substring(0, 150)}...`
              : tarea.descripcion}
          </div>
        </MDBCardText>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          <MDBIcon fas icon="id-badge" className="me-1" />
          ID: {tarea.idEntrega}
        </small>
        <small className="text-primary">
          <MDBIcon fas icon="robot" className="me-1" />
        </small>
      </div>
    </MDBCardBody>
  </MDBCard>

  {/* Asistente IA */}
  <AsistenteIA
    isOpen={modalIAOpen}
    onClose={cerrarAsistenteIA}
    tarea={tarea}
    modalId={modalId}
  />
</>

  );
};

export default TareaCard;
import React from 'react';
import { 
  MDBCard, 
  MDBCardBody, 
  MDBCardTitle, 
  MDBCardText, 
  MDBBadge,
  MDBIcon,
  MDBBtn
} from 'mdb-react-ui-kit';
import './TareaCard.css';

const TareaCard = ({ tarea }) => {
  // Función para obtener el color del badge según el estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'NEW':
        return 'primary';
      case 'CREATED':
        return 'info';
      case 'TURNED_IN':
        return 'success';
      case 'RETURNED':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Función para obtener el texto del estado en español
  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'NEW':
        return 'Nueva';
      case 'CREATED':
        return 'Pendiente';
      case 'TURNED_IN':
        return 'Entregada';
      case 'RETURNED':
        return 'Devuelta';
      default:
        return estado;
    }
  };

  // Función para calcular días restantes
  const calcularDiasRestantes = (fechaEntrega) => {
    if (fechaEntrega === 'Sin fecha') return null;
    
    const [dia, mes, año] = fechaEntrega.split('/');
    const fechaLimite = new Date(año, mes - 1, dia, 23, 59);
    const ahora = new Date();
    const diferencia = fechaLimite - ahora;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    return dias;
  };

  const diasRestantes = calcularDiasRestantes(tarea.fechaEntrega);

  // Función para obtener el color de la fecha según urgencia
  const obtenerColorFecha = (dias) => {
    if (dias === null) return 'secondary';
    if (dias < 0) return 'danger';
    if (dias === 0) return 'warning';
    if (dias <= 3) return 'warning';
    if (dias <= 7) return 'info';
    return 'success';
  };

  const obtenerTextoFecha = (dias) => {
    if (dias === null) return 'Sin fecha límite';
    if (dias < 0) return `Vencida hace ${Math.abs(dias)} día(s)`;
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    return `${dias} días restantes`;
  };

  return (
    <MDBCard className="tarea-card mb-3" style={{ transition: 'all 0.3s ease' }}>
      <MDBCardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
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
          {diasRestantes !== null && (
            <MDBBadge 
              color={obtenerColorFecha(diasRestantes)} 
              className="ms-2"
            >
              {obtenerTextoFecha(diasRestantes)}
            </MDBBadge>
          )}
        </div>

        {tarea.descripcion && tarea.descripcion !== 'Sin descripción' && (
          <MDBCardText className="descripcion-tarea mb-3">
            <MDBIcon fas icon="align-left" className="me-2 text-secondary" />
            <strong>Descripción:</strong>
            <div className="mt-1 ps-3">
              {tarea.descripcion.length > 150 
                ? `${tarea.descripcion.substring(0, 150)}...` 
                : tarea.descripcion
              }
            </div>
          </MDBCardText>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <MDBIcon fas icon="id-badge" className="me-1" />
            ID: {tarea.idEntrega}
          </small>
          
          <div>
          </div>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
};

export default TareaCard;
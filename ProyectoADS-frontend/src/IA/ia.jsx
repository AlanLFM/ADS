import React, { useState, useEffect } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent,
  MDBModalHeader, MDBModalBody, MDBBtn, MDBIcon,
  MDBSpinner
} from 'mdb-react-ui-kit';
import pensando from '../assets/pensandoA.png'; // Imagen de ardilla pensando
import ardilla from '../assets/ardillaIA.png'; // Imagen de ardilla normal


const AsistenteIA = ({ isOpen, onClose, tarea }) => {
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && tarea && !respuesta) {
      consultarIA();
    }
  }, [isOpen, tarea]);

  const consultarIA = async () => {
    if (!tarea) return;

    setCargando(true);
    setError('');
    console.log("Consultando IA para tarea:", tarea.Sistema);
    
    if (tarea.Sistema === 'Todo') {
      console.log("Consultando IA para tarea Todo en IA:", tarea);
      try {
        const res = await fetch('http://localhost:3001/api/resolver-tarea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: tarea.title,
            importance: tarea.importance,
            descripcion: tarea.body.content,
            cursoNombre: "Personal tarea",
          })
        });
        
        if (!res.ok) throw new Error('Error en la consulta');
        
        const data = await res.json();
        setRespuesta(data.respuesta || 'Sin respuesta');
        
      }
      catch (err) {
        setError('No se pudo obtener la respuesta. Intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    }
    else if(tarea.Sistema === 'E-CEC') {
      try {
        const res = await fetch('http://localhost:3001/api/resolver-tarea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: tarea.Titulo_tarea,
            descripcion: tarea.Contenido,
            cursoNombre: tarea.Curso
          })
        });
        
        if (!res.ok) throw new Error('Error en la consulta');
        
        const data = await res.json();
        setRespuesta(data.respuesta || 'Sin respuesta');
        
      }
      catch (err) {
        setError('No se pudo obtener la respuesta. Intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    }
    else {
      try {
        const res = await fetch('http://localhost:3001/api/resolver-tarea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            cursoNombre: tarea.cursoNombre,
            fechaEntrega: tarea.fechaEntrega
          })
        });
        
        if (!res.ok) throw new Error('Error en la consulta');
        
        const data = await res.json();
        setRespuesta(data.respuesta || 'Sin respuesta');
        
      } catch (err) {
        setError('No se pudo obtener la respuesta. Intenta de nuevo.');
      } finally {
        setCargando(false);
      }


    }
  };

  const handleClose = () => {
    setRespuesta('');
    setError('');
    setCargando(false);
    onClose();
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(respuesta);
    } catch (err) {
      console.error('Error al copiar');
    }
  };

  if (!isOpen || !tarea) return null;

  return (
    <MDBModal open={isOpen} onClose={handleClose} tabIndex='-1'>
      <MDBModalDialog centered size="lg">
        <MDBModalContent>
          <MDBModalHeader className="border-0 justify-content-center position-relative">
            <div className="text-center">
              <div className="text-center mb-3">
                    {cargando ? (
                        <img src={pensando} alt="Pensando" style={{ width: '150 px' }} />
                    ) : (
                        <img src={ardilla} alt="IA" style={{ width: '150px' }} />
                    )}
                    <h6 className="mt-2 text-primary">Crosy</h6>          
                </div>
            </div>
            
            <MDBBtn 
              className='btn-close position-absolute' 
              color='none' 
              onClick={handleClose}
              style={{ top: '15px', right: '15px' }}
            />
          </MDBModalHeader>
          
          <MDBModalBody className="px-4 pb-4">
            <div className="bg-light p-3 rounded mb-3">
              <div className="fw-bold text-dark">{tarea.titulo}</div>
              {tarea.cursoNombre && (
                <small className="text-muted">{tarea.cursoNombre}</small>
              )}
            </div>

            {cargando ? (
              <div className="text-center py-4">
                <MDBSpinner className="mb-3" />
                <p className="text-muted mb-0">Generando respuesta...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <div>{error}</div>
                <MDBBtn 
                  color="primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={consultarIA}
                >
                  <MDBIcon fas icon="redo" className="me-1" />
                  Reintentar
                </MDBBtn>
              </div>
            ) : respuesta ? (
              <div>
                <div 
                  className="bg-white border rounded p-3 mb-3"
                  style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5'
                  }}
                >
                  {respuesta}
                </div>
                
                <div className="d-flex gap-2 justify-content-end">
                  <MDBBtn color="light" size="sm" onClick={copiarTexto}>
                    <MDBIcon fas icon="copy" className="me-1" />
                    Copiar
                  </MDBBtn>
                  <MDBBtn color="secondary" size="sm" onClick={consultarIA}>
                    <MDBIcon fas icon="sync" className="me-1" />
                    Nueva respuesta
                  </MDBBtn>
                  <MDBBtn color="primary" size="sm" onClick={handleClose}>
                    Cerrar
                  </MDBBtn>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                Preparando respuesta...
              </div>
            )}
          </MDBModalBody>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default AsistenteIA;
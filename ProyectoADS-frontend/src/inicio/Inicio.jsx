import React, { useState, useEffect } from 'react';
import './Inicio.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logos.png';
import { jwtDecode } from 'jwt-decode';
import TareaCard from '../tarea/tareaCard.jsx'; // Importar el nuevo componente
import {
  MDBNavbar, MDBNavbarToggler, MDBIcon,
  MDBNavbarNav, MDBNavbarItem, MDBNavbarLink,
  MDBContainer, MDBRow, MDBCol, MDBSpinner
} from 'mdb-react-ui-kit';

export default function App() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [access, setAccessToken] = useState("");
  const [cursos, setCursos] = useState([]);
  const [tareasVisibles, setTareasVisibles] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error("No se encontró el token de sesión. Redirigiendo a la página");
      navigate('/');
    }
    if (token) {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.user || !decoded.email) {
        console.error("Token inválido o datos faltantes en el token.");
        navigate('/');
      }

      setUsuario(decoded.user);
      setEmail(decoded.email);

      fetch('http://localhost:3001/api/usuario/googleToken', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ Id_Usuario: decoded.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.Google_AccessToken) {
            console.log("Token de Google obtenido:", data.Google_AccessToken);
            setAccessToken(data.Google_AccessToken);
          } else {
            console.warn("No se obtuvo token de Google.");
          }
        })
        .catch(err => console.error("Error al obtener el token de Google:", err));
    }
  }, []);

  useEffect(() => {
    if (access) {
      setTareasVisibles([]);
      setCargando(true);
      obtenerCursos(access);
    }
  }, [access]);

  const handleCerrar = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  async function obtenerCursos(token) {
    try {
      const res = await fetch("https://classroom.googleapis.com/v1/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.courses) {
        setCursos(data.courses);
        const todasLasTareas = [];
        
        for (const curso of data.courses) {
          const tareasDelCurso = await obtenerTareasAsignadasYNoVencidas(curso.id, curso.name, token);
          todasLasTareas.push(...tareasDelCurso);
        }
        
        // Ordenar tareas por fecha de entrega (más urgentes primero)
        todasLasTareas.sort((a, b) => {
          if (a.fechaEntrega === 'Sin fecha' && b.fechaEntrega === 'Sin fecha') return 0;
          if (a.fechaEntrega === 'Sin fecha') return 1;
          if (b.fechaEntrega === 'Sin fecha') return -1;
          
          const [diaA, mesA, añoA] = a.fechaEntrega.split('/');
          const [diaB, mesB, añoB] = b.fechaEntrega.split('/');
          const fechaA = new Date(añoA, mesA - 1, diaA);
          const fechaB = new Date(añoB, mesB - 1, diaB);
          
          return fechaA - fechaB;
        });
        
        setTareasVisibles(todasLasTareas);
        setCargando(false);
      }
    } catch (err) {
      console.error("Error al obtener cursos:", err);
      setCargando(false);
    }
  }

  async function obtenerTareasAsignadasYNoVencidas(courseId, courseName, token) {
    const tareasEncontradas = [];
    
    try {
      const resTareas = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!resTareas.ok) {
        console.warn(`No se pudieron obtener tareas del curso ${courseId}`);
        return tareasEncontradas;
      }
      
      const dataTareas = await resTareas.json();
      const tareas = dataTareas.courseWork;

      if (!tareas || tareas.length === 0) {
        console.log(`No hay tareas en el curso ${courseName}`);
        return tareasEncontradas;
      }

      for (const tarea of tareas) {
        try {
          const resSubmissions = await fetch(
            `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${tarea.id}/studentSubmissions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!resSubmissions.ok) {
            console.warn(`No se pudieron obtener submissions para la tarea ${tarea.title}`);
            continue;
          }

          const dataSubmissions = await resSubmissions.json();

          const asignadasYNoVencidas = dataSubmissions.studentSubmissions?.filter(sub => {
            const esAsignada = sub.state === 'CREATED' || sub.state === 'NEW';
            const fechaActual = new Date();
            let noVencida = true;

            if (tarea.dueDate && tarea.dueTime) {
              const { year, month, day } = tarea.dueDate;
              const { hours = 23, minutes = 59 } = tarea.dueTime;
              const fechaEntrega = new Date(year, month - 1, day, hours, minutes);
              noVencida = fechaActual <= fechaEntrega;
            } else if (tarea.dueDate) {
              const { year, month, day } = tarea.dueDate;
              const fechaEntrega = new Date(year, month - 1, day, 23, 59);
              noVencida = fechaActual <= fechaEntrega;
            }

            return esAsignada && noVencida;
          });

          if (asignadasYNoVencidas?.length > 0) {
            console.log(`📌 Tareas activas para el curso ${courseName} (${tarea.title}):`);
            
            tareasEncontradas.push(...asignadasYNoVencidas.map(sub => ({
              cursoId: courseId,
              cursoNombre: courseName,
              titulo: tarea.title,
              estado: sub.state,
              fechaEntrega: tarea.dueDate
                ? `${tarea.dueDate.day}/${tarea.dueDate.month}/${tarea.dueDate.year}`
                : 'Sin fecha',
              idEntrega: sub.id,
              descripcion: tarea.description || 'Sin descripción'
            })));
          }
        } catch (errorSubmission) {
          console.error(`Error al obtener submissions para la tarea ${tarea.title}:`, errorSubmission);
        }
      }
    } catch (error) {
      console.error(`Error en tareas del curso ${courseId}:`, error);
    }
    
    return tareasEncontradas;
  }

  return (
    <div>
      <MDBNavbar expand='lg' light bgColor='white'>
        <MDBContainer fluid>
          <MDBNavbarToggler aria-label='Toggle navigation'>
            <MDBIcon fas icon='bars' />
          </MDBNavbarToggler>
          <div className='collapse navbar-collapse'>
            <MDBNavbarNav right>
              <MDBNavbarItem active>
                <MDBNavbarLink onClick={() => navigate('/Perfil')}>{usuario}</MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBNavbarLink href='#'>Opciones</MDBNavbarLink>
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBNavbarLink href='#' onClick={handleCerrar}>Cerrar sesión</MDBNavbarLink>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </div>
        </MDBContainer>
      </MDBNavbar>

      <div className='p-5 text-center bg-light'>
        <img src={logo} alt="CrosStudy Logo" style={{ width: '250px', height: '250px' }} />
      </div>

      <MDBContainer className="mt-4">
        <MDBRow>
          <MDBCol md={12}>
            <div className="classroom-content mb-4">
              <h5>
                <MDBIcon fab icon="google" className="me-2 text-primary" />
                Google Classroom
              </h5>
              <p className="text-muted">
                {cargando ? 'Cargando información...' : 'Información cargada correctamente'}
              </p>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol md={12}>
            <div className="tareas-content">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>
                  <MDBIcon fas icon="tasks" className="me-2 text-success" />
                  Tareas Pendientes
                </h5>
                {!cargando && tareasVisibles.length > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {tareasVisibles.length} tarea{tareasVisibles.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {cargando ? (
                <div className="text-center py-5">
                  <MDBSpinner color="primary" />
                  <p className="mt-3 text-muted">Cargando tareas...</p>
                </div>
              ) : tareasVisibles.length === 0 ? (
                <div className="text-center py-5">
                  <MDBIcon fas icon="check-circle" size="3x" className="text-success mb-3" />
                  <h6 className="text-muted">¡Excelente! No tienes tareas pendientes.</h6>
                  <p className="text-muted">Todas tus tareas han sido completadas o no hay tareas asignadas.</p>
                </div>
              ) : (
                <div>
                  {tareasVisibles.map((tarea, index) => (
                    <TareaCard 
                      key={`${tarea.cursoId}-${tarea.idEntrega}-${index}`} 
                      tarea={tarea} 
                    />
                  ))}
                </div>
              )}
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-4">
          <MDBCol md={12}>
            <div className="teams-content">
              <h5>
                <MDBIcon fab icon="microsoft" className="me-2 text-info" />
                Microsoft Teams
              </h5>
              <p className="text-muted">Próximamente: Integración con Microsoft Teams</p>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
// Versión mejorada con MUI y cambio de tema por íconos

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logos.png';
import { lightTheme, darkTheme } from './theme.js';
import { jwtDecode } from 'jwt-decode';
import TareaCard from '../tarea/tareaCard.jsx';
import TareaCardCEC from '../tarea/tareaCEC.jsx';
import TareaCardTodo from '../tarea/tareaTodo.jsx';
import {Box} from '@mui/material';
import letrero from '../assets/letrero.png';
import letrero2 from '../assets/letrero2.png';


import {
  AppBar, Toolbar, Typography, IconButton, Container,
  Grid, Card, CardContent, Badge, CssBaseline, createTheme,
  ThemeProvider, useMediaQuery, CircularProgress
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

export default function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [access, setAccessToken] = useState("");
  const [cursos, setCursos] = useState([]);
  const [tareasVisibles, setTareasVisibles] = useState([]);
  const [tareasCEC, setTareasCEC] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [tareasTodo, setTareasTodo] = useState([]);
  const [temaOscuro, setTemaOscuro] = useState(false);

  // Cargar preferencia de tema del localStorage al iniciar
  useEffect(() => {
    const temaGuardado = localStorage.getItem('temaOscuro');
    if (temaGuardado) {
      setTemaOscuro(JSON.parse(temaGuardado));
    }
  }, []);

  // Guardar preferencia de tema cuando cambie
  useEffect(() => {
    localStorage.setItem('temaOscuro', JSON.stringify(temaOscuro));
  }, [temaOscuro]);

  const toggleTema = () => {
    setTemaOscuro(!temaOscuro);
  };

  // Colores del tema
  const tema = {
    light: {
      background: '#f8f9fa',
      color: '#495057',
      navbarBg: '#fff',
      navbarBorder: '#e9ecef',
      cardBg: '#fff',
      cardBorder: '#e9ecef',
      titleColor: '#212529',
      mutedColor: '#6c757d',
      iconColor: '#495057'
    },
    dark: {
      background: '#1a1a1a',
      color: '#e9ecef',
      navbarBg: '#2d2d2d',
      navbarBorder: '#404040',
      cardBg: '#2d2d2d',
      cardBorder: '#404040',
      titleColor: '#ffffff',
      mutedColor: '#adb5bd',
      iconColor: '#e9ecef'
    }
  };

  const coloresActuales = temaOscuro ? tema.dark : tema.light;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error("No se encontró el token de sesión. Redirigiendo a la página");
      navigate('/');
      return;
    }

    const decoded = jwtDecode(token);
    if (!decoded || !decoded.user || !decoded.email) {
      console.error("Token inválido o datos faltantes en el token.");
      navigate('/');
      return;
    }

    const userId = decoded.id;
    setUsuario(decoded.user);
    setEmail(decoded.email);
    setIdUsuario(userId);

    const fetchData = async () => {
      try {
        // Google token
        const googleRes = await fetch('http://localhost:3001/api/usuario/googleToken', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ Id_Usuario: userId })
        });
        const googleData = await googleRes.json();
        if (googleData.Google_AccessToken) {
          setAccessToken(googleData.Google_AccessToken);
        }

        // Microsoft To-Do tareas
        const todoRes = await fetch(`http://localhost:3001/api/todo/tareas?Id_Usuario=${userId}`);
        const todoData = await todoRes.json();
        console.log("Tareas todo: ", todoData);

        setTareasTodo(todoData);

        // Moodle CEC tareas
        const cecRes = await fetch(`http://localhost:3001/api/usuario/${userId}/tareas?sistema=E-CEC`);
        const cecData = await cecRes.json();
        setTareasCEC(cecData);

      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [navigate]);

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

  // Calcular totales para mostrar en badges
  const totalTareas = tareasVisibles.length + (Array.isArray(tareasCEC) ? tareasCEC.length : 0) + (Array.isArray(tareasTodo) ? tareasTodo.length : 0);

  return (
    <ThemeProvider theme={theme}>
  <CssBaseline />
  <Box
    sx={{
      minHeight: '100vh',
      background: darkMode
        ? 'linear-gradient(135deg,rgb(12, 37, 75),rgb(12, 62, 95),rgb(80, 10, 106))'
        : 'linear-gradient(135deg, rgb(198, 145, 145),rgb(182, 102, 102),rgb(176, 84, 38))',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <AppBar position="static" sx={{
    backgroundColor: theme.appBar.main }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: 32, marginRight: 12 }} />
          <img
              src={darkMode ? letrero: letrero2}
              alt="CrosStudy"
              style={{ height: 120 }}
            />
        </div>
        <div>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton onClick={() => navigate('/Perfil')} color="inherit">
            <Typography variant="body2">{usuario}</Typography>
          </IconButton>
          <IconButton onClick={handleCerrar} color="error">
            <Typography variant="body2">Salir</Typography>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>

    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Typography variant="h5" gutterBottom>
        Mis Tareas ({totalTareas})
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GoogleIcon sx={{ mr: 1 }} /> Classroom
              </Typography>
              {cargando ? <CircularProgress /> : (
                tareasVisibles.length === 0
                  ? <Typography variant="body2">Sin tareas</Typography>
                  : tareasVisibles.map((t, i) => <TareaCard key={i} tarea={t} />)
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ mr: 1 }} /> E-CEC
              </Typography>
              {tareasCEC.length === 0
                ? <Typography variant="body2">Sin conexión</Typography>
                : tareasCEC.map((t, i) => <TareaCardCEC key={i} tarea={t} />)}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MicrosoftIcon sx={{ mr: 1 }} /> Microsoft To-Do
              </Typography>
              {Array.isArray(tareasTodo) && tareasTodo.length > 0 ? (
                    tareasTodo.map((t, i) => <TareaCardTodo key={i} tarea={t} />)
                  ) : (
                    <Typography  variant= "body2" > Sin conexión</Typography>)
                    }

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  </Box>
</ThemeProvider>

  );
}

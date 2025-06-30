import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Fade,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  SmartToy as AIIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import pensando from '../assets/pensandoA.png';
import ardilla from '../assets/ardillaIA.png';
import Crossy from '../assets/Crossy.png';

const AsistenteIA = ({ isOpen, onClose, tarea }) => {
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isOpen && tarea && !respuesta) {
      setAnimationStep(0);
      consultarIA();
    }
  }, [isOpen, tarea]);

  useEffect(() => {
    if (cargando) {
      const timer = setTimeout(() => setAnimationStep(1), 500);
      return () => clearTimeout(timer);
    }
  }, [cargando]);

  const consultarIA = async () => {
    if (!tarea) return;

    setCargando(true);
    setError('');
    setRespuesta('');
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      let requestBody = {};
      
      if (tarea.Sistema === 'Todo') {
        requestBody = {
          titulo: tarea.title,
          importance: tarea.importance,
          descripcion: tarea.body.content,
          cursoNombre: "Personal tarea",
        };
      } else if (tarea.Sistema === 'E-CEC') {
        requestBody = {
          titulo: tarea.Titulo_tarea,
          descripcion: tarea.Contenido,
          cursoNombre: tarea.Curso
        };
      } else {
        requestBody = {
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          cursoNombre: tarea.cursoNombre,
          fechaEntrega: tarea.fechaEntrega
        };
      }

      // Simular tiempo de procesamiento mínimo para la animación
      await delay(1500);

      const res = await fetch('http://localhost:3001/api/resolver-tarea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) throw new Error('Error en la consulta');
      
      const data = await res.json();
      setRespuesta(data.respuesta || 'Sin respuesta');
      
    } catch (err) {
      setError('No se pudo obtener la respuesta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setRespuesta('');
    setError('');
    setCargando(false);
    setAnimationStep(0);
    onClose();
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(respuesta);
      setShowCopySuccess(true);
    } catch (err) {
      console.error('Error al copiar');
    }
  };

  const getTareaInfo = () => {
    if (tarea.Sistema === 'Todo') {
      return {
        titulo: tarea.title,
        curso: "Personal tarea",
        sistema: "Todo Personal"
      };
    } else if (tarea.Sistema === 'E-CEC') {
      return {
        titulo: tarea.Titulo_tarea,
        curso: tarea.Curso,
        sistema: "E-CEC"
      };
    } else {
      return {
        titulo: tarea.titulo,
        curso: tarea.cursoNombre,
        sistema: "Google Classroom"
      };
    }
  };

  if (!isOpen || !tarea) return null;

  const tareaInfo = getTareaInfo();

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            minHeight: '60vh'
          }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          m: 0,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Crossy la IA
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose}
            sx={{ color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0
          }} />
        </DialogTitle>

        {cargando && <LinearProgress />}

        <DialogContent sx={{ p: 4 }}>
          {/* AI Character Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Fade in={true} timeout={1000}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                {cargando ? (
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={pensando}
                      alt="Pensando"
                      style={{ 
                        width: 150
                      }}
                    />
                  </Box>
                ) : (
                  <img
                    src={ardilla}
                    alt="IA"
                    style={{ 
                      width: 150, 
                    }}
                  />
                )}
                
                <img
                  src={Crossy}
                  alt="Crossy"
                  style={{ 
                    width: 120,
                  }}
                />
              </Box>
            </Fade>
            
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#667eea' }}>
              {cargando ? 'Analizando tu tarea...' : ''}
            </Typography>
          </Box>

          {/* Task Information Card */}
          <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 2, color: '#667eea' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {tareaInfo.titulo}
                </Typography>
                <Chip 
                  label={tareaInfo.sistema} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              {tareaInfo.curso && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {tareaInfo.curso}
                  </Typography>
                </Box>
              )}
              
            </CardContent>
          </Card>

          {/* Content Section */}
          {cargando ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 2
              }}
            >
              <CircularProgress sx={{ mb: 2, color: '#667eea' }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Generando respuesta inteligente...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crossy está analizando tu tarea y preparando la mejor respuesta posible
              </Typography>
            </Paper>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={consultarIA}
                  startIcon={<RefreshIcon />}
                >
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          ) : respuesta ? (
            <Fade in={true} timeout={1000}>
              <Box>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    backgroundColor: '#121212',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '3px',
                    },
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                      fontSize: '1rem'
                    }}
                  >
                    {respuesta}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          ) : (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Preparando respuesta...
              </Typography>
            </Paper>
          )}
        </DialogContent>

        {/* Actions */}
        {!cargando && (
          <>
            <Divider />
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              <Button 
                onClick={handleClose}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cerrar
              </Button>
              
              {respuesta && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Tooltip title="Copiar respuesta al portapapeles">
                    <Button
                      onClick={copiarTexto}
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      sx={{ minWidth: 120 }}
                    >
                      Copiar
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Generar nueva respuesta">
                    <Button
                      onClick={consultarIA}
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      sx={{ 
                        minWidth: 140,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        }
                      }}
                    >
                      Nueva respuesta
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCopySuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          icon={<CheckCircleIcon />}
        >
          ¡Respuesta copiada al portapapeles!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AsistenteIA;
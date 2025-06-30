import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Link as LinkIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ECEC = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [idUsuario, setIdUsuario] = useState('');
  const [step, setStep] = useState(1); // 1: formulario, 2: resultados

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setIdUsuario(decoded.id);
    }
  }, []);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setTareas([]);
    setError('');
    setSuccess(false);
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const vincularMoodle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setTareas([]);

    try {
      const res = await fetch('http://localhost:3001/api/moodle/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al consultar E-CEC');

      setTareas(data);
      navigate('/'); // Redirigir al dashboard

      // Guardar tareas en el backend
      await fetch('http://localhost:3001/api/moodle/guardar-tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tareas: data,
          Id_Usuario: idUsuario
        })
      });

      setSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
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
        m: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Vincular E-CEC
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {loading && <LinearProgress />}

      <DialogContent sx={{ p: 4 }}>
        {step === 1 ? (
          <Fade in={true}>
            <Box>
              {/* Información explicativa */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinkIcon sx={{ mr: 2, color: '#667eea' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Conectar con E-CEC
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Ingresa tus credenciales de E-CEC para sincronizar automáticamente tus tareas 
                  y actividades pendientes con CrosStudy. Tus datos están seguros y encriptados.
                </Typography>
              </Paper>

              {/* Formulario */}
              <Box component="form" onSubmit={vincularMoodle}>
                <TextField
                  fullWidth
                  label="Usuario E-CEC"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  variant="outlined"
                />

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    icon={<WarningIcon />}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 2, color: 'white' }} />
                      Conectando...
                    </Box>
                  ) : (
                    'Vincular Cuenta'
                  )}
                </Button>
              </Box>
            </Box>
          </Fade>
        ) : (
          <Fade in={true}>
            <Box>
              {/* Mensaje de éxito */}
              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  icon={<CheckCircleIcon />}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    ¡Conexión exitosa!
                  </Typography>
                  <Typography variant="body2">
                    Tu cuenta de E-CEC ha sido vinculada correctamente.
                  </Typography>
                </Alert>
              )}

              {/* Resumen de tareas encontradas */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 2, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Tareas Sincronizadas
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${tareas.length} tareas`} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {tareas.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {tareas.slice(0, 5).map((tarea, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <ListItemIcon>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={tarea.name || `Tarea ${index + 1}`}
                          secondary={tarea.course || 'Curso no especificado'}
                        />
                        <Chip 
                          label="Pendiente" 
                          size="small" 
                          color="warning"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                    {tareas.length > 5 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Y {tareas.length - 5} tareas más...
                      </Typography>
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron tareas pendientes.
                  </Typography>
                )}
              </Paper>
            </Box>
          </Fade>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        {step === 1 ? (
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            Cancelar
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
            <Button 
              onClick={() => setStep(1)} 
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Volver
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={() => navigate('/')} 
                variant="contained"
                color="primary"
                sx={{ minWidth: 120 }}
              >
                Ver Dashboard
              </Button>
              <Button 
                onClick={handleClose} 
                variant="outlined"
                sx={{ minWidth: 120 }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ECEC;
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import Google from '../googleB/google.jsx';
import { useNavigate } from 'react-router-dom';
import VincularMicrosoft from '../Microsoft/microsoft.jsx';
import ECEC from '../E-CEC/CEC.jsx';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export default function PersonalProfile() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState("")
    const [email, setEmail] = useState("")
    const [idUsuario, setIdUsuario] = useState("");
    const [googleVinculado, setGoogleVinculado] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [correoGoogle, setCorreoGoogle] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    setGoogleVinculado(false);
                }

                if (data.Google_email) setCorreoGoogle(data.Google_email);
                if (data.URL_Foto) setFotoPerfil(data.URL_Foto);
            })
            .catch(err => console.error("Error al obtener perfil:", err));
        }
    }, []);

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Header con botón de regreso */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        Regresar al Dashboard
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    {/* Tarjeta principal del perfil */}
                    <Grid item xs={12} lg={8}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 4, 
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            {/* Información del usuario */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Avatar
                                    src={fotoPerfil}
                                    alt="Foto de perfil"
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        mr: 3,
                                        border: '4px solid #667eea'
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 60 }} />
                                </Avatar>
                                
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {usuario}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {email}
                                        </Typography>
                                    </Box>
                                    
                                    {correoGoogle && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <GoogleIcon sx={{ mr: 1, color: '#4285f4' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {correoGoogle}
                                            </Typography>
                                            <Chip 
                                                label="Vinculado" 
                                                size="small" 
                                                color="success" 
                                                sx={{ ml: 1 }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Descripción de bienvenida */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    ¡Bienvenido a CrosStudy! 🎓
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                                    Desde aquí puedes gestionar tu perfil y vincular tus cuentas de las diferentes 
                                    plataformas educativas. Mantén todas tus herramientas de aprendizaje 
                                    sincronizadas en un solo lugar.
                                </Typography>
                            </Box>

                            {/* Sección de vinculación de cuentas */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                    <LinkIcon sx={{ mr: 1, color: '#667eea' }} />
                                    Vincular Plataformas
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        {googleVinculado ? (
                                            <Card sx={{ 
                                                p: 2, 
                                                textAlign: 'center',
                                                backgroundColor: '#f8f9fa',
                                                border: '2px solid #4285f4'
                                            }}>
                                                <CheckCircleIcon sx={{ color: '#4285f4', fontSize: 40, mb: 1 }} />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    Google Classroom
                                                </Typography>
                                                <Chip 
                                                    label="Conectado" 
                                                    color="success" 
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            </Card>
                                        ) : (
                                            <Card sx={{ 
                                                p: 2, 
                                                textAlign: 'center',
                                                border: '2px dashed #ccc',
                                                '&:hover': { borderColor: '#4285f4' }
                                            }}>
                                                <GoogleIcon sx={{ color: '#4285f4', fontSize: 40, mb: 1 }} />
                                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                    Google Classroom
                                                </Typography>
                                                <Google />
                                            </Card>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ 
                                            p: 2, 
                                            textAlign: 'center',
                                            border: '2px dashed #ccc',
                                            '&:hover': { borderColor: '#0078d4' }
                                        }}>
                                            <MicrosoftIcon sx={{ color: '#0078d4', fontSize: 40, mb: 1 }} />
                                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                Microsoft To Do
                                            </Typography>
                                            <VincularMicrosoft />
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ 
                                            p: 2, 
                                            textAlign: 'center',
                                            border: '2px dashed #ccc',
                                            '&:hover': { borderColor: '#764ba2' }
                                        }}>
                                            <SchoolIcon sx={{ color: '#764ba2', fontSize: 40, mb: 1 }} />
                                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                E-CEC
                                            </Typography>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => setIsModalOpen(true)}
                                                sx={{
                                                    backgroundColor: '#764ba2',
                                                    '&:hover': { backgroundColor: '#5a3978' }
                                                }}
                                            >
                                                Vincular
                                            </Button>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Panel lateral con estadísticas */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>
                            {/* Tarjeta de estadísticas */}
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Estado de Conexiones
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Google Classroom</Typography>
                                        <Chip 
                                            label={googleVinculado ? "Activo" : "Desconectado"} 
                                            color={googleVinculado ? "success" : "default"}
                                            size="small"
                                        />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Microsoft Teams</Typography>
                                        <Chip label="Disponible" color="default" size="small" />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">E-CEC</Typography>
                                        <Chip label="Disponible" color="default" size="small" />
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Tarjeta de accesos rápidos */}
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Accesos Rápidos
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Button 
                                        variant="outlined" 
                                        fullWidth 
                                        startIcon={<AccountCircleIcon />}
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        Editar Perfil
                                    </Button>
                                    
                                    <Button 
                                        variant="outlined" 
                                        fullWidth 
                                        startIcon={<SchoolIcon />}
                                        sx={{ justifyContent: 'flex-start' }}
                                        onClick={() => navigate('/')}
                                    >
                                        Mis Tareas
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Modal de E-CEC */}
                <ECEC isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </Container>
        </Box>
    );
}
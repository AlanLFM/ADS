const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Usuario, Administrador } = require('./Aplicacion');
const sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SECRET_KEY = 'crosstudy_jwt_secret';
const RECAPTCHA_SECRET = '6LcdUWgrAAAAAEmz-zt2-BZUWOtESlt4gHnJmaDU';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password, recaptchaToken } = req.body;
  if (!username || !password || !recaptchaToken) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  // Verificar reCAPTCHA
  try {
    const recaptchaRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`
    );
    if (!recaptchaRes.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA inválido' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error al verificar reCAPTCHA' });
  }
  try {
    // Buscar primero en Administrador
    const admin = await Administrador.findOne({ where: { Username_Admin: username } });
    if (admin) {
      if (admin.Password_Admin === password) {
        const token = jwt.sign({ id: admin.Id_Admin, tipo: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        return res.json({ message: 'Login exitoso', tipo: 'admin', token });
      } else {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    }
    // Si no es admin, buscar en Usuario
    const user = await Usuario.findOne({ where: { Username: username } });
    if (user) {
      if (user.Password === password) {
        const token = jwt.sign({ id: user.Id_Usuario, tipo: 'usuario', user: user.Username, email: user.Email, Google_UID: user.Google_UID, Google_AccessToken: user.Google_AccessToken }, SECRET_KEY, { expiresIn: '2h' });
        return res.json({ message: 'Login exitoso', tipo: 'usuario', token });
      } else {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    }
    // No encontrado en ninguna tabla
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Endpoint para crear usuario
app.post('/usuarios', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  try {
    // Verificar si ya existe un usuario con ese username o email
    const existe = await Usuario.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { Username: username },
          { Email: email }
        ]
      }
    });
    if (existe) {
      return res.status(409).json({ message: 'El usuario o email ya existe' });
    }
    const nuevo = await Usuario.create({ Username: username, Email: email, Password: password });
    res.status(201).json({ message: 'Usuario creado', user: { id: nuevo.Id_Usuario, username: nuevo.Username, email: nuevo.Email } });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Endpoint para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});
//Para vincular cuenta de Google
// Este endpoint asume que el usuario ya está autenticado en el sistema y tiene su propio ID
app.post('/api/vincularGoogle', async (req, res) => {
  const { googleId, email, accessToken, token_expiration, displayName, photoURL, idUsuario } = req.body;
  console.log(`Vinculando cuenta de Google para el usuario con ID: ${idUsuario}` + "Y token de acceso:", accessToken);
  
  await Usuario.update(
    {
      Google_UID: googleId,
      Google_AccessToken: accessToken,
      Google_Token_Expiracion: token_expiration,
      URL_Foto: photoURL,
      Google_email: email,
    },
    {
      where: { Id_Usuario: idUsuario },
    }
  );

  res.json({ message: 'Cuenta de Google vinculada exitosamente' });
});

app.post('/api/usuario/perfil', async (req, res) => {
  const {Id_Usuario} = req.body
  console.log(`Obteniendo perfil para el usuario con ID: ${Id_Usuario}`);
  
  try {
    const usuario = await Usuario.findOne({
      where: { Id_Usuario },
      attributes: ['Google_email', 'Google_UID', 'URL_Foto', 'Google_AccessToken'],
    });
    
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

app.post('/api/usuario/googleToken', async (req, res) => {
  const { Id_Usuario } = req.body;
  try {
    const tokenG = await Usuario.findOne({
      where: {Id_Usuario},
      attributes: ['Google_AccessToken']
    });

    if (!tokenG) {
      return res.status(404).json({ message: 'Usuario no encontrado'});
    }
    res.json(tokenG);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});
  


app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});  


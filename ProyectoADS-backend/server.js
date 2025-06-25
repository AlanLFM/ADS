const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Usuario, Administrador } = require('./Aplicacion');
const sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SECRET_KEY = 'crosstudy_jwt_secret';
const RECAPTCHA_SECRET = '6LcdUWgrAAAAAEmz-zt2-BZUWOtESlt4gHnJmaDU';
require('dotenv').config();
const iaControl = require('./iaControl'); // Importar el controlador de IA

const PORT = 3001;
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(iaControl)
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
  
//Redirigir al usuario a Microsoft para vincular su cuenta
app.get('/api/vincularMicrosoft', (req, res) => {
  const { idUsuario } = req.query; // o token decoded
  const scopes = [
    'offline_access',
    'User.Read',
    'Tasks.Read',
    'Group.Read.All'
  ].join(' ');

  const authUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize` +
    `?client_id=${process.env.MICROSOFT_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${idUsuario}`;

  res.redirect(authUrl);
});

//Recibir el callback de Microsoft para procesar token y guardar en BD
app.get('/api/callbackMicrosoft', async (req, res) => {
  const { code, state } = req.query; // state = idUsuario

  try {
    console.log('Solicitando token con:', {
      client_id: process.env.MICROSOFT_CLIENT_ID,
      scope: 'offline_access User.Read Tasks.Read Group.Read.All',
      code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      grant_type: 'authorization_code',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    });
    const tokenRes = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        scope: 'offline_access User.Read Tasks.Read Group.Read.All',
        code: code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const vencimiento = new Date(Date.now() + expires_in * 1000);

    // Obtener info del usuario Microsoft
    const perfil = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const email = perfil.data.mail || perfil.data.userPrincipalName;

    // Guardar tokens e info en base de datos
    await Usuario.update(
      {
        Microsoft_UID: perfil.data.id,
        Microsoft_Email: email,
        Microsoft_AccessToken: access_token,
        Microsoft_RefreshToken: refresh_token,
        Microsoft_Token_Expiracion: vencimiento,
      },
      { where: { Id_Usuario: state } }
    );

    res.send('Cuenta de Microsoft vinculada exitosamente. Puede cerrar esta pestaña.');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error al vincular cuenta Microsoft.');
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});  


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createSpotifyApi } = require('./spotify');

dotenv.config();

const app = express(); // 🟢 Aquí defines 'app'

app.use(cors());
app.use(express.json());

// Variables globales para token
let accessToken = '';
let refreshToken = '';

// Endpoint: login
app.get('/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming',
  ];
  const authorizeURL = createSpotifyApi().createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// Endpoint: callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const spotifyApi = createSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);

    accessToken = data.body['access_token'];
    refreshToken = data.body['refresh_token'];

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: data.body['expires_in'],
    });
  } catch (err) {
    console.error('Error durante el login:', err);
    res.status(400).send('Error al autenticar');
  }
});

// Endpoint: play
app.post('/play', async (req, res) => {
  try {
    const { playlist } = req.body;

    if (!accessToken) {
      return res.status(401).send('No autorizado. Inicia sesión con Spotify primero.');
    }

    const spotifyApi = createSpotifyApi(accessToken, refreshToken);

    const devices = await spotifyApi.getMyDevices();
    const activeDevice = devices.body.devices.find(d => d.is_active);

    if (!activeDevice) {
      return res.status(400).send('No hay un dispositivo activo de Spotify. Abre la app de Spotify.');
    }

    await spotifyApi.play({
      device_id: activeDevice.id,
      context_uri: playlist,
    });

    res.send('Reproducción iniciada');
  } catch (err) {
    console.error('Error al reproducir:', err);
    res.status(500).send('Error al reproducir música');
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});


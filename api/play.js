const { getValidSpotifyApi } = require('../spotify.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed' 
    });
  }

  try {
    const { playlist, trackUri } = req.body;

    if (!playlist && !trackUri) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either playlist or trackUri is required'
      });
    }

    const spotifyApi = await getValidSpotifyApi();

    // Obtener dispositivos disponibles
    const devices = await spotifyApi.getMyDevices();
    const activeDevice = devices.body.devices.find(d => d.is_active);

    if (!activeDevice) {
      return res.status(400).json({
        error: 'No Active Device',
        message: 'No hay dispositivo activo. Abre Spotify en tu teléfono o computadora.',
        devices: devices.body.devices.map(d => ({ name: d.name, type: d.type }))
      });
    }

    // Reproducir música
    const playOptions = {
      device_id: activeDevice.id,
    };

    if (playlist) {
      playOptions.context_uri = playlist;
    } else if (trackUri) {
      playOptions.uris = [trackUri];
    }

    await spotifyApi.play(playOptions);

    res.status(200).json({
      success: true,
      message: '🎵 Reproducción iniciada',
      device: activeDevice.name
    });

  } catch (error) {
    console.error('Error al reproducir:', error);
    
    if (error.message.includes('No access token')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '❌ No autorizado. Inicia sesión con Spotify primero.',
        needsLogin: true
      });
    }

    if (error.statusCode === 403) {
      return res.status(403).json({
        error: 'Premium Required',
        message: 'Se requiere Spotify Premium para controlar la reproducción.'
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Dispositivo no encontrado o playlist/track no válido.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error al reproducir música.',
      details: error.message
    });
  }
};

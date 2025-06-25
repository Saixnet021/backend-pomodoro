const { createSpotifyApi } = require('../spotify.js');
const { db } = require('../firebase.js');

module.exports = async function handler(req, res) {
  try {
    const code = req.query.code;
    
    if (!code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Authorization code is required'
      });
    }

    const spotifyApi = createSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;

    // Guarda en Firestore
    await db.collection('tokens').doc('spotify').set({
      accessToken,
      refreshToken,
      updatedAt: new Date().toISOString(),
    });

    res.json({ 
      success: true,
      message: '✅ Tokens guardados correctamente en Firestore' 
    });
  } catch (error) {
    console.error('Error al autenticar con Spotify:', error);
    res.status(400).json({
      error: 'Authentication Error',
      message: 'Error al autenticar con Spotify: ' + error.message
    });
  }
};

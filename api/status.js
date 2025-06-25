const { db } = require('../firebase.js');
const { createSpotifyApi } = require('../spotify.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed' 
    });
  }

  try {
    // Verificar si hay tokens en Firestore
    const doc = await db.collection('tokens').doc('spotify').get();
    const data = doc.data();

    if (!data?.accessToken) {
      return res.status(401).json({
        authenticated: false,
        message: 'No access token found. Please login with Spotify first.'
      });
    }

    // Verificar si el token es válido
    const spotifyApi = createSpotifyApi();
    spotifyApi.setAccessToken(data.accessToken);
    spotifyApi.setRefreshToken(data.refreshToken);

    try {
      // Intentar obtener información del usuario
      const userInfo = await spotifyApi.getMe();
      
      return res.status(200).json({
        authenticated: true,
        message: 'User is authenticated',
        user: {
          id: userInfo.body.id,
          display_name: userInfo.body.display_name,
          email: userInfo.body.email,
          product: userInfo.body.product // free, premium
        }
      });
    } catch (error) {
      if (error.statusCode === 401) {
        // Token expirado, intentar refresh
        try {
          const { refreshSpotifyToken } = require('../spotify.js');
          await refreshSpotifyToken();
          
          return res.status(200).json({
            authenticated: true,
            message: 'Token refreshed successfully'
          });
        } catch (refreshError) {
          return res.status(401).json({
            authenticated: false,
            message: 'Token expired and refresh failed. Please login again.'
          });
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return res.status(500).json({
      authenticated: false,
      error: 'Internal Server Error',
      message: 'Error checking authentication status: ' + error.message
    });
  }
};

const SpotifyWebApi = require('spotify-web-api-node');
const { db } = require('./firebase.js');

function createSpotifyApi() {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
    throw new Error('Missing required Spotify environment variables');
  }
  
  return new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });
}

async function refreshSpotifyToken() {
  try {
    const doc = await db.collection('tokens').doc('spotify').get();
    const data = doc.data();

    if (!data?.refreshToken) {
      throw new Error('No refresh token found');
    }

    const spotifyApi = createSpotifyApi();
    spotifyApi.setRefreshToken(data.refreshToken);

    const response = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = response.body;

    // Actualizar token en Firestore
    await db.collection('tokens').doc('spotify').update({
      accessToken: access_token,
      updatedAt: new Date().toISOString(),
      expiresIn: expires_in
    });

    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

async function getValidSpotifyApi() {
  const doc = await db.collection('tokens').doc('spotify').get();
  const data = doc.data();

  if (!data?.accessToken) {
    throw new Error('No access token found. Please login with Spotify first.');
  }

  const spotifyApi = createSpotifyApi();
  spotifyApi.setAccessToken(data.accessToken);
  spotifyApi.setRefreshToken(data.refreshToken);

  try {
    // Verificar si el token es válido
    await spotifyApi.getMe();
    return spotifyApi;
  } catch (error) {
    if (error.statusCode === 401) {
      // Token expirado, intentar refresh
      const newAccessToken = await refreshSpotifyToken();
      spotifyApi.setAccessToken(newAccessToken);
      return spotifyApi;
    }
    throw error;
  }
}

module.exports = {
  createSpotifyApi,
  refreshSpotifyToken,
  getValidSpotifyApi
};

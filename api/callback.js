import { createSpotifyApi } from '../spotify';
import { db } from '../firebase';

export default async function handler(req, res) {
  const code = req.query.code;
  const spotifyApi = createSpotifyApi();

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;

    // Guarda en Firestore
    await db.collection('tokens').doc('spotify').set({
      accessToken,
      refreshToken,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: '✅ Tokens guardados correctamente en Firestore' });
  } catch (error) {
    console.error('Error al autenticar con Spotify:', error);
    res.status(400).send('Error al autenticar con Spotify');
  }
}

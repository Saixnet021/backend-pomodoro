import { createSpotifyApi } from '../spotify';

let accessToken = '';
let refreshToken = '';

export default async function handler(req, res) {
  const code = req.query.code;
  const spotifyApi = createSpotifyApi();

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    accessToken = data.body.access_token;
    refreshToken = data.body.refresh_token;

    res.json({ access_token: accessToken, refresh_token: refreshToken });
  } catch (error) {
    console.error('Error al obtener el token:', error);
    res.status(400).send('Error al autenticar con Spotify');
  }
}

// Exportamos para poder usarlos en otras rutas
export { accessToken, refreshToken };


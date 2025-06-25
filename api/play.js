import { createSpotifyApi } from '../spotify';
import { accessToken, refreshToken } from './callback';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!accessToken) {
    return res.status(401).send('No autorizado. Inicia sesión con Spotify.');
  }

  const { playlist } = req.body;
  const spotifyApi = createSpotifyApi(accessToken, refreshToken);

  try {
    const devices = await spotifyApi.getMyDevices();
    const active = devices.body.devices.find(d => d.is_active);

    if (!active) {
      return res.status(400).send('No hay dispositivo activo.');
    }

    await spotifyApi.play({
      device_id: active.id,
      context_uri: playlist,
    });

    res.status(200).send('Reproducción iniciada');
  } catch (e) {
    console.error('Error al reproducir:', e);
    res.status(500).send('Error');
  }
}

import SpotifyWebApi from 'spotify-web-api-node';

export function createSpotifyApi(accessToken, refreshToken) {
  const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });

  if (accessToken) api.setAccessToken(accessToken);
  if (refreshToken) api.setRefreshToken(refreshToken);

  return api;
}

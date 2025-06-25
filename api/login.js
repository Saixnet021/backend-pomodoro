import { createSpotifyApi } from '../spotify';

export default function handler(req, res) {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming'
  ];

  const spotifyApi = createSpotifyApi();
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, null);
  res.redirect(authorizeURL);
}

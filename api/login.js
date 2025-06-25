const { createSpotifyApi } = require('../spotify');

export default async function handler(req, res) {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming',
  ];

  const authorizeURL = createSpotifyApi().createAuthorizeURL(scopes, null);
  res.redirect(authorizeURL);
}

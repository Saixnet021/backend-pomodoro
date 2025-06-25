const { createSpotifyApi } = require('../spotify.js');

module.exports = function handler(req, res) {
  try {
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
  } catch (error) {
    console.error('Error in login handler:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};

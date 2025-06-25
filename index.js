module.exports = (req, res) => {
  res.status(200).json({
    message: "Pomodoro Spotify Backend API",
    status: "running",
    endpoints: {
      login: "/api/login",
      callback: "/api/callback", 
      play: "/api/play"
    },
    timestamp: new Date().toISOString()
  });
};

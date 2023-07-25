module.exports = {
  // Other configurations...
  async rewrites() {
    return [
      // Rewriting requests to /socket.io to /api/socket
      {
        source: "/socket.io",
        destination: "/api/socket",
      },
    ];
  },
};

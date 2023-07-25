// server.js
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with the URL of your Next.js app
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected.");

  socket.on("notification", (data) => {
    // Broadcast the received notification to all connected clients (including sender).
    io.emit("notification", data);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });
});

server.listen(3001, () => {
  console.log("WebSocket server listening on port 3001");
});

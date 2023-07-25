import { Server } from "socket.io";
// /*
// const SocketHandler = (req, res) => {
//   if (res.socket.server.io) {
//     console.log("Socket is already running");
//   } else {
//     console.log("Socket is initializing");
//     const io = new Server(res.socket.server);
//     res.socket.server.io = io;
//   }
//   res.end();
// };

// export default SocketHandler;
//  */
// import { Server } from "socket.io";
// import { NextApiRequest, NextApiResponse } from "next";
// import http from "http";

// // Create an HTTP server
// const httpServer = http.createServer();

// // Initialize WebSocket server
// const io = new Server(httpServer, {
//   // Socket.IO server options
//   // Add your desired options here, if any
//   cors: {
//     origin: "*",
//   },
// });

// // Export the handler function for the API route
// export default function socketHandler(req, res) {
//   // Handle the HTTP request
//   if (res.socket.server.io) {
//     console.log("Socket is already running");
//   } else {
//     console.log("Socket is initializing");
//     res.socket.server.io = io;

//     io.on("connection", (socket) => {
//       console.log("A client connected.");

//       socket.on("notification", (data) => {
//         console.log("%cL10", "background: red");

//         // Broadcast the received notification to all connected clients (including the sender).
//         // io.emit("notification", data);
//         socket.broadcast.emit("notification", data);
//         console.log(data);
//       });

//       socket.on("disconnect", () => {
//         console.log("A client disconnected.");
//       });
//     });
//   }
//   res.end();
// }

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.broadcast.emit("a user connected");
      socket.on("hello", (msg) => {
        socket.emit("hello", "world!");
      });

      socket.on("notification", (data) => {
        console.log("%cL10", "background: red");

        // Broadcast the received notification to all connected clients (including the sender).
        io.emit("notification", data);
        // socket.broadcast.emit("notification", data);
        console.log(data);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;

import express from "express";
import http from "http";
import cors from "cors";
import { Socket } from "socket.io";
import { chatReducer } from "./chatReducer";
const index = require("./routes/index");

const port = process.env.PORT || 4001;

let store = chatReducer();

const app = express();
app.use(cors());
app.use(index);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let interval: NodeJS.Timeout | undefined;

io.on("connection", (socket: Socket) => {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => emitConnectedUsers(socket), 1000);
  socket.on("disconnect", () => {
    clearInterval();
  });
  socket.on("message", function (message: any) {
    console.log("Message: ", message);
  });
  socket.on("user_connect", function (message: any) {
    console.log("User connect: ", message);
    store = chatReducer(store, {
      type: "user_connect",
      payload: {
        user: {
          id: message.id,
          name: message.name,
          status: message.status,
        },
      },
    });
  });
});

const emitConnectedUsers = (socket: Socket) => {
  const response = {
    type: "users_connected",
    users: store.users,
  };
  socket.emit("users_connected", response);
};

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

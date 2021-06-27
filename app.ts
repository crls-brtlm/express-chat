import express from "express";
import http from "http";
import cors from "cors";
import { Socket } from "socket.io";
import { chatReducer } from "./chatReducer";
import { v4 as uuidv4 } from "uuid";
const index = require("./routes/index");
import moment from "moment";

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
  let userId: null | string = null;

  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => emitConnectedUsers(io), 5000);
  socket.on("disconnect", () => {
    if (userId) {
      const disconnectingUser = store.users.find((user) => user.id === userId);
      if (disconnectingUser) {
        io.emit("message", {
          type: "message",
          message: {
            id: uuidv4(),
            content: "user_unjoin",
            sentOn: moment().format(),
            direction: "event",
            author: {
              id: disconnectingUser.id,
              name: disconnectingUser.name,
            },
          },
        });

        store = chatReducer(store, {
          type: "user_disconnect",
          payload: {
            user: disconnectingUser,
          },
        });
      }
    }
  });

  socket.on("message", function (payload: any) {
    socket.broadcast.emit("message", {
      type: "message",
      message: payload.message,
    });
  });

  socket.on("user_connect", function (message: any) {
    userId = message.id;
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
    emitConnectedUsers(io);
    io.emit("message", {
      type: "message",
      message: {
        id: uuidv4(),
        content: "user_join",
        sentOn: moment().format(),
        direction: "event",
        author: {
          id: message.id,
          name: message.name,
        },
      },
    });
  });
});

const emitConnectedUsers = (io: Socket) => {
  const response = {
    type: "users_connected",
    users: store.users,
  };
  io.emit("users_connected", response);
};

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(cors());
app.options("*", cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval();
  });
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

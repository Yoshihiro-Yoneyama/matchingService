const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("./chat/index.ejs");
});

module.exports = router;


/* const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io").listen(server);


router.get("/",(req, res) => {
  const connections = [];
  let jsonbj = [{name:"john", score:345},{name:"paul", score: 678}];

  io.sockets.on("connection", (socket) => {
    connections.push(socket);
    console.log(" %s sockets is connected", connections.length);
    
    socket.on("disconnect", () => {
      connections.splice( connections.indexOf(socket), 1);
    });

    socket.emit("server message", jsonbj);
  });

  res.render("./chat/index.ejs");
}); */



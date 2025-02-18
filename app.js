const express = require('express');
const path =  require('path')
const app = express();
const http = require("http");
const socketio = require('socket.io');


const server = http.createServer(app)
const io = socketio(server);


let users = {};
const markerColors = ["red", "blue", "green", "orange", "purple","yellow"];
io.on('connection', function (socket) {
    console.log("connected");

    socket.on("join", (name) => {
         const randomColor = markerColors[Math.floor(Math.random() * markerColors.length)];
       users[socket.id] = { id: socket.id, name, latitude: 0, longitude: 0, color: randomColor };
        socket.emit("all-users", users);  // Send all existing users to new user
    });


    
  socket.on("send-location", (data) => {
        if (users[socket.id]) {
            users[socket.id] = { ...users[socket.id], ...data };
            io.emit("receive-location", users[socket.id]); // Broadcast to everyone
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnect", socket.id);
        delete users[socket.id]; // Remove from list
    });
    
});
app.set("view engine", "ejs")
app.use(express.static('public'));


app.get("/", function (req, res) {
    res.render("index");
});

server.listen(3000);
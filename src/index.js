const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require('path');
const userService = require('./userService');

// Load static files
app.use("/", express.static(path.join(__dirname, '../public')));

// Listen to connection events
// creates a socket object that can be used
// to listen to events from user and emit messages back.
io.on("connection", (socket) => {
    // get the nickname from query on socket initialization from client
    var nickname = socket.handshake.query.nickname;
    console.log(`${nickname} has connected`);

    // Set and send users message color
    const user = userService.addUser(socket.id, {nickname});

    socket.emit("set message color", user.messageColor);

    // Broadcast the online user list
    broadcastOnlineUsers();

    // Broadcast when a new user enters the chat
    // this broadcasts the message to every other
    // socket except for this socket.
    socket.broadcast.emit("chat message", {
        message: nickname + " has joined the chat. Say hello.",
        user: userService.getServerUser()
    });


    // Emit to current socket that it entered the chat.
    socket.emit("chat message", {
        message: "You have joined the chat room.",
        user: userService.getServerUser()
    });

    // Listen to "chat message" even on this socket
    socket.on("chat message", (msg) => {
        console.log(nickname + " : " + msg);
        // Emit the event to all connected sockets excluding current socket
        socket.broadcast.emit("chat message", {
          message: msg,
          user: userService.getUserBySocketId(socket.id)
        });
    })

    // Listen for the event of the socket getting disconnected
    socket.on("disconnect", () => {
        const user = userService.getUserBySocketId(socket.id);
        console.log(`${user.nickname} has disconnected`);

        // Remove user from the database
        userService.deleteUser(socket.id);

        // Broadcast the online user list
        broadcastOnlineUsers();
    });

    // Listen for event of a user typing
    socket.on("typing", (isTyping) => {
        const user = userService.getUserBySocketId(socket.id);
        socket.broadcast.emit("typing", isTyping, user);
    })
});

// start server by listening to port 3000
http.listen(3000, () => {
    console.log("Listing on: localhost:3000");
});

// Broadcast the online user list
// Excluding the server 
var broadcastOnlineUsers = () => {
    io.emit("online users", userService.getAllUsers().filter((user) => user.nickname !== "Server"));
};

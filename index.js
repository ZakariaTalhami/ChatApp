var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

// Load the index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Listen to connection events
// creates a socket object that can be used
// to listen to events from user and emit messages back.
io.on("connection", (socket) => {
    console.log("A user connected");

    // Broadcast when a new user enters the chat
    // this broadcasts the message to every other
    // socket except for this socket.
    socket.broadcast.emit("chat message", "A new user has joined the chat. Say hello.");

    // Emit to current socket that it entered the chat.
    socket.emit("chat message", "You have joined the chat room.");

    // Listen to "chat message" even on this socket
    socket.on("chat message", (msg) => {
        console.log("Message: " + msg);
        // Emit the event to all connected sockets
        io.emit("chat message", msg);
    })

    // Listen for the event of the socket getting disconnected
    socket.on("disconnect", () => {
        console.log("A user has disconnected");
    });
});

http.listen(3000, () => {
    console.log("Listing on: localhost:3000");
});
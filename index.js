var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

// Mock chat database
var userDatabase = {
    "server": {
        nickname: "Server",
        messageColor: "#f00",
        messageCount: 0
    }
};

// Load the index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Listen to connection events
// creates a socket object that can be used
// to listen to events from user and emit messages back.
io.on("connection", (socket) => {
    console.log("A user connected");

    // get the nickname from query on socket initialization from client
    var nickname = socket.handshake.query.nickname;

    // Set and send users message color
    var messageColor = getRandomColor();
    socket.emit("set message color", messageColor);

    // Add user to database
    userDatabase[socket.id] = {
        nickname: nickname,
        messageColor: messageColor,
        messageCount: 0
    }

    // Broadcast when a new user enters the chat
    // this broadcasts the message to every other
    // socket except for this socket.
    socket.broadcast.emit("chat message", {
        message: nickname + " has joined the chat. Say hello.",
        user: userDatabase.server
    });


    // Emit to current socket that it entered the chat.
    socket.emit("chat message", {
        message: "You have joined the chat room.",
        user: userDatabase.server
    });

    // Listen to "chat message" even on this socket
    socket.on("chat message", (msg) => {
        console.log(nickname + " : " + msg);
        // Emit the event to all connected sockets excluding current socket
        socket.broadcast.emit("chat message", {message: msg, user: userDatabase[socket.id]});
    })

    // Listen for the event of the socket getting disconnected
    socket.on("disconnect", () => {
        console.log("A user has disconnected");
    });

    // Listen for event of a user typing
    socket.on("typing", (isTyping) => {
        socket.broadcast.emit("typing", isTyping, userDatabase[socket.id]);
    })
});

// start server by listening to port 3000
http.listen(3000, () => {
    console.log("Listing on: localhost:3000");
});


// Utils

// Generate a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
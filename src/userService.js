// Mock chat database
const SERVER_ID = 'server';

var userDatabase = {
  [SERVER_ID]: {
      nickname: "Server",
      messageColor: "#f00",
      messageCount: 0
  }
};

function getAllUsers() {
  return Object.values(userDatabase);
}

function addUser(socketId, userDto) {
  userDatabase[socketId] = {
    ...userDto,
    messageColor: getRandomColor(),
    messageCount: 0
  };

  return userDatabase[socketId];
}

function getUserBySocketId(socketId) {
  return userDatabase[socketId] 
}

function getServerUser() {
  return userDatabase[SERVER_ID];
}

 function deleteUser(socketId) {
   delete userDatabase[socketId];
 }

// Generate a random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.getUserBySocketId = getUserBySocketId;
exports.getServerUser = getServerUser;

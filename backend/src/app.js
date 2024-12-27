const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is working');
});

const GameController = require('../controllers/gameController');


const gameController = new GameController(io);

io.on('connection', (socket) => {
  gameController.onPlayerConnect(socket);

  socket.on('createRoute', (data) => {
    console.log(`createRoute data received:`, data);
    const { route, clue } = data;
    gameController.onCreateRoute(socket, route, clue);
  });
  
  

  socket.on('makeGuess', (guess) => {
    gameController.onMakeGuess(socket, guess.guess);
    console.log(`From Make Guess From Backend APP.js 2: ${guess.guess}`)
  });

  socket.on('startTimer', () => {
    gameController.onStartTimer(socket);
  });

  socket.on('disconnect', () => {
    gameController.onPlayerDisconnect(socket);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 3000');
});


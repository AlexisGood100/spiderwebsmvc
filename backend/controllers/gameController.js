// controllers/GameController.js

const game = require('../models/Game');

class GameController {
  constructor(io) {
    this.io = io;
  }

  onPlayerConnect(socket) {
    console.log('Player connected:', socket.id);
    game.addPlayer(socket.id);

    if (Object.keys(game.players).length === 1) {
      socket.emit('login', { playerId: socket.id, role: 'Defender', score: 0 });
    } else if (Object.keys(game.players).length === 2) {
      socket.emit('login', { playerId: socket.id, role: 'Attacker', score: 0 });
    } else {
      socket.emit('login', { playerId: socket.id, role: 'Spectator', score: 0 });
    }
  }

  onCreateRoute(socket, route, clue) {
    if (!route || !clue) {
      console.log('Invalid route or clue:', { route, clue });
      this.io.to(socket.id).emit('error', { message: 'Route or clue is invalid' });
      return;
    }
  
    console.log(`Creating route with clue. Socket ID: ${socket.id}, Route: ${route}, Clue: ${clue}`);
    const opponent = game.createRoute(socket.id, route, clue);
  
    if (opponent && game.players[opponent]?.role === 'Attacker') {
      this.io.to(opponent).emit('newClue', clue);
      console.log(`Clue sent to Attacker (${opponent}): ${clue}`);
    }
  
    game.resetTimer(this.io);
  }
  
  

  onMakeGuess(socket, guess) {
    // Debugging: Ensure arguments are passed correctly
    console.log(`Socket ID: ${socket.id}, Guess: ${guess}`);
  
    if (!guess) {
      console.log('Error: Guess is undefined or empty.');
      this.io.to(socket.id).emit('error', { message: 'Invalid guess' });
      return;
    }
  
    const result = game.checkGuess(socket.id, guess);
    console.log(`Guess Result: ${JSON.stringify(result)}`);
  
    // Send result to the player who guessed
    this.io.to(socket.id).emit('guessResult', { correct: result.correct, guess });
  
    // Find the opponent and send result if they exist
    const opponent = Object.keys(game.players).find(id => id !== socket.id);
    if (opponent) {
      this.io.to(opponent).emit('guessResult', { correct: result.correct, guess });
    } else {
      console.log('No opponent found for player:', socket.id);
    }
  
    // Broadcast updated scores
    this.io.emit('updateScores', game.players);
  }
  

  onStartTimer(socket) {
    if (!game.timerRunning) {
      game.startTimer(this.io);
    }
  }

  onPlayerDisconnect(socket) {
    console.log('Player disconnected:', socket.id);
    game.removePlayer(socket.id);
    this.io.emit('updateScores', game.players);
  }
}

module.exports = GameController;

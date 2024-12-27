// models/Game.js

class Game {
    constructor() {
      this.players = {};
      this.gameData = {};
      this.timerCount = 30;
      this.timerRunning = false;
      this.timer = null;
    }
  
    addPlayer(socketId) {
      if (Object.keys(this.players).length === 0) {
        this.players[socketId] = { role: 'Defender', score: 0 };
      } else if (Object.keys(this.players).length === 1) {
        this.players[socketId] = { role: 'Attacker', score: 0 };
      } else {
        this.players[socketId] = { role: 'Spectator', score: 0 };
      }
    }
  
    removePlayer(socketId) {
      delete this.players[socketId];
      delete this.gameData[socketId];
    }
  
    createRoute(playerId, route, clue) {
      console.log(`Creating route for player: ${playerId}`);
      
      const player = this.players[playerId];
      if (!player || player.role !== 'Defender') {
        console.error(`Player ${playerId} is not a defender or does not exist.`);
        return null;
      }
    
      player.route = route; // Store route in the player object
      player.clue = clue;
    
      console.log(`Route set: ${route}, Clue set: ${clue}`);
      
      // Find the opponent (attacker)
      const opponentId = Object.keys(this.players).find((id) => id !== playerId);
      return opponentId;
    }
    
    checkGuess(socketId, guess) {
      const opponent = Object.keys(this.players).find(id => id !== socketId);
      if (!opponent) {
        console.error('No opponent found for socket:', socketId);
        return { correct: false };
      }
    
      const opponentData = this.players[opponent]; // Corrected from `this.gameData`
      if (!opponentData || !opponentData.route) {
        console.error('Opponent data or route is missing:', opponentData);
        return { correct: false };
      }
    
      console.log(`Checking guess: "${guess}" against route: "${opponentData.route}"`);
    
      if (guess === opponentData.route) {
        console.log('Correct guess!');
        this.players[socketId].score += 10;
        this.players[opponent].score -= 10;
        return { correct: true };
      } else {
        console.log('Incorrect guess.');
        this.players[socketId].score -= 10;
        this.players[opponent].score += 10;
        return { correct: false };
      }
    }
    
    
    startTimer(io) {
      this.timerCount = 30;
      this.timerRunning = true;
      io.emit('timer', this.timerCount);
  
      this.timer = setInterval(() => {
        if (this.timerCount > 0) {
          this.timerCount--;
          io.emit('timer', this.timerCount);
        } else {
          clearInterval(this.timer);
          this.timerRunning = false;
          this.handleTimeout(io);
        }
      }, 1000);
    }
  
    resetTimer(io) {
      if (this.timerRunning) {
        clearInterval(this.timer);
        this.timerRunning = false;
      }
      this.startTimer(io);
    }
  
    handleTimeout(io) {
      const playersArray = Object.keys(this.players);
      playersArray.forEach(playerId => {
        const opponent = playersArray.find(id => id !== playerId);
        if (this.players[playerId].role === 'Attacker') {
          this.players[playerId].score -= 10;
          this.players[opponent].score += 10;
        } else {
          this.players[playerId].score -= 10;
          this.players[opponent].score += 10;
        }
      });
      io.emit('updateScores', this.players);
    }
  }
  
  module.exports = new Game();
  
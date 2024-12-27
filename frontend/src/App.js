import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import SocketService from './services/socketService';

function App() {
  const [route, setRoute] = useState('');
  const [clue, setClue] = useState('');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [role, setRole] = useState('');
  const [isDefender, setIsDefender] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Set up socket event listeners
    SocketService.on('login', (data) => {
      setPlayerId(data.playerId);
      setRole(data.role);
      setScore(data.score);

      if (data.role === 'Defender') {
        setIsDefender(true);
      } else if (data.role === 'Attacker') {
        setIsDefender(false);
      }
    });

    SocketService.on('newClue', (newClue) => {
      console.log('Received new clue:', newClue);
      setMessage(`Clue for route: ${newClue}`);
    });
    
    SocketService.on('guessResult', (result) => {
      console.log(result)
      setMessage(result.correct 
        ? `Correct! The route was: ${result.guess}` 
        : `Incorrect. Your guess was: ${result.guess}`);
    });

    SocketService.on('timer', (timerCount) => {
      setTimer(timerCount);
    });

    SocketService.on('updateScores', (updatedScores) => {
      setScore(updatedScores[playerId]?.score || 0);
    });

    return () => {
      // Clean up socket listeners on component unmount
      SocketService.off('login');
      SocketService.off('newClue');
      SocketService.off('guessResult');
      SocketService.off('timer');
      SocketService.off('updateScores');
    };
  }, [playerId]);

  const handleCreateRoute = () => {
    if (!route || !clue) {
      setMessage('Route and clue cannot be empty');
      return;
    }
    console.log('Emitting createRoute:', { route, clue });
    SocketService.emit('createRoute', { route, clue });
    setMessage(`Route created! Clue: ${clue}`);
  };
  

  const handleMakeGuess = () => {
    if (!guess) {
      setMessage('Guess cannot be empty');
      return;
    }

    SocketService.emit('makeGuess', { guess });
    console.log(guess)
    setMessage('Guess sent!');
  };

  return (
    <Box p={3} boxShadow={3} border={1} borderRadius={2}>
      {isDefender ? (
        <>
          <Typography variant="h6" gutterBottom>Create a Route</Typography>
          <TextField
            label="Enter your route"
            variant="outlined"
            fullWidth
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Enter a clue"
            variant="outlined"
            fullWidth
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRoute}
            fullWidth
          >
            Create Route
          </Button>
        </>
      ) : role === 'Attacker' ? (
        <>
          <Typography variant="h6" gutterBottom>Guess the Route</Typography>
          <TextField
            label="Enter your guess"
            variant="outlined"
            fullWidth
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleMakeGuess}
            fullWidth
          >
            Make Guess
          </Button>
        </>
      ) : (
        <Typography variant="h6">Waiting for another player...</Typography>
      )}
      <Typography variant="body1" mt={2}>{message}</Typography>
      <Box mt={2}>
        <Typography variant="h6">Timer: {timer} seconds</Typography>
        <Typography variant="h6">Your Score: {score}</Typography>
      </Box>
    </Box>
  );
}

export default App;

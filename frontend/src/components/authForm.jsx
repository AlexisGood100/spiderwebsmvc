// components/AuthForm.js
import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import axios from 'axios';

const AuthForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Register user
  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/auth/register', { username, password });
      setErrorMessage('Registration successful, please log in');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  // Log in user
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);  // Store the token in localStorage
      onLogin(response.data.token);  // Pass token to parent component
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box p={3} boxShadow={3} border={1} borderRadius={2}>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        type="password"
      />
      <Button onClick={handleRegister} variant="contained" color="primary" fullWidth>
        Register
      </Button>
      <Button onClick={handleLogin} variant="contained" color="primary" fullWidth>
        Log In
      </Button>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    </Box>
  );
};

export default AuthForm;

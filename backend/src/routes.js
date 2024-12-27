const express = require('express');
const router = express.Router();

// Sample route
router.get('/message', (req, res) => {
  res.json({ message: 'Hello from backend API!' });
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define user schema
const userSchema = new mongoose.Schema({
  usn: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { usn, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ usn });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    const newUser = new User({ usn, password });
    await newUser.save();
    // Redirect to homepage after successful signup
    res.redirect('/home');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usn, password } = req.body;
    // Find user by USN and password
    const user = await User.findOne({ usn, password });
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }
    // Redirect to homepage after successful login
    res.redirect('/home');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Homepage route
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

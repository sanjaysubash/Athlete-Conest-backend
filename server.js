const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;
const NEWS_API_KEY = '45fa951cc5bd4f06ae31ff8a73091f67'; // Replace with your actual API key

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from 'Athlete-Conest' directory
app.use(express.static(path.join(__dirname, '../Athlete-Conest')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/user-login');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Athlete-Conest/HTML/index login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../Athlete-Conest/HTML/loginhtml/user-login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../Athlete-Conest/HTML/home.html'));
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    console.log('User registered:', user); // Log registered user for verification
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in registration:', err.message);
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`Login attempt with email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Incorrect password for email ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`User logged in successfully: ${email}`);
    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error in login:', err.message);
    return res.status(500).send('Server error');
  }
});

// Endpoint to fetch news
app.get('/news', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

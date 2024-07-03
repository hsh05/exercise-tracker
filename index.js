const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    _id: (users.length + 1).toString(),  // Convert to string here
    username
  };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  const usersList = users.map(user => ({
    username: user.username,
    _id: user._id
  }));
  res.json(usersList);
});

// Log an exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  const user = users.find(user => user._id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exercise = {
    userId,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// Get exercise log for a user
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let filteredExercises = exercises.filter(exercise => exercise.userId === userId);

  if (from) {
    const fromDate = new Date(from);
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const log = filteredExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

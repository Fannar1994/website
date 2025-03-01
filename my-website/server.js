// server.js
import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dummy user for testing
const user = {
  username: 'admin',
  password: 'password'
};

app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/off-hire');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    req.session.loggedIn = true;
    req.session.username = username;
    res.redirect('/off-hire');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

app.get('/off-hire', (req, res) => {
  if (req.session.loggedIn) {
    res.render('off-hire', { username: req.session.username });
  } else {
    res.redirect('/login');
  }
});

app.get('/search', (req, res) => {
  const kennitala = req.query.kennitala;
  res.send(`You searched for kennitala: ${kennitala}`);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

https.createServer(options, app).listen(4443, () => {
    console.log('Server running at https://localhost:4443');
  });
  
  

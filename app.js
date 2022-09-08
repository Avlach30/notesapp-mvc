const path = require('path');
const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dbSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const https = require('https');

const noteRoutes = require('./router/notes');
const authRoutes = require('./router/auth');
const clientRoutes = require('./router/client');

const errorController = require('./controller/error');

const User = require('./model/user');

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.g6m6p.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`; 
const sessionStore = new dbSession({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.set('view engine', 'ejs');
app.set('views');

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public', 'css')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(session({
  secret: 'myultimatesecrettext',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}))

app.use(csrfProtection);
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLogedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(error => { 
      next(new Error(error)); 
    })
});

app.use('/auth', authRoutes);
app.use(noteRoutes);
app.use(clientRoutes);

app.use(errorController.error404);

app.get('/500', errorController.error500);

app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).render('error500', {
    titlePage: 'Error Occured', 
    path: '/500',
    isAuthenticated: req.session.isLogedIn
  });
})

const port = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI)
  .then(result => {
    // https.createServer({ key: privateKey, cert: certificate }, app).listen(port, () => {
    //   console.log(`Server connected at http://localhost:${port}`);
    // });
    app.listen(port, () => {
      console.log(`Server connected at http://localhost:${port}`);
    });
  })
  .catch(error => { console.log(error) });

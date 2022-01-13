const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../model/user');

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    titlePage: 'Sign Up Page',
    path: '/signup',
    errorMessage: null,
    oldValue: {
      email: "",
      name: "",
      password: "",
      comfirmPassword: ""
    }
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  const validationError = validationResult(req);

  if (!validationError.isEmpty()) {
    let validationErrorMessage = validationError.array()[0].msg;

    //console.log(validationErrorMessage); 

    return res.status(422).render('auth/signup', {
      titlePage: 'Sign Up Page',
      path: '/signup',

      errorMessage: validationErrorMessage,
      oldValue: {
        name: name,
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      }
    });
  }

  try {
    const hashedPw = await bcryptjs.hash(password, 16);
    const user = new User({
      name: name,
      email: email,
      password: hashedPw
    });
    await user.save();
    res.status(201).redirect('/auth/login');
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    titlePage: 'Log In Page',
    path: '/login',
    errorMessage: null,
    oldValue: {
      name: "",
      password: ""
    }
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const validationError = validationResult(req);

  if (!validationError.isEmpty()) {
    const validationErrorMessage = validationError.array()[0].msg;

    return res.status(422).render('auth/login', {
      titlePage: 'Login Page',
      path: '/login',
      errorMessage: validationErrorMessage,
      oldValue: {
        email: email,
        password: password
      }
    }); 
  }

  try {
    const user = await User.findOne({ email:email });
    if (!user) {
      return res.status(422).render('auth/login', {
        titlePage: 'Login Page',
        path: '/login',
        errorMessage: 'Email not found',
        oldValue: {
          email: email,
          password: password
        }
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (isMatch) { 
      req.session.isLogedIn = true; 
      req.session.user = user; 
      return req.session.save(error => {
        res.status(200).redirect('/notes-list');
      });
    }

    return res.status(422).render('auth/login', {
      titlePage: 'Login Page',
      path: '/login',
      errorMessage: 'Incorrect password',
      oldValue: {
        email: email,
        password: password
      }
    });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }

};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => { //Menghapus data session yang aktif di database
    res.redirect('/auth/login');
  });
};

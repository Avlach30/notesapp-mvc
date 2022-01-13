const express = require('express');
const { body } = require('express-validator')

const User = require('../model/user')
const AuthController = require('../controller/auth');

const router = express.Router();

router.get('/signup', AuthController.getSignup);
router.post(
  '/signup',
  body('name').trim(),
  body('email').trim().isEmail()
    .custom((value, { req }) => {
      return User.findOne({email: value})
        .then(user => {
          if (user) {
            return Promise.reject(`Sorry, account for this email already exist`)
          }
        })
    }),
  body('password', 'Input a password at least 8 characters long').trim().isLength({ min: 8 }),
  body('confirmPassword').trim().custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password must be match!');
    }
    return true;
  }),
  AuthController.postSignup);

router.get('/login', AuthController.getLogin);
router.post(
  '/login', 
  body('email', 'Please, input a valid email').isEmail(),
  AuthController.postLogin);

router.post('/logout', AuthController.postLogout);

module.exports = router;

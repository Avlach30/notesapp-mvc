const express = require('express');
const { body } = require('express-validator');

const NotesController = require('../controller/notes');
const isAuthMiddleware = require('../middleware/is-auth');

const router = express.Router();

router.get('/notes-list', NotesController.getListNotes);

router.get('/add-note', isAuthMiddleware, NotesController.getAddNote);
router.post(
  '/add-note', 
  isAuthMiddleware,
  body('title', 'Input a note title at least 4 characters long').trim().isLength({min: 4}),
  body('content', 'Input a note content at least 10 characters long').trim().isLength({min: 10}),
  NotesController.postAddNote);

router.get('/notes/:noteId', NotesController.getNote);

router.get('/note/:noteId', isAuthMiddleware, NotesController.getUpdateNote);
router.post(
  '/update-note', 
  isAuthMiddleware,
  body('title', 'Input a note title at least 4 characters long').trim().isLength({min: 4}),
  body('content', 'Input a note content at least 10 characters long').trim().isLength({min: 10}),
  NotesController.postUpdateNote);

router.post('/delete-note', isAuthMiddleware, NotesController.postDeleteNote);

module.exports = router;

const { validationResult } = require('express-validator');

const Note = require('../model/notes');
const User = require('../model/user');

exports.getListNotes = async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.status(200).render('client/notes-list.ejs', {
      titlePage: 'List Notes',
      path: '/notes',
      notes: notes,
      isAuthenticated: req.session.isLogedIn || false,
    });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.getAddNote = (req, res, next) => {
  res.render('client/add-note', {
    titlePage: 'Add Note page',
    path: '/add-note',
    isAuthenticated: req.session.isLogedIn,
    errorMessage: null,
    oldValue: {
      title: "",
      content: "",
    }
  });
};

exports.postAddNote = async (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  const validationError = validationResult(req);

  if (!validationError.isEmpty()) {
    let validationErrorMessage = validationError.array()[0].msg;

    return res.status(422).render('client/add-note', {
      titlePage: 'Add Note page',
      path: '/add-note',
      isAuthenticated: req.session.isLogedIn,
      errorMessage: validationError.array()[0].msg,
      oldValue: {
        title: title,
        content: content,
      }
    });
  }

  try {
    const note = new Note({
      title: title,
      content: content,
      creator: req.user._id
    });
    await note.save();
    const user = await User.findById(req.user._id);
    user.notes.push(note);
    await user.save();
    console.log(`Created note success`);
    res.status(201).redirect('/notes-list');
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.getNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findById(noteId).populate('creator');
    res.status(200).render('client/single-note', {
      titlePage: 'Details Note',
      path: '/note',
      note: note
    });
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.getUpdateNote = async (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.status(200).redirect('/notes-list')
  }

  const noteId = req.params.noteId;

  try {
    const note = await Note.findById(noteId);
    res.status(200).render('client/update-note', {
      note: note,
      titlePage: 'Edit Note Page',
      path: '/edit-note',
      isAuthenticated: req.session.isLogedIn,
      errorMessage: null
    })
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.postUpdateNote = async (req, res, next) => {
  const id = req.body.noteId;
  const title = req.body.title;
  const content = req.body.content;

  const validationError = validationResult(req);

  if (!validationError.isEmpty()) {
    let validationErrorMessage = validationError.array()[0].msg;

    return res.status(422).render('client/add-note', {
      titlePage: 'Add Note page',
      path: '/add-note',
      isAuthenticated: req.session.isLogedIn,
      errorMessage: validationError.array()[0].msg,
      oldValue: {
        id: id,
        title: title,
        content: content,
      }
    }); 
  }

  try {
    const note = await Note.findById(id);
    if (note.creator.toString() !== req.user._id.toString()) {
      console.log('Unauthorized!');
      return res.status(401).redirect('/notes-list');
    }

    note.title = title;
    note.content = content;
    note.creator = req.user._id;

    await note.save();
    console.log('Update product successfully');
    res.status(200).redirect('/notes-list');

  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

exports.postDeleteNote = async (req, res, next) => {
  const id = req.body.noteId;

  try {
    const note = await Note.findById(id);
    if (!note) {
      console.log('Note not found!');
      return res.status(404).redirect('/notes-list');
    }
    if (note.creator.toString() !== req.user._id.toString()) {
      console.log('Unauthorized!');
      return res.status(401).redirect('/notes-list');
    }
    const result = await Note.deleteOne({_id: id});
    const user = await User.findById(req.user._id);
    user.notes.pull(id);
    await user.save();

    console.log('Delete product successfully');
    res.status(200).redirect('/notes-list');
  } catch (error) {
    console.log(error);
    error.statusCode = 500;

    return next(error);
  }
};

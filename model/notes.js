const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Note = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  }
}, { timestamps: true });

module.exports = mongoose.model('notes', Note);
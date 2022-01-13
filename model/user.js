const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'notes'
    }
  ]
});

module.exports = mongoose.model('users', User);

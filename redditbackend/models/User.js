let mongoose = require('mongoose');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');

let UserSchema =  new mongoose.Schema({
  username: {
    type: String, 
    lowercase: true, 
    unique: true
  },
  hash: String,
  salt: String,
  categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}]
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(32).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, 'sha512')
    .toString('hex');
};

UserSchema.methods.validPassword = function (password) {
  let hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign(
    {
      _id: this.id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, process.env.REDDIT_BACKEND_SECRET);
};

mongoose.model('User', UserSchema);

const users = require('../models/user.js');
const sessions = require('../sessions.js');
const db = require('../index.js');
const bcrypt = require('promised-bcrypt');

module.exports = {
  signup: (req, res) => {
    let user = req.body; //has username and password
    db.select().from('users').where({username: user.username}).then(userData => {
      if (userData.length) {
        res.send(false);
      } else {
        bcrypt.hash(user.password).then(hash => {
          user.password = hash;
          db('users').insert(user).then(() => {
            req.session.user = user.username;
            res.sendStatus(201);
          });
        });
      }
    });
  },

  signin: (req, res) => {
    let user = req.body; //has username and password;
    db.select().from('users').where({username: user.username}).then(userData => {
      if (userData.length) {
        bcrypt.compare(user.password, userData[0].password).then(isUser => {
          if (isUser) {
            req.session.user = user.username;
            res.sendStatus(201);
          } else {
            res.sendStatus(404); 
          }
        });
      } else {
        res.sendStatus(404); 
      }
    });
  },


  about: (req, res) => {
    let user = req.query.username || req.session.user;
    if (user) {
      db.select('username', 'firstname', 'lastname', 'description', 'picture').from('users').where({username: req.session.user}).then(userData => {
        res.json(userData);
      });
    }
  },

  isLoggedIn: (req, res) => {
    if (req.session.user) {
      res.send(true);
    } else {
      res.send(false);
    }
  },

  logout: (req, res) => {
    if (req.session) {
      req.session.destroy();
    }
    
    res.sendStatus(201);
  }
};
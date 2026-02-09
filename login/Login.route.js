
   const express = require('express');
   const LoginRoute = express.Router();
   const Login = require ("./login.model");

  LoginRoute.route('/login').post((req, res) => {
    const login = new Login(req.body);
    login.save()
        .then(() => {
            res.send("Login Done");
        })
        .catch((err) => {
            res.send(err);
        });
});

module.exports = LoginRoute;















  
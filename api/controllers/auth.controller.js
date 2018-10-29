var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require('../settings/config');
var emailValidator = require('email-validator');


module.exports.login = (req, res) => {
    console.log(req.body);
    if (!(req.body && req.body.username && req.body.password)) {
        var message = !req.body.username ? "Please provide Username" : "Please provide password";
        return res.status(400)
            .json({
                message: message
            });
    }

    User.findOne({
        emailAddress: req.body.username
    }, function (error, user) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else if (user) {
            validateUser(req.body.password, user, res);
        } else {
            res.status(400).json({
                message: "User doesn't exist with this username & password"
            });
        }
    })
}

module.exports.register = (req, res) => {
    if (!(req.body && req.body.emailAddress && req.body.password && req.body.name && req.body.contact)) {
        var message = !req.body.emailAddress ? "Please provide Email Address" :
            !req.body.password ? "Please provide password" :
            !req.body.name ? "Please provide Name" :
            "Please provide contact details";
        return res.status(400)
            .json({
                message: message
            });
    }

    if (!emailValidator.validate(req.body.emailAddress)) {
        return res.status(400)
            .json({
                message: "Email address invalid"
            });
    }

    User.create({
        emailAddress: req.body.emailAddress,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        name: req.body.name,
        contact: req.body.contact
    }, function (error) {
        if (error && error.code === 11000) {
            console.log(error);
            return res.status(400).json({
                message: "Email address already used."
            });
        } else if (!error) {
            return res.sendStatus(200);
        }

        return res.sendStatus(500);
    })
}

// PRIVATE HELPER FUNCTIONS
const validateUser = (plainPassword, dbUser, res) => {
    if (bcrypt.compareSync(plainPassword, dbUser.password)) {
        const user = {
            userId: dbUser._id,
            role: dbUser.role
        };

        var token = jwt.sign(user, config.keys.secret, {
            expiresIn: 3600
        });
        res.status(200).json({
            token: token
        });
    } else {
        res.status(400).json({
            message: "User doesn't exist with this username & password"
        });
    }
};
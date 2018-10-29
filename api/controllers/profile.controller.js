const User = require("mongoose").model('User');
const bcrypt = require('bcrypt');

module.exports.get = (req, res) => {
    User.findById(req.user.userId, "name contact emailAddress", (err, user) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.status(200).json({
            name: user.name,
            emailAddress: user.emailAddress,
            contact: user.contact
        });
    });
};


module.exports.updateProfile = (req, res) => {
    User.findByIdAndUpdate(req.user.userId, {
        name: req.body.name,
        emailAddress: req.body.emailAddress,
        contact: req.body.contact
    }, (error, response) => {
        if (error) {
            console.log(error);

            if (error.code === 11000) {
                return res.status(400).json({ message: "Email address already used."});
            }

           return res.sendStatus(500);
        }

        res.sendStatus(200);
    });
};

module.exports.updateUserPassword = (req, res) => {
    User.findById(req.user.userId, (error, user) => {
        if (error) {
            console.log(error);
            return res.sendStatus(500);
        } else if (user) {
            var prevPassword = req.body.oldPassword;
            if (validateCurrentUserPassword(prevPassword, user.password)) {
                var newPassword = req.body.newPassword,
                    confirmPassword = req.body.confirmPassword;

                if (validatePasswordIsSame(newPassword, user.password)) {
                    return res.sendStatus(200);
                } else if (validateNewPassword(newPassword, confirmPassword)) {
                    updatePassword(req.user.userId, newPassword, res);
                } else {
                    return res.status(400).json({
                        message: "New and confirm password does not match"
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Invalid password for user"
                });
            }
        } else {
            return res.sendStatus(404);
        }
    });
};

// PRIVATE HELPER FUNCTIONS
const validateCurrentUserPassword = (oldPassword, dbPassword) => bcrypt.compareSync(oldPassword, dbPassword);

const validateNewPassword = (newPassword, confirmPassword) => newPassword === confirmPassword;

const validatePasswordIsSame = (newPassword, oldPassword) => bcrypt.compareSync(newPassword, oldPassword);

const updatePassword = (userId, newPassword, res) => {
    User.findByIdAndUpdate(userId, {
        password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
    }, (error, _) => {
        if(error){
            console.log(error);
            return  res.sendStatus(500);
        }

        res.sendStatus(200);
    });
};
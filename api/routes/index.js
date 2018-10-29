var express = require('express');
var router = express.Router();
var cryptoRandomString = require('crypto-random-string');

const DealController = require("../controllers/deals.controller");
const AuthController = require("../controllers/auth.controller");
const UserProfileController = require("../controllers/profile.controller");

const Auth = require('../middlewares/authenticationMiddleware');

// Multer configuration for file uploading
var multer = require('multer');

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    },
    filename: function (req, file, cb) {
        cb(null, cryptoRandomString(10) + new Date().toLocaleString() + (file.mimetype === 'image/jpeg' ? ".jpg" : ".png"))
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

var upload = multer({
    storage: storage,
    fileSize: 1024 * 1024 * 5,
    fileFilter: fileFilter
}).array('cottageImage');
// End for Multer configuration

// API Routes
router
    .route('/deals')
    // .get(Auth.authenticateUser, DealController.dealsGetAll)
    .post(Auth.authenticateUser, upload, DealController.dealsAddNew);

// router
//     .route('/deals/:dealId')
//     .get(Auth.authenticateUser, DealController.dealsGetOne)
//     .put(Auth.authenticateUser, DealController.dealsUpdateOne)
//     .delete(Auth.authenticateUser, DealController.dealsDeleteOne);

router
    .route('/signup')
    .post(AuthController.register);

router
    .route('/login')
    .post(AuthController.login);

router
    .route('/profile')
    .get(UserProfileController.get);

router
    .route('/profile')
    .post(UserProfileController.updateProfile);

router
    .route('/profile/updatePassword')
    .post(UserProfileController.updateUserPassword);

module.exports = router;
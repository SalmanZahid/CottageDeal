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

// DEAL ROUTES
router
    .route('/deals')
    .get(Auth.authenticateUser, DealController.getAll)
    .post(Auth.authenticateUser, upload, DealController.add);

router
    .route('/deals/:dealId')
    .get(Auth.authenticateUser, DealController.getById)
    .put(Auth.authenticateUser, DealController.update)
    .delete(Auth.authenticateUser, DealController.delete);

router
    .route('/deals/:dealId/pause')
    .put(Auth.authenticateUser, DealController.pause);

router
    .route('/deals/:dealId/active')
    .put(Auth.authenticateUser, DealController.active);

router
    .route('/deals/:dealId/inactive')
    .put(Auth.authenticateUser, DealController.inActive);

router
    .route('/deals/:dealId/image/upload')
    .put(Auth.authenticateUser, upload, DealController.upload);

router
    .route('/deals/:dealId/image/:imageId/remove')
    .put(Auth.authenticateUser, DealController.removeImage);


// AUTH Routes
router
    .route('/signup')
    .post(AuthController.register);

router
    .route('/login')
    .post(AuthController.login);

// User profile routes
router
    .route('/me')
    .get(Auth.authenticateUser, UserProfileController.get)
    .put(Auth.authenticateUser, UserProfileController.updateProfile);

router
    .route('/profile/updatePassword')
    .post(UserProfileController.updateUserPassword);

module.exports = router;
var jwt = require('jsonwebtoken');
const config = require('../settings/config');

module.exports.verifyToken = (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token) {
        req.user = undefined;
        next();
    } else {
        jwt.verify(token, config.keys.secret, function (err, decoded) {
            if (err) {
                req.user = undefined;
                next();
            }
            console.log(decoded);
            req.user = decoded;
            next();
        });
    }
}

module.exports.authenticateUser = (req, res, next) => {
    next();

    // UN-COMMENT TO APPLY AUTHORIZATION
    // if (req.user) {
    //     next();
    // } else {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }
}
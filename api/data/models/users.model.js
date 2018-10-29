var mongoose = require('mongoose'),
    constants = require('../../constants');


var userSchema = mongoose.Schema({    
    name: {
        type: String,
        required: 'Name is required',
        maxlength: 50
    },
    emailAddress: {
        type: String,
        required: 'Email Address is required',
        maxlength: 50,
        unique: true,
        required: true
    },
    contact: {
        type: String,
        maxlength: 25,
        required: true
    },
    password: {
        type: String,
        required: 'Password in required'
    },
    role: {
        type: String,
        enum: Object.keys(constants.ROLE),
        default: constants.ROLE.CottageOwner
    },
    status: {
        type: String,
        enum: Object.keys(constants.USER_STATUS),
        default: constants.USER_STATUS.Active
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

mongoose.model('User', userSchema);
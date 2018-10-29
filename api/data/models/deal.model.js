var mongoose = require('mongoose');
var constants = require('../../constants');

var dealSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: 'Please provide description'
    },
    currency: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    photos: [String],
    availability: {
        type: [Date],
        required: true
    },
    tags: [String],
    location: {
        address: String,
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users'
    },
    status: {
        type: String,
        enum: Object.keys(constants.DEAL_STATUS),
        default: constants.DEAL_STATUS.Active
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date
    }
});

mongoose.model('Deal', dealSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var chatModel = Schema({
    chatId: {
        type: Schema.ObjectId,
        auto: true
    },
    userId: {
        type: Schema.ObjectId,
        ref: "users",
        required: true
    },
    guestEmail: {
        type: String,
        required: true
    },
    messages: [{
        messageId: {
            type: ObjectId,
            auto: true
        },
        message: String,
        sentByGuest: Boolean,
        sentDateTime: {
            type: Date,
            default: new Date().getUTCDate()
        }
    }],
    createdAt: {
        type: Date,
        default: new Date().getUTCDate()
    }
});

mongoose.model("Chats", chatModel);

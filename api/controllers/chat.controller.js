const Chat = require('mongoose').model("Chats");

/**
 * @param req Request
 * @param res Response
 */
module.exports.get = (req, res) => {

    if (req.body && req.params.chatId) {
        return res.status(400).json({
            message: "Please provide message text"
        });
    }

    const chatId = req.params.chatId;

    Chat.findOne({
            'chatId': chatId
        }, "messages")
        .exec()
        .then(messages => {
            res.status(200).json(messages);
        })
        .catch(error => {
            res.status(400).json({
                message: error.message
            })
        });
};

/**
 * @param req Request
 * @param res Response
 */
module.exports.newMessage = (req, res) => {

    if (req.body && req.body.message) {
        return res.status(400).json({
            message: "Please provide message text"
        });
    }

    if (req.body && req.body.guest) {
        return res.status(400).json({
            message: "Guest type is required"
        });
    }

    const chatId = req.params.chatId;

    const message = {
        message: req.body.message,
        sentByGuest: req.body.guest,
    };

    Chat.updateOne({
        'chatId': chatId
    }, {
        $push: {
            messages: message
        }
    }, (error, _) => {
        if (error) {
            return res.status(400).json({
                message: error.message
            });
        };

        res.sendStatus(200);
    });

};

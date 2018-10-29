var Deal = require('mongoose').model("Deal");
var AWS = require('aws-sdk');

var constants = require('../constants');

const BUCKET_NAME = "cottage-deal-images";

let s3bucket = new AWS.S3({
    accessKeyId: "AKIAIJXU5N53UN27O3OQ",
    secretAccessKey: "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",
    Bucket: BUCKET_NAME
});

// TODO Add and Update deals with File Uploading

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
module.exports.dealsGetAll = (req, res) => {
    var offset = 0;
    var count = 20;

    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    Deal
        .find({
            user: req.user.userId
        })
        .skip(offset)
        .limit(count)
        .exec(function (err, deals) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }

            res.json(deals);
        });
}

module.exports.dealGetById = (req, res) => {
    const dealId = req.params.dealId;

    Deal.findById(dealId, function (err, deal) {
        if (err) {
            console.log(err.message);
            return res.sendStatus(500);
        } else if (deal.user === req.user.userId) {
            return res.status(400).json({
                message: "You are not authorized to view this deal."
            })
        } else if (deal) {
            return res.json(deal)
        }

        res.sendStatus(404);

    });
}

module.exports.dealsAddNew = async (req, res) => {
    const file = req.files;
    var fileLocations = [];
    if (req.files) {
        await s3bucket.createBucket(function () {

            var ResponseData = [];

            file.map((item) => {
                var params = {
                    Bucket: BUCKET_NAME,
                    Key: item.originalname,
                    Body: item.buffer,
                    ACL: 'public-read'
                };
                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            "message": err
                        });
                    } else {
                        ResponseData.push(data);
                        if (ResponseData.length == file.length) {
                            ResponseData.forEach(
                                x => fileLocations.push(x["Location"])
                            );
                            createDeal(req, res, fileLocations);
                        }
                    }
                });
            });
        });
    } else {
        await createDeal(req, res, fileLocations);
    }
}

module.exports.dealsUpdateOne = (req, res) => {
    Deal.findByIdAndUpdate(req.params.hotelId, {
        $set: {
            name: req.body.name,
            description: req.body.description,
            stars: parseInt(req.body.stars, 10),
            currency: parseInt(req.body.currency, 10),
            services: splitArray(req.body.services),
            location: {
                address: req.body.address,
                coordinates: [
                    parseFloat(req.body.lat),
                    parseFloat(req.body.lng)
                ]
            }
        }
    }, function (err, hotel) {
        if (err) {
            console.log("Error Updating hotel");
            res
                .status(500)
                .json(err);
        } else if (!hotel) {
            console.log("Deal Not Found");
            res
                .status(404)
                .json({
                    message: "Id doesnot exists"
                });
        } else {
            console.log("Deal has been created succesfully");
            res
                .status(200)
                .json(hotel);
        }
    });
}

module.exports.dealsDeleteOne = (req, res) => {
    if (req.params && req.params.dealId) {
        Deal.findByIdAndRemove(req.params.dealId,
            function (err, hotel) {
                if (err) {
                    console.log("Error Deleting Deal With Id", req.params.dealId);
                    res
                        .status(500)
                        .json(err);
                } else {
                    console.log("Deal has been deleted succesfully with Id: " + req.params.dealId);
                    res.sendStatus(200);
                }
            });
    }
}

module.exports.pause = (req, res) => {
    updateDealStatus(req, res, constants.DEAL_STATUS.Paused);
}

module.exports.active = (req, res) => {
    updateDealStatus(req, res, constants.DEAL_STATUS.Active);
}

// HELPER FUNCTIONS
const createDeal = (req, res, fileLocations) => {
    Deal.create({
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price, 10),
        discount: parseInt(req.body.discount, 10),
        currency: parseInt(req.body.currency, 10),
        photos: fileLocations,
        tags: req.body.tags,
        services: splitArray(req.body.services),
        location: {
            address: req.body.address,
            coordinates: [
                parseFloat(req.body.lat),
                parseFloat(req.body.lng)
            ]
        },
        user: req.user.userId,
    }, function (err, _) {
        if (err) {
            console.log("Error creating deal");
            res
                .status(400)
                .json(err);
        } else {
            console.log("Deal has been added succesfully");
            res
                .status(200)
                .json({
                    message: "Successfully created"
                });
        }
    });
}

const updateDealStatus = (req, res, status) => {
    if (req.params && req.params.dealId) {
        Deal.findById(req.params.dealId,
            function (err, deal) {
                if (err) {
                    // LOG ERROR
                    console.group("Internal Server Error");
                    console.log("fetching dealId: " + req.params.dealId);
                    console.log("Error: " + err);
                    console.groupEnd();

                    res
                        .status(500)
                        .json(err);
                } else {
                    if (req.user.role === constants.ROLE.SuperAdmin || deal.user === req.user.userId) {
                        Deal.findByIdAndUpdate(req.user.dealId, {
                                status: status
                            })
                            .then(response => {

                            })
                            .catch(error => {

                            });
                    }

                    console.log("Invalid rights to modify deal by user:" + req.user.userId + " for dealId: " + req.params.dealId);
                    res.sendStatus(405);
                }
            });
    }
};
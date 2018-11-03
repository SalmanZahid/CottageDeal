var Deal = require('mongoose').model("Deal");
var AWS = require('aws-sdk');
var randomString = require('crypto-random-string');

var constants = require('../constants');

const BUCKET_NAME = "cottage-deal-images";

// LOAD AWS Configuration
AWS.config.loadFromPath("./api/settings/aws/config.json");

let s3bucket = new AWS.S3();

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
module.exports.getAll = (req, res) => {
    var offset = 0;
    var count = 20;

    console.log(__dirname);

    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    Deal
        .find({
            user: req.user.userId
        }, {
            "images.imageKey": 0,
            "images._id": 0,
            "user": 0,
            "__v": 0,
            "_id": 0
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

module.exports.getById = (req, res) => {
    const dealId = req.params.dealId;
    Deal.findOne({
        dealId: dealId,
        user: req.user.userId
    }, {
        "images.imageKey": 0,
        "images._id": 0,
        "user": 0,
        "__v": 0,
        "_id": 0
    }, function (err, deal) {
        if (err) {
            return res.sendStatus(500);
        } else if (deal) {
            return res.json(deal)
        }

        res.sendStatus(404);
    });
}

module.exports.add = async (req, res) => {
    await uploadImages(req, res, createDeal);
}

module.exports.update = (req, res) => {
    Deal.findOneAndUpdate({
        dealId: req.params.dealId
    }, {
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price, 10),
        discount: parseInt(req.body.discount, 10),
        currency: req.body.currency,
        images: fileLocations,
        tags: req.body.tags,
        location: {
            address: req.body.address,
            coordinates: [
                parseFloat(req.body.lat),
                parseFloat(req.body.lng)
            ]
        }
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

module.exports.delete = (req, res) => {
    if (req.params && req.params.dealId) {
        Deal.findOneAndDelete({
                dealId: req.params.dealId
            },
            function (err, _) {
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
    } else {
        res.sendStatus(404);
    }
}

module.exports.pause = (req, res) => {
    updateDealStatus(req, res, constants.DEAL_STATUS.Paused);
}

module.exports.active = (req, res) => {
    updateDealStatus(req, res, constants.DEAL_STATUS.Active);
}

module.exports.inActive = (req, res) => {
    updateDealStatus(req, res, constants.DEAL_STATUS.InActive);
}

module.exports.upload = async (req, res) => {
    const callback = (req, res, fileLocations) => {

        if (fileLocations.length <= 0) {
            return res.sendStatus(200);
        }

        Deal.findOneAndUpdate({
                dealId: req.params.dealId
            }, {
                $push: {
                    images: fileLocations
                }
            })
            .exec()
            .then(_ => {
                console.log("Success");
                res.sendStatus(200);
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    message: error.message
                });
            });
    }

    Deal.findOne({
            dealId: req.params.dealId
        })
        .exec()
        .then(_ => {
            uploadImages(req, res, callback);
        })
        .catch(err => {
            res.sendStatus(404);
        });
}


// HELPER FUNCTIONS
const createDeal = (req, res, fileLocations) => {
    console.log("Creating Deal")
    Deal.create({
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price, 10),
        discount: parseInt(req.body.discount, 10),
        currency: req.body.currency,
        images: fileLocations,
        tags: req.body.tags,
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
            console.log("Error creating deal " + err);
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

// Update deal status
const updateDealStatus = (req, res, status) => {
    if (req.params && req.params.dealId) {
        Deal.findOne({
                dealId: req.params.dealId
            },
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
                    if (!deal) {
                        res.sendStatus(404);
                    } else if (req.user.role === constants.ROLE.SuperAdmin || deal.user == req.user.userId) {
                        console.log(deal.dealId);
                        Deal.findOneAndUpdate({
                                dealId: deal.dealId
                            }, {
                                status: status
                            })
                            .then(response => {
                                console.log("Updated");
                                return res.sendStatus(200);
                            })
                            .catch(error => {
                                return res.status(500).json(error);
                            });
                    } else {
                        console.log("Invalid rights to modify deal " + req.params.dealId + " by user: " + req.user.userId);
                        res.sendStatus(405);
                    }
                }
            });
    }
};

// Upload images to Amazon S3
const uploadImages = async (req, res, callback) => {
    const file = req.files;
    var fileLocations = [];

    if (req.files) {
        console.log("In uploading")
        await s3bucket.createBucket(function () {
            var ResponseData = [];
            file.map((item) => {

                if (item.size <= 0) {
                    return;
                }

                const key = randomString(10) + "." + item.originalname.split('.').pop();

                var params = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: item.buffer,
                    ACL: 'public-read'
                };

                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            "message": err
                        });
                    } else {
                        ResponseData.push(data);
                        if (ResponseData.length == file.length) {
                            ResponseData.forEach(
                                x => fileLocations.push({
                                    imageUrl: x["Location"],
                                    imageKey: key
                                })
                            );

                            return callback(req, res, fileLocations);
                        }
                    }
                });
            });

            if (ResponseData.length == file.length) {
                return callback(req, res, fileLocations);
            }
        });
    } else {
        callback(req, res, fileLocations);
    }
};

const deleteImage = async (imageKey, callback) => {
    var params = {
        Bucket: BUCKET_NAME,
        Key: imageKey
    };

    await s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null);
        }
    });
};

module.exports.removeImage = async (req, res) => {
    Deal.findOne({
        dealId: req.params.dealId,
        user: req.user.userId
    }, (error, deal) => {

        if (!deal) {
            return res.sendStatus(404);
        }

        var image = deal.images.find(image => image.imageId == req.params.imageId);

        if (!image) {
            return res.status(404).json({
                message: "Image doesn't exist with this id"
            });
        }

        var onFileRemoveComplete = function () {
            deal.images = deal.images.filter(el => {
                return el.imageId != image.imageId
            });
            deal.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).json({
                    success: "Successfully removed image."
                });
            });
        }

        var params = {
            Bucket: BUCKET_NAME,
            Key: image['imageKey']
        };

        s3bucket.deleteObject(params, function (err, _) {
            if (err) {
                return next(err);
            }
            onFileRemoveComplete();
        });
    });
}
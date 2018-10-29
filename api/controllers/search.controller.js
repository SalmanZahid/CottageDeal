var Deal = require('mongoose').mongo("Deal");

const runGeoQuery = (req, res) => {
    var latitude = parseFloat(req.query.lat);
    var longitude = parseFloat(req.query.lng);

    var point = {
        type: 'Point',
        cordinates: [longitude, latitude]
    };

    Deal
        .geoSearch(point, function (error, results, stats) {
            res.json(results);
        });
};

/**
 * 
 * @param {String} input 
 */
const splitArray = input => {
    var output;

    if (input && input.length > 0) {
        output = input.split(";");
    }

    return output;
}


/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
module.exports.dealsGetAll = (req, res) => {
    var offset = 0;
    var count = 5;

    if (req.query && req.query.lat && req.query.lng) {
        runGeoQuery(req, res);
        return;
    }

    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }

    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    Deal
        .find()
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

module.exports.dealsGetOne = (req, res) => {
    const hotelId = req.params.hotelId;

    Deal.findById(hotelId, function (err, hotel) {
        if (err) {
            console.log(err.message);
            return res.sendStatus(500);
        } else if (hotel) {
            return res.json(hotel)
        }

        res.sendStatus(404);

    });
}

module.exports.dealsAddNew = (req, res) => {
    Deal.create({
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
    }, function (err, hotel) {
        if (err) {
            console.log("Error creating hotel");
            res
                .status(400)
                .json(err);
        } else {
            console.log("Deal has been created succesfully");
            res
                .status(201)
                .json(hotel);
        }
    })
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
    if (req.params && req.params.hotelId) {
        console.log("Delete");
        Deal.findByIdAndRemove(req.params.hotelId,
            function (err, hotel) {
                if (err) {
                    console.log("Error Deleting Deal With Id", req.params.hotelId);
                    res
                        .status(500)
                        .json(err);
                } else {
                    console.log("Deal has been created succesfully");
                    res
                        .status(200)
                        .json(hotel);
                }
            });
    }
}
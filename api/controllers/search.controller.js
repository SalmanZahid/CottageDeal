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
    const dealId = req.params.dealId;

    Deal.findById(dealId, function (err, deal) {
        if (err) {
            console.log(err.message);
            return res.sendStatus(500);
        } else if (deal) {
            return res.json(deal)
        }

        res.sendStatus(404);

    });
}
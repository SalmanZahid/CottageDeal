require('./api/data/db');
var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var cors = require('cors');

var routes = require('./api/routes');
var Auth = require('./api/middlewares/authenticationMiddleware');

app.use('/api', Auth.verifyToken);


// SET STATIC FOLDER BEFORE ROUTING
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/fonts', express.static(__dirname + '/fonts'));

// create application/x-www-form-urlencoded parser
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(cors());

// Define routes
app.use('/api', routes);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SET AND LISTEN TO PORT
app.set('port', 3000);
app.listen(app.get('port'));
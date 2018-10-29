var mongoose = require('mongoose');
var connectionString = "mongodb://localhost:27017/cottages";

mongoose.connect(connectionString);

// CONNECTED EVENT
mongoose.connection.on("connected", function () {
    console.log("Mongoose connected to " + connectionString);
});

// DISCONNECTED EVENT
mongoose.connection.on("disconnected", function () {
    console.log("Mongoose disconnected");
});

// ERROR EVENT
mongoose.connection.on("error", function (err) {
    console.log("Mongoose connection error " + err);
});

process.on('SIGINT', function () {
    console.log("CALL FROM SIGINT");
    mongoose.connection.close(function () {
        console.log("Mongoose connection has been closed from APP terminal");
        process.exit(0);
    });
});

process.on('SIGTERM', function () {
    console.log("CALL FROM SIGTERM");
    mongoose.connection.close(function () {
        console.log("Mongoose connection has been closed");
        process.exit(0);
    });
});

process.once('SIGUSR2', function () {
    console.log("CALL FROM NODEMON");
    mongoose.connection.close(function () {
        console.log("Mongoose connection has been closed from NODEMON");
        process.kill(process.pid, 'SIGUSR2');
    });
});

// IMPORT MODELS 
require('./models/deal.model');
require('./models/users.model');
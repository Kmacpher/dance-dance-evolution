'use strict';
var chalk = require('chalk');

// Requires in ./db/index.js -- which returns a promise that represents
// mongoose establishing a connection to a MongoDB database.
var startDb = require('./db');

// Create a node server instance! cOoL!
var server = require('http').createServer();

var createApplication = function () {
	console.log("Creating application");
    var app = require('./app');
    console.log("Attaching express application");
    server.on('request', app); // Attach the Express application.
    console.log("Attaching socketio");
    require('./io')(server);   // Attach socket.io.
};

var startServer = function () {

    console.log("Starting server");
    var PORT = process.env.PORT || 1337;

    server.listen(PORT, function () {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

startDb.then(createApplication).then(startServer).catch(function (err) {
    console.error(chalk.red(err.stack));
    process.kill(1);
});

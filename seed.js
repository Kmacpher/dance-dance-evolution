/*

This seed file uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in the environment files:
--- server/env/*

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Song = Promise.promisifyAll(mongoose.model('Song'));
var StepChart = Promise.promisifyAll(mongoose.model('StepChart'));
var fs = require('fs');
var SMparse = require('./server/sm-parser').readSM;

var seedUsers = function() {

    var users = [{
        email: 'testing@fsa.com',
        password: 'password'
    }, {
        email: 'obama@gmail.com',
        password: 'potus'
    }];

    return User.createAsync(users);

};



function createStepCharts(parsedSM) {
    var promises = [];
    for (var difficulty in parsedSM.charts) {
        promises.push(StepChart.create({
            title: parsedSM.metadata.TITLE,
            difficulty: difficulty,
            chart: parsedSM.charts[difficulty].stepchart
        }));
    }

    return Promise.all(promises)
        .then(function(charts) {

            var idObj = {};
            charts.forEach(function(chart) {
                idObj[chart.difficulty] = chart._id;
            });

            var chartsObj = {};

            for(var key in idObj) {
              chartsObj[key] = {
                stepChart: idObj[key],
                level: parsedSM.charts[key].level,
                grooveRadar: parsedSM.charts[key].grooveRadar
              };
            }

            

            return Song.create({
                title: parsedSM.metadata.TITLE,
                artist: parsedSM.metadata.ARTIST,
                bpms: parsedSM.metadata.BPMS,
                displayBpm: parsedSM.metadata.DISPLAYBPM,
                offset: parsedSM.metadata.OFFSET,
                music: parsedSM.metadata.MUSIC,
                Charts: chartsObj
            });

        });


}

var seedSongs = function(cb) {

    var smFiles = fs.readdirSync('./browser/sm/');
    smFiles = smFiles.filter(function (song) {
        return song !== '.DS_Store';
    });

    smFiles = smFiles.map(function(smFile) {
        var data = SMparse(smFile);
        return createStepCharts(data);
    });

    // console.log(smFiles);
    return Promise.all(smFiles);

};

connectToDb.then(function() {


    seedSongs()
    .then( function () {
        console.log(chalk.green('Seeding songs was super-effective!'));
        process.kill(0);
    });



    // User.findAsync({}).then(function(users) {
    //     if (users.length === 0) {
    //         return seedUsers();
    //     } else {
    //         console.log(chalk.magenta('Seems to already be user data, exiting!'));
    //         process.kill(0);
    //     }
    // }).then(function() {
    //     console.log(chalk.green('Seed successful!'));
    //     process.kill(0);
    // }).catch(function(err) {
    //     console.error(err);
    //     process.kill(1);
    // });

});

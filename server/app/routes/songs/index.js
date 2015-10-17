var router = require('express').Router();
// var sm = require('mongoose').model('Song');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var readSM = require('../../../sm-parser').readSM;
var buildSM = require('../../../sm-builder').buildSM;
var mongoose = require('mongoose');
var Song = mongoose.model('Song');
var StepChart = mongoose.model('StepChart');


function createStepCharts(parsedSM) {
    var promises = [];
    console.log('parsed!: ',parsedSM);
    for (var difficulty in parsedSM.charts) {
        console.log('chart title', parsedSM.metadata.TITLE);
        promises.push(StepChart.create({
            title: parsedSM.metadata.TITLE,
            difficulty: difficulty,
            chart: parsedSM.charts[difficulty].stepchart
        }));
    }

    Promise.all(promises)
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
              }
            }

            return Song.create({
                title: parsedSM.metadata.TITLE,
                artist: parsedSM.metadata.ARTIST,
                bpms: parsedSM.metadata.BPMS,
                stops: parsedSM.metadata.STOPS,
                displayBpm: parsedSM.metadata.DISPLAYBPM,
                offset: parsedSM.metadata.OFFSET,
                music: parsedSM.metadata.MUSIC,
                sampleStart: parsedSM.metadata.SAMPLESTART,
                sampleLength: parsedSM.metadata.SAMPLELENGTH,
                banner: parsedSM.metadata.BANNER,
                background: parsedSM.metadata.BACKGROUND,
                Charts: chartsObj
            });
        }).then(function(song) {
            console.log('song:',song);
        console.log('song created!');
      }).then(null, function(err) {
        console.error('You had an error!', err);
      });


}


router.get('/', function(req, res, next) {
    Song.find({}).then(function(songs) {
        res.send(songs);
    }).then(null, next);
});

router.get('/:id', function(req, res, next) {
    Song.findById(req.params.id).populate('StepChart')
    .then(function(song) {
        res.send(song);
    }).then(null, next);
});

router.post('/upload', multipartMiddleware, function(req, res, next) {


    fs.readFile(req.files.sm.path, function(err, data) {
        if (err) {
            console.error('error in readFile ', err);
            next(err);
        }
        var newPath = process.cwd() + "/browser/sm/" + req.files.sm.originalFilename;
        fs.writeFile(newPath, data, function(error) {
            if (error) {
            console.error('error in writeFile ', error);
            next(error);
            }
            console.log('file should be written');
            createStepCharts(readSM(req.files.sm.originalFilename));

            //delete temp file
            fs.unlink('req.files.sm.path', function () {
                console.log('temp sm file has been deleted');
                fs.unlink('req.files.song.path', function() {
                  console.log('temp song deleted');
                });
            });
        });
    });


    fs.readFile(req.files.song.path, function(err, data) {
        if (err) {
            console.error('error in readFile ', err);
            next(err);
        }
        var newPath = process.cwd() + "/browser/audio/" + req.files.song.originalFilename;
        fs.writeFile(newPath, data, function(error) {
            if (error) {
            console.error('error in writeFile ', error);
            next(error);
            }
            console.log('file should be written');

            //delete temp file
            fs.unlink('req.files.song.path', function () {
                console.log('temp song file has been deleted');
                fs.unlink('req.files.song.path', function() {
                  console.log('temp song deleted');
                });
            });
        });
    });

    fs.readFile(req.files.bg.path, function(err, data) {
        if (err) {
            console.error('error in readFile ', err);
            next(err);
        }
        var newPath = process.cwd() + "/browser/img/background/" + req.files.bg.originalFilename;
        fs.writeFile(newPath, data, function(error) {
            if (error) {
            console.error('error in writeFile ', error);
            next(error);
            }
            console.log('file should be written');

            //delete temp file
            fs.unlink('req.files.bg.path', function () {
                console.log('temp bg file has been deleted');
                fs.unlink('req.files.bg.path', function() {
                  console.log('temp bg deleted');
                });
            });
        });
    });


});

router.post('/autogen', function(req, res, next) {
    buildSM(req.body);
    //console.log(req.body);
})





module.exports = router;

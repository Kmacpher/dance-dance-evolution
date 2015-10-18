/* global Tone */

app.config(function($stateProvider) {
    $stateProvider.state('animation', {
        url: '/animation/:songId/:chosenLevel/',
        templateUrl: 'js/animation/animation.html',
        resolve: {
            song: function(SongFactory, $stateParams) {
                return SongFactory.getSongById($stateParams.songId);
            }
        },
        params: {
            mod1: 1
        },
        controller: function($scope, ArrowFactory, ToneFactory, song, SongFactory, $stateParams, ScoreFactory, $state, $timeout, WorkerFactory, FreqOpacAnimFactory) {

            $scope.numBars = [];
            var bars = window.innerWidth / 20;
            for(var i = 0; i < bars; i++) {
              $scope.numBars.push(i);
            }

            $scope.ready = false;
            var currentSong = song;
            //showCombo is set true only when there is a combo to show, as we don't want to show 0 combos
            $scope.showCombo1 = false;

            const TIMING_WINDOW = ScoreFactory.TIMINGWINDOWS.Great;

            currentSong.offset = parseFloat(currentSong.offset);

            var difficulty = $stateParams.chosenLevel;
            var chartId = currentSong.Charts[difficulty].stepChart;
            var mainBPM = currentSong.bpms[0].bpm;
            //idea for cleanup of config/currentsong ES6 syntax thingie
            // var {Charts, bpms} = currentSong;
            var config = {
                TIMING_WINDOW: TIMING_WINDOW,
                ARROW_TIME: ((ArrowFactory.SPEED_1X/$stateParams.mod1) * 4 / mainBPM), //Factor for timing how fast arrow takes (this number / bpm for seconds)
                BEAT_TIME: 1/(mainBPM/60/4)/4, //Number of seconds per measure
                SPEED_MOD: $stateParams.mod1,
                animationOffset: 0
            };
            config.BEAT_VH = 100/(((ArrowFactory.SPEED_1X/$stateParams.mod1) * 4)/mainBPM) * config.BEAT_TIME;

            var arrowWorker, tone;


            //This is only so the user can read the loading screen and have heightened anticipation!
            setTimeout(function () {
                SongFactory.getChartById(chartId)
                .then(function(chartId) {
                    console.log('have chartId, running prepsong');
                    prepSong(chartId);
                });
            }, 2000);


            function prepSong(stepChart) {
                tone = new ToneFactory("/audio/"+currentSong.music, mainBPM, currentSong.offset, config);
                //to set the stepChart on the player object
                ScoreFactory.setStepChart(stepChart, 1);
                //when prepping song, score factory will get the total number of arrows in the stepchart
                //for score calculation purposes
                ScoreFactory.setTotalArrows(1);

                // sets up arrow for animating
                var arrows = ArrowFactory.makeArrows(stepChart.chart, mainBPM, config, currentSong, 1);

                // gives arrowWorker first chart
                arrowWorker = new WorkerFactory('/js/animation/animationWorker.js', 1);
                arrowWorker.prepStepChart(currentSong, config, mainBPM, stepChart.chart);

                arrowWorker.handleMessages($scope, arrows, tone, 1, $stateParams.songId);

                Tone.Buffer.onload = runInit;

            };

            function runInit () {
                ArrowFactory.resumeTimeline();
                tone.start();
                var $gameplayContainer = $('#gameplayAnimationContainer');
                FreqOpacAnimFactory.init($scope.numBars, $gameplayContainer, tone);
                var startTime = Date.now() - currentSong.offset*1000;
                arrowWorker.worker.postMessage({
                  type: 'startTime',
                  startTime
                });
                arrowWorker.addListener(tone, startTime);

                // videofactory please Jay, put into models
                var videoOffset = (config.ARROW_TIME + Number(currentSong.offset))*1000;

                if (currentSong.title === 'Caramelldansen') {
                    $scope.videoSrc = '/video/Caramelldansen.mp4';
                    videoOffset += 1000;
                }
                else if (currentSong.title === 'Sandstorm') {
                    $scope.videoSrc = '/video/Darude - Sandstorm.mp4';
                }
                else {

                    $scope.imageSrc = `/img/background/${song.background}`;
                }
                setTimeout(function() {
                    var video = document.getElementById('bg-video');
                    video.play();
                }, videoOffset);

                $scope.ready = true;
                $scope.$digest();
            }
        }
    });
});

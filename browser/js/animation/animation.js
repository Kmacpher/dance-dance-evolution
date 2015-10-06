app.config(function($stateProvider) {
    $stateProvider.state('animation', {
        url: '/animation',
        templateUrl: 'js/animation/animation.html',
        resolve: {
            songs: function(SongFactory) {
                return SongFactory.getSongs();
            }
        },
        controller: function($scope, ArrowFactory, ToneFactory, songs, SongFactory) {

            $scope.songs = songs;
            console.log(songs);
            var currentSong = songs[4];
            console.log(currentSong);
            var difficulty = "Hard";
            var chartId = currentSong.Charts[difficulty].stepChart;
            console.log(chartId);
            // var mainBPM = Number(currentSong.bpms.match(/=(\d+)/)[1]);
            var mainBPM = 136.34;



            SongFactory.getChartById(chartId)
                .then(function(chart) {

                    console.log(chart);
   

            // var $body = $(document.body)

                var syncOffset = currentSong.offset;
                console.log('syncOffset:',syncOffset);  
                var tone = new ToneFactory("/audio/"+currentSong.music, mainBPM, (130 * 4)/mainBPM + Number(syncOffset), syncOffset);
                // 240/bpm - offset

            // ArrowFactory.makeTimeline();
            // testChart.forEach(function(measure, chIndex) {
            //     var notes = measure.length;
            //     measure.forEach(function(note, mIndex) {
            //       note.forEach(function(maybeArrow, index) {
            //           if (maybeArrow !== '0') {
            //             //maybe we can make the arrows and let them go via timeline events?
            //               var dir = ArrowFactory.indexToDir(index);
            //               var arrow = new ArrowFactory(dir, 1);
            //               arrow.animate(191.94, chIndex, mIndex, notes);
            //               tone.transport.setTimeline(function(time) {
            //                 $body.on(`keydown.${chIndex}${mIndex}${index}`, function(e) {
            //                   if(e.keyCode == ArrowFactory.ARROW_KEYS[dir]) {
            //                     listener(arrow)
            //                   }
            //                 });
            //               }, `${chIndex}m + ${notes}n * ${mIndex} + 0 * 16n`);
            //               tone.transport.setTimeline(function(time) {
            //                 $body.off(`keydown.${chIndex}${mIndex}${index}`)
            //               }, `${chIndex}m + ${notes}n * ${mIndex} + 2 * 16n`);
            //           }
            //       })
            //     })
            // });

            var dirToKeyCode = {
              left: '37',
              down: '40',
              up: '38',
              right: '39'
            };

            var keyCodeToDir = {
              '37': 'left',
              '40': 'down',
              '38': 'up',
              '39': 'right'
            };
            var TIMING_WINDOW = 0.15;
            var startTime = 0;
            ArrowFactory.makeTimeline();
            var charts = tone.timeCharts(chart.chart);
            console.log(charts);
            var addListener = function () {
                console.log('added listener to arows')
                document.body.addEventListener('keydown', function (e) {
                    if (keyCodeToDir[e.which]) e.preventDefault();
                    else return;
                    var timeStamp = (Date.now() - startTime) / 1000;
                    var thisChart = charts[keyCodeToDir[e.which]];
                    console.log(keyCodeToDir[e.which], "pressed on", timeStamp)
                    var pointer = thisChart.length - 1;
                    var lastOne = thisChart[thisChart.length - 1];
                    while (lastOne.time < timeStamp - TIMING_WINDOW) {
                        thisChart.pop();
                        lastOne = thisChart[thisChart.length - 1];
                    }
                    var diff = Math.abs(lastOne.time - timeStamp);
                    console.log(`diff: ${diff}`);
                    if (diff < TIMING_WINDOW) {
                        lastOne.arrow.el.remove();
                    }

                    // var diffs = [];
                    // while (lastOne.time < timeStamp + TIMING_WINDOW) {
                    //     if (!lastOne.attempted) {
                    //         diffs.push({
                    //             diff: Math.abs(lastOne.time - timeStamp),
                    //             ref: lastOne.arrow
                    //         })
                    //         lastOne.attempted = true;
                    //     }
                    //     pointer--;
                    //     lastOne = thisChart[pointer];
                    // }
                    // if (!diffs.length) {
                    //     return;
                    // }
                    // var leastIndex;
                    // var least = TIMING_WINDOW;
                    // for (var i = 0; i < diffs.length; i++) {
                    //     if (diffs.diff < least) {
                    //         leastIndex = i;
                    //         least = diffs.diff;
                    //     }
                    // }
                    // console.log(`diff: ${diffs[0].diff}`);
                    // diffs[0].ref.el.remove();

                    // // score things
                });
            }
            
            $scope.runInit = function () {
                console.log('arrows starting', Date.now());
                ArrowFactory.resumeTimeline();

                tone.start();
                startTime = Date.now() - currentSong.offset*1000;
                addListener();
            }




            // var player = new Tone.Player("/audio/321 STARS.mp3").toMaster();
            // Tone.Buffer.onload = function() {
            //     player.start("+1.8");
            //     Tone.Transport.start(".67239", "0:0:0");
            // }
            //
            // Tone.Transport.bpm.value = 191.94;


            });



        }
    });
});

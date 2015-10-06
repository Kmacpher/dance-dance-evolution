app.config(function($stateProvider) {
    $stateProvider.state('animation', {
        url: '/animation',
        templateUrl: 'js/animation/animation.html',
        controller: function($scope, ArrowFactory, ToneFactory) {

            var testChart = [
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '1']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['2', '0', '0', '0']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['3', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '2']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '1', '3'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '2', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '3', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['2', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['3', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '2'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '3']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '1', '0', '1']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['1', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['1', '1', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '1', '0']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '1'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '2', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '3', '0', '0'],
                    ['0', '0', '0', '0']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['0', '0', '0', '1']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1']
                ],
                [
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1'],
                    ['0', '0', '1', '0'],
                    ['1', '0', '0', '1']
                ],
                [
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '1', '0', '0'],
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0']
                ],
                [
                    ['0', '0', '0', '1'],
                    ['0', '1', '0', '0'],
                    ['1', '0', '0', '0'],
                    ['0', '0', '2', '0']
                ],
                [
                    ['0', '0', '0', '0'],
                    ['0', '0', '0', '0'],
                    ['0', '0', '3', '0'],
                    ['0', '0', '0', '0'],
                    [';']
                ]
            ];
            var $body = $(document.body)
            var tone = new ToneFactory("/audio/321 STARS.mp3", 191.94, 2.7-0.67239, ".67239");

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
            var TIMING_WINDOW = 0.18;
            var startTime = 0;
            ArrowFactory.makeTimeline();
            var charts = tone.timeCharts(testChart);
            console.log(charts);
            var addListener = function () {
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
                ArrowFactory.resumeTimeline();
                tone.start();
                startTime = Date.now() + 880;
                addListener();
            }




            // var player = new Tone.Player("/audio/321 STARS.mp3").toMaster();
            // Tone.Buffer.onload = function() {
            //     player.start("+1.8");
            //     Tone.Transport.start(".67239", "0:0:0");
            // }
            //
            // Tone.Transport.bpm.value = 191.94;


            // });



        }
    });
});

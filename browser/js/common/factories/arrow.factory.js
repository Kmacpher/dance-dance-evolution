/* global $ TweenMax */


app.factory('ArrowFactory', function () {
    var Arrow = function (direction, player, color) {
        this.direction = direction;
        // this.el = $(`<div class="arrow"></div>`);
        this.el = $(`<div class="arrow activeArrow"><img src="/img/arrows/${direction}-${color}.png"></img></div>`);
        $(`.player-${player} .${direction}-arrow-col`).append(this.el);
    };

    var tl;

    /** Arrow constants */
    Arrow.SPEED_1X = 100;
    /** */





    /** Arrow settings (chosen by the player) */
    Arrow.speedModifier = 1;
    /** */

    Arrow.speed = Arrow.SPEED_1X / Arrow.speedModifier;

    Arrow.makeTimeline = function (params) {
        if (!tl) tl = new TimelineLite(params);
        tl.pause();
        TweenMax.delayedCall(0, TweenMax.globalTimeScale, [1])
    };

    Arrow.resumeTimeline = function () {
        tl.resume();
    };

    Arrow.killTimeline = function () {
        tl.pause(0, true);      // sets steps back to beginning
        tl.remove();
    }

    Arrow.setSpeed = function (num) {
        Arrow.speedModifier = num;
    }

    Arrow.prototype.animate = function (bpm, chIndex, mIndex, mNotes) {
        if (!tl) throw Error('Make a timeline first');
        var animationLength = (Arrow.speed * 4)/bpm;
        var measureTime = 240 / bpm;
        var timePerBeat = measureTime / mNotes;
        var startTime = chIndex * measureTime + mIndex * timePerBeat;
        this.startTime = startTime;
        tl.to(this.el, animationLength * 1.5, {top: '-50vh', ease:Linear.easeNone}, startTime);
    }

    Arrow.addStops = function (stops, animationOffset, beatTime) {
        stops.forEach(stop => {
            this.addStop(animationOffset + beatTime * stop.beat, stop.duration);
        })
    }

    Arrow.addBpmChanges = function (bpms, animationOffset, beatTime) {
        bpms.forEach(bpm => {
            if (bpm.beat === 0) return;
            this.addBPMChange(animationOffset + beatTime * bpm.beat, bpm.bpm/bpms[0].bpm);
        })
    }


    Arrow.addStop = function(timestamp, duration) {
        tl.addPause(timestamp, TweenMax.delayedCall, [duration, function(){tl.play()}]);
    }

    Arrow.addBPMChange = function(timestamp, tempoScale) {
        tl.add(function () {
            tl.timeScale(tempoScale);
        }, timestamp);
    }


    var indexToDir = {
      '0': 'left',
      '1': 'down',
      '2': 'up',
      '3': 'right'
    };


    Arrow.makeArrows = function (stepChart, bpm, players) {

        var obj = {
            right: [],
            left: [],
            up:[],
            down: []
        }
        stepChart.forEach(function (measure, measureIndex) {
            var notes = measure.length;
            measure.forEach(function (line, lineIndex) {
                line.forEach(function (maybeArrow, index) {
                    if (maybeArrow === "1" || maybeArrow === "2") { //FIX to account for freezes : D
                        var dir = indexToDir[index];
                        var color;
                        var note = lineIndex / notes;

                        if ((note * 4) % 1 === 0) color = 'purple';
                        else if (((note - 1/8)*4) % 1 === 0) color = 'orange';
                        else if (((note - 1/16)*8) % 1 === 0) color = 'red';
                        else color = 'green';
                        
                        var arrow = new Arrow(dir, players, color);
                        
                        arrow.animate(bpm, measureIndex, lineIndex, notes);
                        obj[indexToDir[index]].push(arrow);
                    }
                });
            });
        });

        return obj;
    };

    return Arrow;

})

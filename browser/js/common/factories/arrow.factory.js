/* global $ TweenMax */


app.factory('ArrowFactory', function () {
    var Arrow = function (direction, player, color) {
        this.direction = direction;
        // this.el = $(`<div class="arrow"></div>`);
        this.el = $(`<div class="arrow activeArrow"><img src="/img/arrows/${direction}-${color}.png"></img></div>`);
        $(`.player-${player} .${direction}-arrow-col`).append(this.el);
    };

    var FreezeArrow = function (direction, player, color) {
        this.direction = direction;
        // this.el = $(`<div class="arrow"></div>`);
        this.el = $(`<div class="arrow"><img src="/img/arrows/${direction}-${color}.png"></img></div>`);
        this.el.append($(`<div class="freeze"></div>`));
        $(`.player-${player} .${direction}-arrow-col`).append(this.el);
    };

    FreezeArrow.prototype = Object.create(Arrow.prototype);

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
        //console.log('animationLength is', animationLength);
        //console.log('measureTime is ',measureTime)

        tl.to(this.el, animationLength * 10, {top: '-900vh', ease:Linear.easeNone}, startTime);
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


    Arrow.makeArrows = function (stepChart, bpm, config, currentSong, player) {

        Arrow.makeTimeline();

        var obj = {
            right: [],
            left: [],
            up:[],
            down: []
        };
        var freezes = {
            right: {
                firstBeat: null
            },
            left: {
                firstBeat: null
            },
            up: {
                firstBeat: null
            },
            down: {
                firstBeat: null
            }
        };
        stepChart.forEach(function (measure, measureIndex) {
            var notes = measure.length;
            measure.forEach(function (line, lineIndex) {
                line.forEach(function (maybeArrow, index) {
                    var dir = indexToDir[index];
                    var thisBeat = measureIndex * 4 + (lineIndex / notes) * 4;
                    if (maybeArrow === "1" || maybeArrow === "2") { //FIX to account for freezes : D
                        var color;
                        var note = lineIndex / notes;

                        if ((note * 4) % 1 === 0) color = 'purple';
                        else if (((note - 1/8)*4) % 1 === 0) color = 'orange';
                        else if (((note - 1/16)*8) % 1 === 0) color = 'red';
                        else color = 'green';
                        var arrow;
                        if (maybeArrow === "1") {
                            arrow = new Arrow(dir, player, color);
                        } else if (maybeArrow === "2") {
                            freezes[dir].firstBeat = thisBeat;
                            arrow = new FreezeArrow(dir, player, color);
                            freezes[dir].arrow = arrow;
                        }
                        arrow.animate(bpm, measureIndex, lineIndex, notes);
                        obj[indexToDir[index]].push(arrow);
                    } else if (maybeArrow === "3") {
                        var length = config.BEAT_VH * (thisBeat - freezes[dir].firstBeat);
                        freezes[dir].arrow.el[0].children[1].style.height = `${length}vh`;
                    }
                });
            });
        });

        Arrow.addStops(currentSong.stops, config.ARROW_TIME, config.BEAT_TIME);
        Arrow.addBpmChanges(currentSong.bpms, config.ARROW_TIME, config.BEAT_TIME, currentSong.stops);

        return obj;
    };

    return Arrow;

})

app.factory('ArrowFactory', function () {
    var Arrow = function (direction, player) {
        this.direction = direction;
        // this.el = $(`<div class="arrow"></div>`);
        this.el = $(`<div class="arrow"><img src="/img/${direction}.svg"></img></div>`);
        $(`.player-${player} .${direction}-arrow-col`).append(this.el);
    };

    var tl;

    Arrow.makeTimeline = function (params) {
        if (!tl) tl = new TimelineLite(params);
        tl.pause();
    };

    Arrow.resumeTimeline = function () {
        tl.resume();
    }

    Arrow.prototype.animate = function (bpm, chIndex, mIndex, mNotes) {
        if (!tl) throw Error('Make a timeline first');
        var animationLength = (150 * 4)/bpm;
        var measureTime = 240 / bpm;
        var timePerBeat = measureTime / mNotes;
        var startTime = chIndex * measureTime + mIndex * timePerBeat;
        this.startTime = startTime;
        tl.to(this.el, animationLength * 1.5, {top: '-50vh', ease:Linear.easeNone}, startTime);
        // console.log(`top ${animationLength * 1.5}s ease linear ${startTime}s`)
        // this.el.css('transition', `top ${animationLength * 1.5}s linear ${startTime}s`);
        // var el = this.el;
        // setTimeout(function () {
        //     el.css('top', '-50vh');
        // }, 0)
        // var stopPos;
        // setTimeout(function () {
        //     var pos = el.css('top');
        //     console.log(pos);
        //     stopPos = pos;
        //     el.css('top', pos);
        // }, startTime * 1000 + 1500)

        // setTimeout(function () {
        //     el.css('top', `${stopPos} + `);
        // }, startTime * 1000 + 3000)
        // this.el.css('top', '10vh');
        // .to(this.el, animationLength/2, {top: '-50vh', ease:Linear.easeNone}, startTime);
    }

    Arrow.indexToDir = function (n) {
        var dict = {
            0: 'left',
            1: 'down',
            2: 'up',
            3: 'right'
        }
        return dict[n]
    }

    Arrow.ARROW_KEYS = {
      left: '37',
      down: '40',
      up: '38',
      right: '39'
    };

    return Arrow;
})

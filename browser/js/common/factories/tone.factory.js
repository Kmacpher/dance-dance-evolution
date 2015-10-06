app.factory('ToneFactory', function (ArrowFactory) {
    var ToneFactory = function (path, bpm, syncOffset, measureOffset) {
        this.path = path;
        this.bpm = bpm;
        this.syncOffset = syncOffset;
        this.measureOffset = measureOffset;
        this.player = new Tone.Player(this.path).toMaster();
        this.transport = Tone.Transport;

        this.transport.bpm.value = this.bpm;

        Tone.Buffer.onload = function () {
            //console.log('Buffer loaded!');
        }

    }

    ToneFactory.prototype.start = function () {
        console.log('in start', this.syncOffset);
        console.log('tone starting', Date.now());
        this.player.start(`+${this.syncOffset}`);
        // this.transport.start(this.measureOffset, "0:0:0");
    }

    var indexToDir = {
        0: 'left',
        1: 'down',
        2: 'up',
        3: 'right'
    }

    ToneFactory.prototype.timeCharts = function (stepChart) {
        var bpm = this.bpm;
        var measureTime = 1/(this.bpm/60/4);    // number of seconds per measure
        var timeSoFar = this.syncOffset;

        var obj = {
            right: [],
            left: [],
            up:[],
            down: []
        }
        stepChart.forEach(function (measure, measureIndex) {
            var notes = measure.length;
            var noteTime = measureTime / measure.length;
            measure.forEach(function (line, lineIndex) {
                var timeStamp = measureTime*measureIndex + noteTime*lineIndex + timeSoFar;
                line.forEach(function (maybeArrow, index) {
                    if (maybeArrow !== "0") { //FIX to account for freezes : D
                        var dir = ArrowFactory.indexToDir(index);
                        var arrow = new ArrowFactory(dir, 1);
                        arrow.animate(bpm, measureIndex, lineIndex, notes);
                        obj[indexToDir[index]].unshift({ arrow: arrow, time: timeStamp, attempted: false });
                    }
                });
            });
        })

        return obj;
    }


    return ToneFactory;
})

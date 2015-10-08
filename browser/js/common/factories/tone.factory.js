/* global Tone */

app.factory('ToneFactory', function () {
    var ToneFactory = function (path, bpm, offset, config) {

        this.config = config;
        this.path = path;
        this.bpm = bpm;
        this.syncOffset = config.ARROW_SPEED/bpm + Number(offset);
        this.player = new Tone.Player(this.path).toMaster();
        this.transport = Tone.Transport;
        this.transport.bpm.value = this.bpm;
        this.buffer = Tone.Buffer;

    }

    ToneFactory.prototype.start = function () {
        this.player.start(`+${this.syncOffset}`);
        // this.transport.start(this.measureOffset, "0:0:0");
    }


    return ToneFactory;
})

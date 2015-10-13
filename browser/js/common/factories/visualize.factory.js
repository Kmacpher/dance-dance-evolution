app.factory('VizFactory', function ($http) {

    var VizFactory = {};

    VizFactory.getAnalyzerNode = function (player) {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        var analyser = audioCtx.createAnalyser();
        var distortion = audioCtx.createWaveShaper();
        var gainNode = audioCtx.createGain();
        var biquadFilter = audioCtx.createBiquadFilter();
        var sandstormBuffer;

        // var source = context.createBufferSource();
        $http.get('/audio/Sandstorm.mp3', {responseType: 'arrayBuffer'})
        .then(function (response) {
            audioCtx.decodeAudioData(response.data, function (buffer) {
                sandstormBuffer = buffer;
            })
        })
    }



    return VizFactory;
})

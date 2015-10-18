app.config(function($stateProvider) {

    $stateProvider.state('songHighScores', {
        url: '/songHighScores/:songId',
        templateUrl: 'js/songHighScores/songHighScores.html',
        controller: 'SongHighScoresCtrl',
        // params: {
        //     songId: null
        // },
        resolve: {
            highScores: function(ScoreFactory, $stateParams) {
                return ScoreFactory.getHighScores($stateParams.songId);
            },
            song: function($stateParams, SongFactory) {
                return SongFactory.getSongById($stateParams.songId);
            }
        }
    });

});

app.controller('SongHighScoresCtrl', function($scope, ScoreFactory, $state, keyConfigFactory, highScores, song, ToneFactory, $stateParams) {

    $scope.highScores = highScores;
    $scope.song = song;

    function play(fx) {
      ToneFactory.play(fx);
    };

     function back(fx) {
      ToneFactory.back(fx);
    };

    function leaveHighScores(event) {
        var button = keyConfigFactory.getButton(event);
        if (!button) return;
        if (button.name === "escape") {
            play('back');
            window.removeEventListener('keydown', leaveHighScores);
            window.removeEventListener('gamepadbuttondown', leaveHighScores);
            ScoreFactory.resetPlayers();
            $state.go('mainMenu');
        }
        else if (button.name === "enter") {
            play('start');
            window.removeEventListener('keydown', leaveHighScores);
            window.removeEventListener('gamepadbuttondown', leaveHighScores);
            ScoreFactory.resetPlayers();
            $state.go('chooseSong', {songId: $stateParams.songId});
        }
    }

    window.addEventListener('keydown', leaveHighScores);
    window.addEventListener('gamepadbuttondown', leaveHighScores);

});
 
app.config(function($stateProvider) {

    $stateProvider.state('results', {
        url: '/results',
        templateUrl: 'js/results/results.html',
        controller: 'ResultsCtrl',
        resolve: {
            player1: function(ScoreFactory) {
                return ScoreFactory.getPlayer1();
            },
            percent1: function(ScoreFactory) {
                return ScoreFactory.getPercent1();
            },
            score1: function(ScoreFactory) {
                return ScoreFactory.finalScore1();
            }
        }
    });

});

app.controller('ResultsCtrl', function($scope, player1, percent1, score1, ScoreFactory, $state, ToneFactory) {
    $scope.player1 = player1;
    $scope.percent1 = percent1;
    $scope.score1 = parseInt(score1);
    ScoreFactory.resetPlayer1();

    function play(fx) {
      ToneFactory.play(fx);
    };

    window.addEventListener('keydown', leaveResults);

    function leaveResults(event) {
        if (event.keyCode === 27) {
            play('back');
            window.removeEventListener('keydown', leaveResults);
            $state.go('mainMenu');
        };
    }
});
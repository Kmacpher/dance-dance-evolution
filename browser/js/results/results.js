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

app.controller('ResultsCtrl', function($scope, player1, percent1, score1, ScoreFactory, $state) {
    $scope.player1 = player1;
    $scope.percent1 = percent1;
    $scope.score1 = parseInt(score1);
    ScoreFactory.resetPlayer1();

    window.addEventListener('keydown', leaveResults);

    function leaveResults(event) {
      console.log('key hit')
        if (event.keyCode === 27) {
            window.removeEventListener('keydown', leaveResults);
            $state.go('mainMenu');
        };
    }
});
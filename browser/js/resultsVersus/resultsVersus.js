app.config(function($stateProvider) {

    $stateProvider.state('resultsVersus', {
        url: '/resultsVersus',
        templateUrl: 'js/resultsVersus/resultsVersus.html',
        controller: 'ResultsVersusCtrl',
        resolve: {
            player1: function(ScoreFactory) {
                return ScoreFactory.getPlayer(1);
            },
            player2: function(ScoreFactory) {
                return ScoreFactory.getPlayer(2);
            },
            percent1: function(ScoreFactory) {
                return ScoreFactory.getPercent(1);
            },
            percent2: function(ScoreFactory) {
                return ScoreFactory.getPercent(2);
            },
            score1: function(ScoreFactory) {
                return ScoreFactory.finalScore(1);
            },
            score2: function(ScoreFactory) {
                return ScoreFactory.finalScore(2);
            }
        }
    });

});

app.controller('ResultsVersusCtrl', function($scope, player1, player2, percent1, percent2, score1, score2, ScoreFactory, $state, ToneFactory, keyConfigFactory) {
    $scope.player1 = player1;
    console.log("$scope.player1; ", $scope.player1)
    $scope.percent1 = percent1;
    console.log("$scope.percent1; ", $scope.percent1)
    $scope.score1 = parseInt(score1);
    console.log("$scope.score1; ", $scope.score1)
    $scope.player2 = player2;
    console.log("$scope.player2; ", $scope.player2)
    $scope.percent2 = percent2;
    console.log("$scope.percent2; ", $scope.percent2)
    $scope.score2 = parseInt(score2);
    console.log("$scope.score2; ", $scope.score2)

    function play(fx) {
      ToneFactory.play(fx);
    };

    function leaveResults(event) {
        var button = keyConfigFactory.getButton(event);
        if (!button) return;
        if (button.name === "escape") {
            play('back');
            window.removeEventListener('keydown', leaveResults);
            window.removeEventListener('gamepadbuttondown', leaveResults);
            ScoreFactory.resetPlayers();
            $state.go('mainMenu');
        }
        else if (button.name === "enter") {
            play('start');
            window.removeEventListener('keydown', leaveResults);
            window.removeEventListener('gamepadbuttondown', leaveResults);
            ScoreFactory.resetPlayers();
            $state.go('chooseSong');
        }
    }

    window.addEventListener('keydown', leaveResults);
    window.addEventListener('gamepadbuttondown', leaveResults);

});

app.config(function ($stateProvider) {

    $stateProvider.state('results', {
        url: '/results',
        templateUrl: 'js/results/results.html',
        controller: 'ResultsCtrl',
        resolve: {
          results: function(ScoreFactory) {
            return ScoreFactory.finalScore();
          },
          maxCombo: function(ScoreFactory) {
            return ScoreFactory.getMaxCombo();
          }
        }
    });

});

app.controller('ResultsCtrl', function ($scope, $state, results, maxCombo) {
  $scope.results = results;
  $scope.maxCombo = maxCombo;

  console.log("This are the results: ", results);
  console.log("Your max combo was ", maxCombo);


});

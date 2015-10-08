app.config(function ($stateProvider) {

    $stateProvider.state('results', {
        url: '/results',
        templateUrl: 'js/results/results.html',
        controller: 'ResultsCtrl',
        resolve: {
          results: function($stateParams) {
            // return with a promise that will resolve with the results from the ScoreFactory;
          }
        }
    });

});

app.controller('ResultsCtrl', function ($scope, $state, results) {
  $scope.results = results;
  console.log("This are the results: ", results);

});

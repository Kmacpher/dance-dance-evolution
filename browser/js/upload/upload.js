app.config(function($stateProvider) {

    $stateProvider.state('upload', {
        url: '/upload',
        templateUrl: 'js/upload/upload.html',
        controller: 'uploadCtrl'
    });

});

app.controller('uploadCtrl', function ($scope, Upload, $state) {
    // upload later on form submit or something similar
    $scope.submit = function() {
      if ($scope.song && !$scope.song.$error && $scope.sm && !$scope.sm.$error) {
        $scope.upload($scope.song, $scope.sm);
      }
    };


    // upload on file select or drop
    $scope.upload = function (song, sm) {
      console.log('song', song);
      console.log('sm file', sm);
        Upload.upload({
            url: '/api/songs/upload/',
            method: 'POST',
            data: {song: song, sm: sm}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.song.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.song.name);
        })
        .then(function () {
            $state.go('home');
        });
    };
});
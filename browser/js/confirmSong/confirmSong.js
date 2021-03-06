app.config(function ($stateProvider) {

    $stateProvider.state('confirmSong', {
        url: '/confirmSong',
        templateUrl: 'js/confirmSong/confirmSong.html',
        controller: 'ConfirmSongCtrl',
        resolve: {
          theSong: function(SongFactory, $stateParams) {
            return SongFactory.getSongById($stateParams.id);
          }
        }
    });

});

app.controller('ConfirmSongCtrl', function ($scope, $state, theSong) {
  $scope.song = theSong;
  console.log("This is the song: ", theSong);

});

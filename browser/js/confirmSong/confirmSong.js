app.config(function ($stateProvider) {

    $stateProvider.state('confirmSong', {
        url: '/confirmSong/:songId',
        templateUrl: 'js/confirmSong/confirmSong.html',
        controller: 'ConfirmSongCtrl'
    });

});

app.controller('ConfirmSongCtrl', function ($scope, AuthService, $state) {


});

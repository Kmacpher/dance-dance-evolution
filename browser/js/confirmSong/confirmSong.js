app.config(function ($stateProvider) {

    $stateProvider.state('confirmSong', {
        url: '/confirmSong',
        templateUrl: 'js/confirmSong/confirmSong.html',
        controller: 'ConfirmSongCtrl'
    });

});

app.controller('ConfirmSongCtrl', function ($scope, AuthService, $state) {


});

app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('mainMenu');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };


    function onArrowKey(event) {
        if(event.keyCode === 27) {
            window.removeEventListener('keydown', onArrowKey);
            $state.go('home');
        }
    }

    $(document).on('keydown', onArrowKey);

});

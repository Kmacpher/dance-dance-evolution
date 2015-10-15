app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, AuthService, $state, keyConfigFactory) {

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
        var button = keyConfigFactory(event);
        if (button.name === 'escape') {
            $(document).off('keydown');
            $(document).off('gamepadbuttondown');
            $state.go('home');
        };
    };

    $(document).on('keydown', onArrowKey);
    $(document).on('gamepadbuttondown', onArrowKey);



});

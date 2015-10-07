app.directive('loading', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/loading/loading.html',
        link: function (scope) {}
    }
});

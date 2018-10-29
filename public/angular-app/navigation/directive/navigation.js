angular.module('meanhotel').directive('navigation', navigation);

function navigation () {
    return {
        restrict: 'E',
        templateUrl: 'angular-app/navigation/directive/navigation.html'
    };
};